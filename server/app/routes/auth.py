from flask import Blueprint, request, jsonify
from mongoengine.errors import NotUniqueError, ValidationError, DoesNotExist
import bcrypt
import re
from ..models.user import User  # Adjust import path as needed
from ..utils.jwt import JWTManager, token_required

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r"[A-Za-z]", password):
        return False, "Password must contain at least one letter"
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one number"
    return True, "Valid password"

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    User registration endpoint
    """
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract required fields
        email = data.get('email', '').strip().lower()
        name = data.get('name', '').strip()  # Changed from username to name
        password = data.get('password', '')
        
        # Validate required fields
        if not email or not name or not password:
            return jsonify({'error': 'Email, name, and password are required'}), 400
        
        # Validate email format
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password strength
        is_valid_password, password_message = validate_password(password)
        if not is_valid_password:
            return jsonify({'error': password_message}), 400
        
        # Validate name (minimum length, can contain spaces now)
        if len(name) < 2:
            return jsonify({'error': 'Name must be at least 2 characters long'}), 400
        
        # Check if email already exists (name can be duplicate now)
        try:
            existing_user = User.objects(email=email).first()
            if existing_user:
                return jsonify({'error': 'Email already registered'}), 409
                
        except Exception as e:
            return jsonify({'error': 'Database error during validation'}), 500
        
        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create new user
        user = User(
            email=email,
            name=name,  # Changed from username to name
            password_hash=password_hash
        )
        
        # Save user to database
        user.save()
        
        # Generate JWT token (updated to use name instead of username)
        token = JWTManager.generate_token(user.id, user.name, user.email)
        
        if not token:
            return jsonify({'error': 'Failed to generate token'}), 500
        
        return jsonify({
            'message': 'User created successfully',
            'user': {
                'id': str(user.id),
                'email': user.email,
                'name': user.name,  # Changed from username to name
                'created_at': user.created_at.isoformat()
            },
            'token': token
        }), 201
        
    except NotUniqueError as e:
        return jsonify({'error': 'Email already exists'}), 409  # Removed username reference
    except ValidationError as e:
        return jsonify({'error': f'Validation error: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    User login endpoint - now only supports email login
    """
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract login credentials (only email now, since name is not unique)
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Validate required fields
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Validate email format
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Find user by email only
        try:
            user = User.objects(email=email).first()
            
            if not user:
                return jsonify({'error': 'Invalid credentials'}), 401
                
        except Exception as e:
            return jsonify({'error': 'Database error during login'}), 500
        
        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate JWT token (updated to use name instead of username)
        token = JWTManager.generate_token(user.id, user.name, user.email)
        
        if not token:
            return jsonify({'error': 'Failed to generate token'}), 500
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': str(user.id),
                'email': user.email,
                'name': user.name,  # Changed from username to name
                'created_at': user.created_at.isoformat()
            },
            'token': token
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/verify-token', methods=['GET'])
@token_required
def verify_token():
    """
    Verify if token is valid and return user info
    """
    try:
        current_user = request.current_user
        
        # Fetch fresh user data from database
        user = User.objects(id=current_user['user_id']).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'message': 'Token is valid',
            'user': {
                'id': str(user.id),
                'email': user.email,
                'name': user.name,  # Changed from username to name
                'created_at': user.created_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile():
    """
    Get current user profile
    """
    try:
        current_user = request.current_user
        
        # Fetch user data from database
        user = User.objects(id=current_user['user_id']).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'id': str(user.id),
                'email': user.email,
                'name': user.name,  # Changed from username to name
                'created_at': user.created_at.isoformat(),
                'updated_at': user.updated_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500