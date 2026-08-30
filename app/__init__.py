# app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import logging

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    load_dotenv = lambda: None

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
limiter = Limiter(key_func=get_remote_address)


def create_app():
    """Enterprise Application factory pattern for Flask app"""
    is_production = os.getenv('FLASK_ENV') == 'production'
    
    instance_path = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(instance_path, os.pardir))
    
    app = Flask(
        __name__,
        template_folder=os.path.join(instance_path, 'templates'),
        static_folder=os.path.join(instance_path, 'static'),
    )
    
    default_db_path = os.path.join(project_root, 'data', 'dev.db')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'digital-multiplex-secret-key-2026')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', f'sqlite:///{default_db_path}')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['USE_TMDB'] = os.getenv('USE_TMDB', 'True').lower() == 'true'
    app.config['DEBUG'] = os.getenv('DEBUG', 'False').lower() == 'true' and not is_production
    app.config['SESSION_COOKIE_SECURE'] = os.getenv('SESSION_COOKIE_SECURE', 'False').lower() == 'true'
    app.config['MAX_CONTENT_LENGTH'] = 4 * 1024 * 1024  # 4MB cap

    redis_url = os.getenv('REDIS_URL')
    app.config['RATELIMIT_STORAGE_URI'] = redis_url if redis_url else "memory://"
    app.config['RATELIMIT_DEFAULT'] = "200 per day;50 per hour"

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this content.'
    login_manager.login_message_category = 'info'

    @app.after_request
    def add_security_headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['Permissions-Policy'] = 'geolocation=(), camera=(), microphone=(self)'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
        response.headers['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https://img.shields.io https://image.tmdb.org https://raw.githubusercontent.com; "
            "connect-src 'self' https://openrouter.ai https://api.themoviedb.org; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "frame-ancestors 'none'; "
            "form-action 'self';"
        )
        return response
    
    # Register blueprints
    from app.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')
    
    from app.main import main_bp
    app.register_blueprint(main_bp)
    
    logging.basicConfig(level=logging.INFO)
    
    return app


@login_manager.user_loader
def load_user(user_id):
    from app.models import User
    return User.query.get(int(user_id))