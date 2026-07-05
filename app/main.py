import os
import sys
import logging
import secrets
import uuid
from flask import Flask, Blueprint, render_template, request, jsonify, current_app
from flask_login import login_required, current_user


from app.crew import MultiplexCrew
from app.models import db, History

# Ensure local application directory context is sound
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


logger = logging.getLogger(__name__)

main_bp = Blueprint('main', __name__)
app = Flask(__name__)
app.register_blueprint(main_bp)
# Keep crew_instance as None globally, or initialize it lazily when needed
crew_instance = None 
# Store active jobs globally
active_jobs = {}

# 3. Defensive global availability flags
CREW_AVAILABLE = False
TMDB_AVAILABLE = False
TRANSLATE_AVAILABLE = False
DB_AVAILABLE = False

def get_crew_instance():
    global crew_instance, CREW_AVAILABLE
    if crew_instance is None:
        try:
            from app.crew import MultiplexCrew
            crew_instance = MultiplexCrew()
            # Only set to True if initialization succeeds
            if crew_instance.crewai_available:
                CREW_AVAILABLE = True
                logger.info("✅ MultiplexCrew initialized lazily successfully")
            else:
                CREW_AVAILABLE = False
                logger.warning("⚠️ MultiplexCrew initialized, but dependencies (CrewAI/LangChain) are missing.")
        except Exception as e:
            logger.error(f"❌ Lazy Crew initialization failed: {str(e)}")
            CREW_AVAILABLE = False
    return crew_instance

try:
    from app.models import db, History, Preference
    DB_AVAILABLE = True
except ImportError as e:
    logger.warning(f"⚠️ Database not available: {e}")
    DB_AVAILABLE = False


try:
    from app.tmdb import discover_movies
    TMDB_AVAILABLE = True
except ImportError as e:
    logger.warning(f"⚠️ TMDB not available: {e}")
    TMDB_AVAILABLE = False

try:
    from app.translate import translate_text, get_supported_languages
    TRANSLATE_AVAILABLE = True
    logger.info("✅ Translation module imported successfully")
except ImportError as e:
    logger.warning(f"⚠️ Translation not available: {e}")
    TRANSLATE_AVAILABLE = False

def save_history(user_id, content_type, title, content, language):
    """Save generated content to user history"""
    if not DB_AVAILABLE:
        return
    
    try:
        history = History(
            user_id=user_id,
            content_type=content_type,
            title=title[:200] if title else 'Untitled',
            content=content[:5000] if content else '',
            language=language or 'en'
        )
        db.session.add(history)
        db.session.commit()
        logger.info(f"History saved for user {user_id}")
    except Exception as e:
        logger.error(f"Error saving history: {str(e)}")
        db.session.rollback()

@main_bp.route('/')
def index():
    return render_template('index.html')

@main_bp.route('/health')
def health_check():
    """Health check endpoint for Render."""
    # Secure the health check endpoint
    secret_header = request.headers.get('X-Render-Health-Check-Key')
    expected_secret = os.getenv('RENDER_HEALTH_CHECK_KEY')
    if not expected_secret or secret_header != expected_secret:
        return jsonify({"status": "forbidden"}), 403
    return jsonify({"status": "healthy"}), 200

@main_bp.route('/api/generate', methods=['POST'])
def generate():
    try:
        data = request.json
        content_type = data.get('type', 'movie')
        age_group = data.get('age_group', 'young_adult')
        language = data.get('language', 'en')
        extra = data.get('extra', {})
        
        logger.info(f"Generation request: type={content_type}, age={age_group}, lang={language}")
        
        # Check if user is logged in
        user_id = current_user.id if current_user.is_authenticated else None
        
        # If movie and TMDB is enabled, fetch real data
        if content_type == 'movie' and TMDB_AVAILABLE and current_app.config.get('USE_TMDB', True):
            tmdb_key = os.getenv('TMDB_API_KEY')
            if tmdb_key:
                movies = discover_movies(age_group, language)
                if movies:
                    movie = movies[0]
                    title = movie.get('title', 'Unknown Movie')
                    overview = movie.get('overview', 'No description available.')
                    
                    if language != 'en' and TRANSLATE_AVAILABLE and overview:
                        try:
                            overview = translate_text(overview, language)
                        except Exception as e:
                            logger.warning(f"Translation error: {str(e)}")
                    
                    result = {
                        'type': 'movie',
                        'theme': title,
                        'content': f"**{title}**\n\n{overview}",
                        'from_tmdb': True
                    }
                    
                    if user_id and DB_AVAILABLE:
                        save_history(user_id, 'movie', title, overview, language)
                    
                    return jsonify({
                        'job_id': 'tmdb',
                        'status': 'completed',
                        'result': result
                    })
        
        # Fallback to AI generation
        if CREW_AVAILABLE:
            # Use CrewAI for generation
            crew = get_crew_instance()
            queue = crew.generate_async(content_type, age_group, language, extra)
            job_id = secrets.token_hex(8)
            active_jobs[job_id] = {
                'queue': queue,
                'status': 'processing',
                'result': None,
                'user_id': user_id,
                'content_type': content_type,
                'language': language
            }
            return jsonify({'job_id': job_id, 'status': 'processing'})
        
        # If we reach here, it means neither TMDB nor CrewAI was available to handle the request.
        logger.error("No generation method available (TMDB or CrewAI).")
        return jsonify({'error': 'No generation service is available.', 'status': 'error'}), 503
      
        
    except Exception as e:
        logger.error(f"Generation error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e), 'status': 'error'}), 500

@main_bp.route('/api/result/<job_id>')
def get_result(job_id):
    try:
        job = active_jobs.get(job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        queue = job['queue']
        
        if not queue.empty():
            result = queue.get_nowait()
            job['result'] = result
            job['status'] = 'completed'
            
            # Save to history if user is logged in
            if job.get('user_id') and DB_AVAILABLE and result.get('type'):
                save_history(
                    job['user_id'],
                    result.get('type'),
                    result.get('theme', ''),
                    result.get('content', ''),
                    job.get('language', 'en')
                )
            
            return jsonify({'status': 'completed', 'result': result})
        
        return jsonify({'status': 'processing'})
        
    except Exception as e:
        logger.error(f"Result fetch error: {str(e)}")
        return jsonify({'error': str(e), 'status': 'error'}), 500

@main_bp.route('/api/languages')
def get_languages():
    """Get supported languages from LibreTranslate or fallback"""
    try:
        if TRANSLATE_AVAILABLE:
            # Try to get languages from LibreTranslate
            libre_langs = get_supported_languages()
            
            lang_names = {
                'en': 'English', 'hi': 'Hindi', 'es': 'Spanish',
                'fr': 'French', 'de': 'German', 'zh': 'Chinese',
                'ja': 'Japanese', 'ko': 'Korean', 'pt': 'Portuguese',
                'ru': 'Russian', 'it': 'Italian', 'ar': 'Arabic',
                'bn': 'Bengali', 'te': 'Telugu', 'ta': 'Tamil',
                'ur': 'Urdu', 'pa': 'Punjabi', 'gu': 'Gujarati'
            }
            
            if libre_langs and len(libre_langs) > 1:
                return jsonify([
                    {'code': lang, 'name': lang_names.get(lang, lang.upper())}
                    for lang in libre_langs if lang in lang_names
                ])
    except Exception as e:
        logger.warning(f"Error getting languages: {str(e)}")
    
    # Fallback to default languages
    default_langs = os.getenv('SUPPORTED_LANGUAGES', 'en,hi,es,fr,de,zh').split(',')
    lang_names = {
        'en': 'English', 'hi': 'Hindi', 'es': 'Spanish',
        'fr': 'French', 'de': 'German', 'zh': 'Chinese'
    }
    return jsonify([
        {'code': l.strip(), 'name': lang_names.get(l.strip(), l.strip())}
        for l in default_langs if l.strip()
    ])

@main_bp.route('/profile')
@login_required
def profile():
    if not DB_AVAILABLE:
        return render_template('profile.html', user=current_user, history=[])
    
    history = History.query.filter_by(
        user_id=current_user.id
    ).order_by(History.created_at.desc()).limit(50).all()
    return render_template('profile.html', user=current_user, history=history)

@main_bp.route('/api/history')
@login_required
def get_history():
    if not DB_AVAILABLE:
        return jsonify([])
    
    history = History.query.filter_by(
        user_id=current_user.id
    ).order_by(History.created_at.desc()).limit(50).all()
    
    return jsonify([{
        'id': h.id,
        'content_type': h.content_type,
        'title': h.title,
        'content': h.content[:200] if h.content else '',
        'language': h.language,
        'created_at': h.created_at.isoformat() if h.created_at else None
    } for h in history])

@main_bp.route('/api/translation/test', methods=['GET'])
def test_translation():
    """Test translation endpoint"""
    if not TRANSLATE_AVAILABLE:
        return jsonify({'status': 'error', 'message': 'Translation not available'})
    
    try:
        test_text = "Hello, this is a test translation."
        translated = translate_text(test_text, 'hi')
        return jsonify({
            'status': 'success',
            'original': test_text,
            'translated': translated,
            'target_language': 'hi'
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})
    