# app/main.py
import os
import sys
import logging
import secrets
import uuid
import json

from flask import Flask, Blueprint, render_template, request, jsonify, current_app
from flask_login import login_required, current_user

# Ensure local application directory context is sound
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

logger = logging.getLogger(__name__)

# 1. ALWAYS Initialize your blueprint variable first
main_bp = Blueprint("main", __name__)

# 2. Setup Redis connection for job management
try:
    import redis
    redis_url = os.getenv('REDIS_URL')
    redis_client = redis.from_url(redis_url) if redis_url else None
except ImportError:
    redis_client = None
active_jobs = {}

crew_instance = None

# Defensive global availability flags
CREW_AVAILABLE = False
TMDB_AVAILABLE = False
TRANSLATE_AVAILABLE = False
DB_AVAILABLE = False

# --- SAFE IMPORTS WITH RUNTIME CRASH-PROTECTION ---
try:
    from app.models import db, History

    DB_AVAILABLE = True
except Exception as e:
    logger.warning(f"⚠️ Database models not available: {e}")

try:
    from app.tmdb import discover_movies

    TMDB_AVAILABLE = True
except Exception as e:
    logger.warning(f"⚠️ TMDB not available: {e}")

try:
    from app.translate import translate_text, get_supported_languages

    TRANSLATE_AVAILABLE = True
    logger.info("✅ Translation module imported successfully")
except Exception as e:
    logger.warning(f"⚠️ Translation not available: {e}")


# --- LAZY CREW INITIALIZER (Prevents startup validation crashes) ---
def get_crew_instance():
    global crew_instance, CREW_AVAILABLE
    if crew_instance is None:
        try:
            from app.crew import MultiplexCrew

            crew_instance = MultiplexCrew()
            CREW_AVAILABLE = True
            logger.info("✅ MultiplexCrew initialized lazily successfully")
        except Exception as e:
            logger.error(f"❌ Lazy Crew initialization failed: {str(e)}")
            CREW_AVAILABLE = False
    return crew_instance


# --- HELPER FUNCTIONS ---
def save_history(user_id, content_type, title, content, language):
    """Save generated content to user history safely"""
    if not DB_AVAILABLE:
        return
    try:
        history = History(
            user_id=user_id,
            content_type=content_type,
            title=title[:200] if title else "Untitled",
            content=content[:5000] if content else "",
            language=language or "en",
        )
        db.session.add(history)
        db.session.commit()
        logger.info(f"History saved for user {user_id}")
    except Exception as e:
        logger.error(f"Error saving history: {str(e)}")
        db.session.rollback()


# -----------------------------------------------------------------
# ROUTES SECTION
# -----------------------------------------------------------------


@main_bp.route("/")
def index():
    return render_template("index.html")


@main_bp.route("/health")
def health_check():
    """Health check endpoint for Render."""
    secret_header = request.headers.get("X-Render-Health-Check-Key")
    expected_secret = os.getenv("RENDER_HEALTH_CHECK_KEY")
    if not expected_secret or secret_header != expected_secret:
        return jsonify({"status": "forbidden"}), 403
    return jsonify({"status": "healthy"}), 200


@main_bp.route("/api/generate", methods=["POST"])
def generate():
    try:
        data = request.json
        content_type = data.get("type", "movie")
        age_group = data.get("age_group", "young_adult")
        language = data.get("language", "en")
        extra = data.get("extra", {})

        logger.info(
            f"Generation request: type={content_type}, age={age_group}, lang={language}"
        )
        user_id = current_user.id if current_user.is_authenticated else None

        if (
            content_type == "movie"
            and TMDB_AVAILABLE
            and current_app.config.get("USE_TMDB", True)
        ):
            tmdb_key = os.getenv("TMDB_API_KEY")
            if tmdb_key:
                movies = discover_movies(age_group, language)
                if movies:
                    movie = movies[0]
                    title = movie.get("title", "Unknown Movie")
                    overview = movie.get("overview", "No description available.")

                    if language != "en" and TRANSLATE_AVAILABLE and overview:
                        try:
                            overview = translate_text(overview, language)
                        except Exception as e:
                            logger.warning(f"Translation error: {str(e)}")

                    result = {
                        "type": "movie",
                        "theme": title,
                        "content": f"**{title}**\n\n{overview}",
                        "from_tmdb": True,
                    }
                    if user_id and DB_AVAILABLE:
                        # History will be saved when the result is fetched from the polling endpoint
                        pass

                    # Instead of returning directly, create a completed job in Redis
                    # so the frontend can poll for it consistently.
                    if redis_client:
                        job_id = secrets.token_hex(8)
                        job_data = {
                            "status": "completed", # Mark as completed immediately
                            "result": result, # Store the full result
                            "user_id": user_id, # Keep user context
                            "content_type": "movie", # Keep content type
                            "language": language, # Keep language context
                        }
                        redis_client.set(f"job:{job_id}", json.dumps(job_data), ex=300) # Expire in 5 mins
                        # Tell the frontend to start polling for this job_id
                        return jsonify({"job_id": job_id, "status": "processing"}) 
                    else:
                        # Fallback for local dev without Redis: return directly
                        return jsonify({"job_id": "tmdb", "status": "completed", "result": result})

        # Safe execution using our lazy load handler
        crew = get_crew_instance()
        if not crew:
            return jsonify({"error": "Content generation service is currently unavailable.", "status": "error"}), 503

        queue = crew.generate_async(content_type, age_group, language, extra)
        
        job_id = secrets.token_hex(8)
        # For now, we still need to keep the queue object in memory per-worker
        active_jobs[job_id] = { "queue": queue }

        if redis_client:
            # Store job metadata in Redis
            redis_job_data = {
            "status": "processing",
            "user_id": user_id,
            "content_type": content_type,
            "language": language,
            }
            redis_client.set(f"job:{job_id}", json.dumps(redis_job_data), ex=3600) # Expire in 1 hour

        return jsonify({"job_id": job_id, "status": "processing"})

    except Exception as e:
        logger.error(f"Generation error: {str(e)}")
        return jsonify({"error": str(e), "status": "error"}), 500


@main_bp.route("/api/result/<job_id>")
def get_result(job_id):
    try:
        # Handle the special case where the frontend might poll for a TMDB result
        if job_id == "tmdb":
            return jsonify({"status": "error", "message": "TMDB results are returned directly and cannot be polled."}), 404

        job_data = None
        if redis_client:
            job_data_json = redis_client.get(f"job:{job_id}")
            if job_data_json:
                job_data = json.loads(job_data_json)

        # If the job is already completed in Redis (e.g., from TMDB)
        if job_data and job_data.get("status") == "completed":
            # Clean up Redis and return the result
            redis_client.delete(f"job:{job_id}")
            # Save history for the completed TMDB job
            if job_data.get("user_id") and DB_AVAILABLE and job_data.get("result"):
                save_history(job_data["user_id"], "movie", job_data["result"]["theme"], job_data["result"]["content"], job_data["language"])
            return jsonify({"status": "completed", "result": job_data["result"]})

        if not job_data and not active_jobs.get(job_id):
            return jsonify({"error": "Job not found"}), 404

        # The queue object is still only in the memory of the worker that created it.
        # This is a limitation without a full task queue like Celery.
        in_memory_job = active_jobs.get(job_id)
        if not in_memory_job:
            # If the request hits a different worker, we can't get the result from the queue.
            # We can only report the status from Redis.
            return jsonify({"status": job_data.get("status", "processing") if job_data else "processing"})

        queue = in_memory_job["queue"]
        if not queue.empty():
            result = queue.get_nowait()
            in_memory_job["status"] = "completed"
            in_memory_job["result"] = result
            
            if redis_client:
                redis_client.delete(f"job:{job_id}")

            # Save history for the completed CrewAI job
            if job_data and job_data.get("user_id") and DB_AVAILABLE:
                save_history(
                    job_data["user_id"],
                    job_data.get("content_type", "unknown"),
                    result.get("theme", "Untitled"),
                    result.get("content", ""),
                    job_data.get("language", "en"),
                )
            return jsonify({"status": "completed", "result": result})
        return jsonify({"status": "processing"})
    except Exception as e:
        logger.error(f"Result fetch error: {str(e)}")
        return jsonify({"error": str(e), "status": "error"}), 500


@main_bp.route("/api/languages")
def get_languages():
    # This dictionary maps language codes to their full names.
    # While not a secret, centralizing it improves maintainability.
    lang_names = {
        "en": "English", "hi": "Hindi", "es": "Spanish", "fr": "French",
        "de": "German", "zh": "Chinese", "ja": "Japanese", "ko": "Korean",
        "pt": "Portuguese", "ru": "Russian", "it": "Italian", "ar": "Arabic",
        "bn": "Bengali", "te": "Telugu", "ta": "Tamil", "ur": "Urdu",
        "pa": "Punjabi", "gu": "Gujarati",
    }
    # Supported languages are controlled by an environment variable for flexibility.
    supported_lang_codes_str = os.getenv("SUPPORTED_LANGUAGES", "en,hi,es,fr,de,zh,ja,ko,pt,ru,it")
    supported_lang_codes = [code.strip() for code in supported_lang_codes_str.split(",") if code.strip()]

    try:
        if TRANSLATE_AVAILABLE:
            libre_langs = get_supported_languages()
            if libre_langs and len(libre_langs) > 1:
                # Filter the languages from LibreTranslate to only those we want to display.
                return jsonify(
                    [
                        {"code": lang, "name": lang_names.get(lang, lang.upper())}
                        for lang in libre_langs
                        if lang in supported_lang_codes
                    ]
                )
    except Exception as e:
        logger.warning(f"Error getting languages: {str(e)}")

    # Fallback: Return the list of supported languages based on the environment variable.
    return jsonify(
        [
            {
                "code": code,
                "name": lang_names.get(code, code.upper())
            }
            for code in supported_lang_codes
        ]
    )


@main_bp.route("/profile")
@login_required
def profile():
    if not DB_AVAILABLE:
        return render_template("profile.html", user=current_user, history=[])
    history = (
        History.query.filter_by(user_id=current_user.id)
        .order_by(History.created_at.desc())
        .limit(50)
        .all()
    )
    return render_template("profile.html", user=current_user, history=history)


@main_bp.route("/api/history")
@login_required
def get_history():
    if not DB_AVAILABLE:
        return jsonify([])
    history = (
        History.query.filter_by(user_id=current_user.id)
        .order_by(History.created_at.desc())
        .limit(50)
        .all()
    )
    return jsonify(
        [
            {
                "id": h.id,
                "content_type": h.content_type,
                "title": h.title,
                "content": h.content[:200] if h.content else "",
                "language": h.language,
                "created_at": h.created_at.isoformat() if h.created_at else None,
            }
            for h in history
        ]
    )


@main_bp.route("/api/translation/test", methods=["GET"])
def test_translation():
    if not TRANSLATE_AVAILABLE:
        return jsonify({"status": "error", "message": "Translation not available"})
    try:
        test_text = "Hello, this is a test translation."
        translated = translate_text(test_text, "hi")
        return jsonify(
            {
                "status": "success",
                "original": test_text,
                "translated": translated,
                "target_language": "hi",
            }
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})
