from flask import Flask
from .auth import auth_bp
from .products import products_bp

def register_routes(app: Flask):
    """
    Register all route blueprints with the Flask app
    """
    # Register authentication routes
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(products_bp, url_prefix='/api/v1/products')
    


# Alternative approach - you can also export blueprints directly
__all__ = ['auth_bp', 'register_routes']