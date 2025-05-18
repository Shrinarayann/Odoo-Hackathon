from flask import Flask

def create_app():
    app = Flask(__name__)
    # setup routes, db, extensions
    return app
