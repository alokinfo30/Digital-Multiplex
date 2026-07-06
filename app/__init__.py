# app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import os
import logging

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

def create_app():
    """Application factory pattern for Flask app"""
    load_dotenv()
    
    # Configuration
    is_production = os.getenv('FLASK_ENV') == 'production'
    
    # Use absolute path for the database to avoid relative path issues.
    # This ensures paths are correct in both local and production (e.g., Render) environments.
    instance_path = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(instance_path, os.pardir))
    
    app = Flask(
        __name__,
        template_folder=os.path.join(instance_path, 'templates'),
        static_folder=os.path.join(instance_path, 'static'),
    )
    
    default_db_path = os.path.join(project_root, 'data', 'dev.db') # For local dev
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', f'sqlite:///{default_db_path}')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['USE_TMDB'] = os.getenv('USE_TMDB', 'True').lower() == 'true'
    app.config['DEBUG'] = os.getenv('DEBUG', 'False').lower() == 'true' and not is_production
    app.config['SESSION_COOKIE_SECURE'] = os.getenv('SESSION_COOKIE_SECURE', 'False').lower() == 'true'
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this content.'
    login_manager.login_message_category = 'info'
    
    # Register blueprints
    from app.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')
    
    from app.main import main_bp
    app.register_blueprint(main_bp)
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    return app

# User loader for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    from app.models import User
    return User.query.get(int(user_id))