from flask import Blueprint, request, jsonify
from app.models.user import User
from ..utils.jwt import JWTManager, token_required
from mongoengine import NotUniqueError, ValidationError
import bcrypt
import smtplib
import random
from datetime import datetime, timedelta
import re
import logging

# Create blueprint
auth_bp = Blueprint('auth', __name__)

# Set up logging
logger = logging.getLogger(__name__)

# OTP storage (in production, use Redis or database)
otp_store = {}
registration_temp_store = {}  # Temporary storage for registration data

# Configuration
OTP_EXPIRY_SECONDS = 300  # 5 minutes
OTP_SIZE = 6
SENDER_EMAIL = "ecofinds3@gmail.com"
GOOGLE_APP_PASSWORD = "xxazeeewsbbofbbz"  # Use environment variable in production

def generate_otp(otp_size=OTP_SIZE):
    """Generate a random OTP of specified size"""
    return ''.join([str(random.randint(0, 9)) for _ in range(otp_size)])

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    
    return True, "Password is valid"

def send_email_verification(receiver, otp):
    """Send OTP via email"""
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        logger.info("SMTP server started")
        
        server.login(SENDER_EMAIL, GOOGLE_APP_PASSWORD)
        
        subject = "Your EcoFinds OTP Verification"
        body = f"""Hello,

Your OTP for EcoFinds registration is: {otp}

This OTP is valid for {OTP_EXPIRY_SECONDS // 60} minutes only.

If you didn't request this OTP, please ignore this email.

Best regards,
EcoFinds Team"""
        
        msg = f"Subject: {subject}\n\n{body}"
        server.sendmail(SENDER_EMAIL, receiver, msg)
        server.quit()
        
        logger.info(f"OTP sent successfully to {receiver}")
        return True
        
    except Exception as e:
        logger.error(f"Email send error: {str(e)}")
        return False

def cleanup_expired_otps():
    """Clean up expired OTPs from memory"""
    current_time = datetime.now()
    expired_emails = []
    
    for email, data in otp_store.items():
        if current_time - data['timestamp'] > timedelta(seconds=OTP_EXPIRY_SECONDS):
            expired_emails.append(email)
    
    for email in expired_emails:
        del otp_store[email]
    
    # Also cleanup expired registration data
    expired_registrations = []
    for email, data in registration_temp_store.items():
        if current_time - data['timestamp'] > timedelta(seconds=OTP_EXPIRY_SECONDS * 2):
            expired_registrations.append(email)
    
    for email in expired_registrations:
        del registration_temp_store[email]

@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    """Send OTP for email verification during registration"""
    try:
        # Clean up expired OTPs
        cleanup_expired_otps()
        
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        name = data.get('name', '').strip()
        password = data.get('password', '')
        
        # Validate required fields
        if not email or not name or not password:
            return jsonify({
                'success': False, 
                'message': 'Email, name, and password are required'
            }), 400
        
        # Validate email format
        if not validate_email(email):
            return jsonify({
                'success': False, 
                'message': 'Invalid email format'
            }), 400
        
        # Validate password strength
        is_valid_password, password_message = validate_password(password)
        if not is_valid_password:
            return jsonify({
                'success': False, 
                'message': password_message
            }), 400
        
        # Validate name
        if len(name) < 2:
            return jsonify({
                'success': False, 
                'message': 'Name must be at least 2 characters long'
            }), 400
        
        # Check if email already exists
        try:
            existing_user = User.objects(email=email).first()
            if existing_user:
                return jsonify({
                    'success': False, 
                    'message': 'Email already registered'
                }), 409
        except Exception as e:
            logger.error(f"Database error during email validation: {str(e)}")
            return jsonify({
                'success': False, 
                'message': 'Database error during validation'
            }), 500
        
        # Generate and store OTP
        otp = generate_otp()
        current_time = datetime.now()
        
        otp_store[email] = {
            'otp': otp,
            'timestamp': current_time,
            'attempts': 0
        }
        
        # Store registration data temporarily
        registration_temp_store[email] = {
            'name': name,
            'password': password,
            'timestamp': current_time
        }
        
        # Send OTP via email
        if send_email_verification(email, otp):
            return jsonify({
                'success': True, 
                'message': 'OTP sent successfully to your email',
                'expires_in': OTP_EXPIRY_SECONDS
            }), 200
        else:
            # Clean up if email sending failed
            otp_store.pop(email, None)
            registration_temp_store.pop(email, None)
            
            return jsonify({
                'success': False, 
                'message': 'Failed to send OTP. Please try again.'
            }), 500
    
    except Exception as e:
        logger.error(f"Error in send_otp: {str(e)}")
        return jsonify({
            'success': False, 
            'message': 'Internal server error'
        }), 500

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """Verify OTP and complete user registration"""
    email = None
    try:
        # Clean up expired OTPs
        cleanup_expired_otps()
        
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        otp_input = data.get('otp', '').strip()
        
        if not email or not otp_input:
            return jsonify({
                'success': False, 
                'message': 'Email and OTP are required'
            }), 400
        
        # Check if OTP exists
        stored_otp_data = otp_store.get(email)
        if not stored_otp_data:
            return jsonify({
                'success': False, 
                'message': 'OTP not found or expired. Please request a new OTP.'
            }), 404
        
        # Check if OTP is expired
        if datetime.now() - stored_otp_data['timestamp'] > timedelta(seconds=OTP_EXPIRY_SECONDS):
            # Clean up expired data
            otp_store.pop(email, None)
            registration_temp_store.pop(email, None)
            
            return jsonify({
                'success': False, 
                'message': 'OTP has expired. Please request a new OTP.'
            }), 401
        
        # Check attempt limit
        if stored_otp_data['attempts'] >= 3:
            # Clean up after too many attempts
            otp_store.pop(email, None)
            registration_temp_store.pop(email, None)
            
            return jsonify({
                'success': False, 
                'message': 'Too many verification attempts. Please request a new OTP.'
            }), 401
        
        # Verify OTP
        if stored_otp_data['otp'] != otp_input:
            # Increment attempt counter
            otp_store[email]['attempts'] += 1
            return jsonify({
                'success': False, 
                'message': 'Invalid OTP. Please check and try again.',
                'attempts_remaining': 3 - otp_store[email]['attempts']
            }), 401
        
        # OTP is valid, get registration data
        registration_data = registration_temp_store.get(email)
        if not registration_data:
            return jsonify({
                'success': False, 
                'message': 'Registration data not found. Please start registration again.'
            }), 404
        
        # Check if email still doesn't exist (race condition check)
        existing_user = User.objects(email=email).first()
        if existing_user:
            # Clean up
            otp_store.pop(email, None)
            registration_temp_store.pop(email, None)
            return jsonify({
                'success': False, 
                'message': 'Email already registered'
            }), 409
        
        # Hash password
        password_hash = bcrypt.hashpw(
            registration_data['password'].encode('utf-8'), 
            bcrypt.gensalt()
        ).decode('utf-8')
        
        # Create new user
        user = User(
            email=email,
            name=registration_data['name'],
            password_hash=password_hash
        )
        
        # Save user to database with proper NotUniqueError handling
        try:
            user.save()
        except NotUniqueError:
            # Clean up temporary data
            otp_store.pop(email, None)
            registration_temp_store.pop(email, None)
            logger.warning(f"Attempt to register duplicate email: {email}")
            return jsonify({
                'success': False, 
                'message': 'Email already exists'
            }), 409
        
        # Generate JWT token
        token = JWTManager.generate_token(user.id, user.name, user.email)
        if not token:
            logger.error(f"Failed to generate token for user: {email}")
            return jsonify({
                'success': False, 
                'message': 'User created but failed to generate token. Please login.'
            }), 500
        
        # Clean up temporary data
        otp_store.pop(email, None)
        registration_temp_store.pop(email, None)
        
        logger.info(f"User registered successfully: {email}")
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': {
                'id': str(user.id),
                'email': user.email,
                'name': user.name,
                'created_at': user.created_at.isoformat()
            },
            'token': token
        }), 201
    
    except ValidationError as e:
        logger.error(f"Validation error during registration: {str(e)}")
        if email:
            otp_store.pop(email, None)
            registration_temp_store.pop(email, None)
        return jsonify({
            'success': False, 
            'message': f'Validation error: {str(e)}'
        }), 400
    
    except Exception as e:
        logger.error(f"Error in verify_otp: {str(e)}")
        if email:
            otp_store.pop(email, None)
            registration_temp_store.pop(email, None)
        return jsonify({
            'success': False, 
            'message': 'Internal server error'
        }), 500

@auth_bp.route('/resend-otp', methods=['POST'])
def resend_otp():
    """Resend OTP for email verification"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        
        if not email:
            return jsonify({
                'success': False, 
                'message': 'Email is required'
            }), 400
        
        # Check if registration data exists
        registration_data = registration_temp_store.get(email)
        if not registration_data:
            return jsonify({
                'success': False, 
                'message': 'Registration session not found. Please start registration again.'
            }), 404
        
        # Check if too soon to resend (prevent spam)
        if email in otp_store:
            time_since_last = datetime.now() - otp_store[email]['timestamp']
            if time_since_last < timedelta(seconds=60):  # Wait at least 1 minute
                return jsonify({
                    'success': False, 
                    'message': 'Please wait before requesting another OTP',
                    'wait_seconds': 60 - int(time_since_last.total_seconds())
                }), 429
        
        # Generate new OTP
        otp = generate_otp()
        current_time = datetime.now()
        
        otp_store[email] = {
            'otp': otp,
            'timestamp': current_time,
            'attempts': 0
        }
        
        # Send OTP via email
        if send_email_verification(email, otp):
            return jsonify({
                'success': True, 
                'message': 'OTP resent successfully',
                'expires_in': OTP_EXPIRY_SECONDS
            }), 200
        else:
            return jsonify({
                'success': False, 
                'message': 'Failed to resend OTP. Please try again.'
            }), 500
    
    except Exception as e:
        logger.error(f"Error in resend_otp: {str(e)}")
        return jsonify({
            'success': False, 
            'message': 'Internal server error'
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint - supports email login"""
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract login credentials
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Validate required fields
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Validate email format
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Find user by email
        try:
            user = User.objects(email=email).first()
            
            if not user:
                return jsonify({'error': 'Invalid credentials'}), 401
                
        except Exception as e:
            logger.error(f"Database error during login: {str(e)}")
            return jsonify({'error': 'Database error during login'}), 500
        
        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate JWT token
        token = JWTManager.generate_token(user.id, user.name, user.email)
        
        if not token:
            logger.error(f"Failed to generate token for user: {email}")
            return jsonify({'error': 'Failed to generate token'}), 500
        
        logger.info(f"User logged in successfully: {email}")
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': str(user.id),
                'email': user.email,
                'name': user.name,
                'created_at': user.created_at.isoformat()
            },
            'token': token
        }), 200
        
    except Exception as e:
        logger.error(f"Error in login: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile():
    """Get current user profile"""
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
                'name': user.name,
                'created_at': user.created_at.isoformat(),
                'updated_at': user.updated_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_profile: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500