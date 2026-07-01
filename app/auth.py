# app/auth.py
from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from app import limiter
from app.models import db, User, Preference
import logging

logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
@limiter.limit("5 per minute")
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            flash('Logged in successfully!', 'success')
            return redirect(url_for('main.index'))
        flash('Invalid username or password', 'error')
    
    return render_template('login.html')

@auth_bp.route('/register', methods=['GET', 'POST'])
@limiter.limit("5 per hour")
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        age_group = request.form.get('age_group', 'young_adult')
        language = request.form.get('language', 'en')
        
        # Validation
        if User.query.filter_by(username=username).first():
            flash('Username already taken', 'error')
            return render_template('register.html')
        
        if User.query.filter_by(email=email).first():
            flash('Email already registered', 'error')
            return render_template('register.html')
        
        if len(password) < 6:
            flash('Password must be at least 6 characters', 'error')
            return render_template('register.html')
        
        # Create user
        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password),
            age_group=age_group,
            preferred_language=language
        )
        db.session.add(user)
        db.session.flush()
        
        # Create preferences
        pref = Preference(user_id=user.id)
        db.session.add(pref)
        
        db.session.commit()
        
        login_user(user)
        flash('Account created successfully!', 'success')
        return redirect(url_for('main.index'))
    
    return render_template('register.html')

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Logged out successfully', 'info')
    return redirect(url_for('main.index'))