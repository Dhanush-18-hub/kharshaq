import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from models import db, User, LoginHistory

bcrypt = Bcrypt()
user_bp = Blueprint('user', __name__)

# --- GET USER PROFILE ---
@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404
        
    return jsonify({
        'user': user.to_json()
    }), 200

# --- UPDATE ACCOUNT SETTINGS ---
@user_bp.route('/settings', methods=['PUT'])
@jwt_required()
def update_settings():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404
        
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    password = data.get('password', '')
    current_password = data.get('currentPassword', '')
    
    # 1. Update Name
    if name:
        if len(name) < 3:
            return jsonify({'error': 'Name must be at least 3 characters.'}), 400
        user.name = name
        
    # 2. Update Email
    if email and email != user.email:
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return jsonify({'error': 'Invalid email address.'}), 400
        # Check if already exists
        existing = User.query.filter_by(email=email).first()
        if existing:
            return jsonify({'error': 'This email is already registered.'}), 400
        user.email = email
        
    # 3. Update Phone
    if phone and phone != user.phone:
        if not re.match(r"^[6-9]\d{9}$", phone):
            return jsonify({'error': 'Invalid Indian mobile number.'}), 400
        # Check if already exists
        existing = User.query.filter_by(phone=phone).first()
        if existing:
            return jsonify({'error': 'This mobile number is already registered.'}), 400
        user.phone = phone
        
    # 4. Update Password
    if password:
        if not current_password:
            return jsonify({'error': 'Current password is required to set a new password.'}), 400
            
        if not user.password_hash or not bcrypt.check_password_hash(user.password_hash, current_password):
            return jsonify({'error': 'Incorrect current password.'}), 401
            
        # Password strength check
        if len(password) < 8 or not any(c.isupper() for c in password) or not any(c.islower() for c in password) or not any(c.isdigit() for c in password) or not any(c in '!@#$%^&*(),.?":{}|<>' for c in password):
            return jsonify({'error': 'New password does not meet strength requirements.'}), 400
            
        user.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        
    db.session.commit()
    
    return jsonify({
        'message': 'Account Settings Updated',
        'user': user.to_json()
    }), 200

# --- UPLOAD PROFILE PICTURE ---
@user_bp.route('/avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404
        
    data = request.get_json() or {}
    avatar_url = data.get('avatarUrl', '').strip()
    
    if not avatar_url:
        return jsonify({'error': 'Avatar image URL is required.'}), 400
        
    user.profile_image = avatar_url
    db.session.commit()
    
    return jsonify({
        'message': 'Profile Picture Updated',
        'user': user.to_json()
    }), 200

# --- DELETE ACCOUNT ---
@user_bp.route('/account', methods=['DELETE'])
@jwt_required()
def delete_account():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404
        
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({
        'message': 'Account Deleted Successfully'
    }), 200

# --- LOGIN HISTORY ---
@user_bp.route('/login-history', methods=['GET'])
@jwt_required()
def get_login_history():
    user_id = get_jwt_identity()
    history = LoginHistory.query.filter_by(user_id=user_id).order_by(LoginHistory.login_time.desc()).limit(10).all()
    
    return jsonify({
        'history': [{
            'login_time': h.login_time.isoformat(),
            'device': h.device,
            'browser': h.browser,
            'ip_address': h.ip_address
        } for h in history]
    }), 200
