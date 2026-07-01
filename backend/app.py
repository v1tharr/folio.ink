from flask import Flask
from app.database import init_db


def create_app():
    app = Flask(__name__)
    init_db(app)
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
