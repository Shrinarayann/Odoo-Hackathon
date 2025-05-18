from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    # setup routes, db, extensions
    CORS(app)
    return app
