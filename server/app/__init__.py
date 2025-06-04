import os
from flask import Flask
from flask_cors import CORS
from .db.connection import init_db, check_db_health

def create_app():
    app = Flask(__name__)
    
    # App configuration
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Setup CORS
    CORS(app, origins="*", supports_credentials=True)

    
    # Initialize database connection
    try:
        init_db()
    except Exception as e:
        print(f"❌ Failed to initialize database: {e}")
        raise e
    
    # Register routes
    from .routes import register_routes
    register_routes(app)
    
    # Enhanced health check endpoint with database status
    @app.route('/health', methods=['GET'])
    def health_check():
        db_healthy, db_message = check_db_health()
        
        return {
            'status': 'healthy' if db_healthy else 'unhealthy',
            'message': 'Server is running',
            'version': '1.0.0',
            'database': {
                'status': 'connected' if db_healthy else 'disconnected',
                'message': db_message
            }
        }, 200 if db_healthy else 503
    
    # Handle 404 errors
    @app.errorhandler(404)
    def not_found(error):
        return {
            'error': 'Endpoint not found',
            'message': 'The requested URL was not found on the server'
        }, 404
    
    # Handle 500 errors
    @app.errorhandler(500)
    def internal_error(error):
        return {
            'error': 'Internal server error',
            'message': 'Something went wrong on our end'
        }, 500
    
    return app