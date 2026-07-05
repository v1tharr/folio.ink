from flask import Blueprint, request, jsonify
from app.database import db
from app.models.project import Project

# Blueprint — способ Flask группировать роуты по темам.
# Все роуты про проекты будут жить в этом файле, а не размазаны по app.py
projects_bp = Blueprint('projects', __name__)


@projects_bp.route('/api/projects', methods=['GET'])
def get_projects():
    """
    Отдаёт список всех проектов в формате JSON.
    Именно этот адрес будет дёргать фронт Жоры вместо моков.
    """
    # запрашиваем ВСЕ строки из таблицы project
    all_projects = Project.query.all()

    # конвертируем каждый объект Project в словарь через to_dict()
    # который мы написали в модели, потом jsonify превращает список
    # словарей в настоящий JSON-ответ
    return jsonify([p.to_dict() for p in all_projects])


@projects_bp.route('/api/projects', methods=['POST'])
def create_project():
    """
    Создаёт новый проект. Ожидает JSON в теле запроса:
    { "name": "...", "color": "...", "description": "..." }
    """
    # request.json — это то что фронт прислал в теле POST-запроса,
    # Flask сам парсит JSON в Python-словарь
    data = request.json

    if not data or not data.get('name'):
        # если имя не передали — это ошибка клиента, код 400
        return jsonify({"error": "Поле 'name' обязательно"}), 400

    new_project = Project(
        name=data.get('name'),
        color=data.get('color'),
        description=data.get('description')
    )

    # add() — добавляет объект в сессию (пока только в памяти)
    # commit() — реально записывает в файл базы данных
    db.session.add(new_project)
    db.session.commit()

    # возвращаем созданный проект с кодом 201 (Created)
    return jsonify(new_project.to_dict()), 201

