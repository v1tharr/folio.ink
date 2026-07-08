from flask import Flask
from flask_cors import CORS
from app.database import init_db
from app.routes.projects import projects_bp


def create_app():
    app = Flask(__name__)
    CORS(app)  # разрешает запросы с любого порта
    init_db(app)
    app.register_blueprint(projects_bp)
    return app



if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
