import jwt
from datetime import datetime, timedelta
from flask import current_app
import os

class JWTManager:
    @staticmethod
    def generate_token(user_id, username, email):
        """
        Generate JWT token for user
        """
        try:
            # Token payload
            payload = {
                'user_id': str(user_id),
                'username': username,
                'email': email,
                'iat': datetime.utcnow(),
                'exp': datetime.utcnow() + timedelta(days=7)  # Token expires in 7 days
            }
            
            # Get secret key from environment or config
            secret_key = current_app.config.get('JWT_SECRET_KEY') or os.getenv('JWT_SECRET_KEY')
            
            # Generate token
            token = jwt.encode(payload, secret_key, algorithm='HS256')
            return token
            
        except Exception as e:
            return None
    
    @staticmethod
    def decode_token(token):
        """
        Decode JWT token and return payload
        """
        try:
            secret_key = current_app.config.get('JWT_SECRET_KEY') or os.getenv('JWT_SECRET_KEY')
            payload = jwt.decode(token, secret_key, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return {'error': 'Token has expired'}
        except jwt.InvalidTokenError:
            return {'error': 'Invalid token'}
        except Exception as e:
            return {'error': 'Token decode failed'}
    
    @staticmethod
    def verify_token(token):
        """
        Verify if token is valid and not expired
        """
        decoded = JWTManager.decode_token(token)
        if 'error' in decoded:
            return False, decoded['error']
        return True, decoded

def token_required(f):
    """
    Decorator to protect routes that require authentication
    """
    from functools import wraps
    from flask import request, jsonify

    @wraps(f)
    def decorated(*args, **kwargs):
        # Allow preflight CORS requests
        if request.method == 'OPTIONS':
            return '', 200

        token = None
        
        # Check for token in Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        # Verify token
        is_valid, result = JWTManager.verify_token(token)
        if not is_valid:
            return jsonify({'error': result}), 401
        
        # Pass user info to the route
        request.current_user = result
        return f(*args, **kwargs)

    return decorated
