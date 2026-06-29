# app/main.py
from flask import Blueprint, render_template, request, jsonify, current_app
from flask_login import login_required, current_user
from app.crew import MultiplexCrew
from app.tmdb import discover_movies
from app.translate import translate_text
from app.models import db, History, Preference
import secrets
import os
import logging

logger = logging.getLogger(__name__)
main_bp = Blueprint('main', __name__)

# Store active jobs globally
active_jobs = {}

def save_history(user_id, content_type, title, content, language):
    """Save generated content to user history"""
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
        if content_type == 'movie' and current_app.config.get('USE_TMDB', True):
            tmdb_key = os.getenv('TMDB_API_KEY')
            if tmdb_key:
                movies = discover_movies(age_group, language)
                if movies:
                    movie = movies[0]
                    title = movie.get('title', 'Unknown Movie')
                    overview = movie.get('overview', 'No description available.')
                    if language != 'en' and overview:
                        try:
                            overview = translate_text(overview, language)
                        except:
                            pass
                    
                    result = {
                        'type': 'movie',
                        'theme': title,
                        'content': f"**{title}**\n\n{overview}",
                        'from_tmdb': True
                    }
                    
                    if user_id:
                        save_history(user_id, 'movie', title, overview, language)
                    
                    return jsonify({
                        'job_id': 'tmdb',
                        'status': 'completed',
                        'result': result
                    })
        
        # Fallback to AI generation
        crew = MultiplexCrew()
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
        
    except Exception as e:
        logger.error(f"Generation error: {str(e)}")
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
            if job.get('user_id') and result.get('type'):
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
    langs = os.getenv('SUPPORTED_LANGUAGES', 'en,hi,es,fr,de,zh').split(',')
    lang_names = {
        'en': 'English',
        'hi': 'Hindi',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'zh': 'Chinese',
        'ja': 'Japanese',
        'ko': 'Korean',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'it': 'Italian'
    }
    return jsonify([
        {'code': l.strip(), 'name': lang_names.get(l.strip(), l.strip())}
        for l in langs if l.strip()
    ])

@main_bp.route('/profile')
@login_required
def profile():
    history = History.query.filter_by(
        user_id=current_user.id
    ).order_by(History.created_at.desc()).limit(50).all()
    return render_template('profile.html', user=current_user, history=history)

@main_bp.route('/api/history')
@login_required
def get_history():
    history = History.query.filter_by(
        user_id=current_user.id
    ).order_by(History.created_at.desc()).limit(50).all()
    
    return jsonify([{
        'id': h.id,
        'content_type': h.content_type,
        'title': h.title,
        'content': h.content[:200],
        'language': h.language,
        'created_at': h.created_at.isoformat()
    } for h in history])