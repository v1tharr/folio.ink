import pytest
from app.database import db
from app.routes.projects import projects_bp

# импортируем модели явно, чтобы SQLAlchemy знала про все таблицы
# до вызова db.create_all() (иначе таблица entry не создастся)
from app.models.project import Project
from app.models.entry import Entry


def create_test_app():
    from flask import Flask

    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True

    db.init_app(app)
    app.register_blueprint(projects_bp)

    return app


@pytest.fixture
def app():
    """
    Даёт чистое Flask-приложение с пустой базой на каждый тест.
    """
    app = create_test_app()

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """
    Тестовый HTTP-клиент Flask — им и дёргаем роуты в тестах,
    без поднятия реального сервера на порту 5000.
    """
    return app.test_client()
