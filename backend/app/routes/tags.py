from flask import Blueprint, jsonify
from app.models.project import Project
from app.models.entry import Entry
from app.models.tag import Tag

tags_bp = Blueprint('tags', __name__)


@tags_bp.route('/api/projects/<int:project_id>/tags', methods=['GET'])
def get_project_tags(project_id):
    """
    Список уникальных тегов, встречающихся в записях этого проекта.
    Теги общие для всего приложения (см. models/tag.py), но здесь
    отдаём только те, что реально использованы в записях данного проекта —
    через JOIN Entry -> entry_tags -> Tag.
    """
    project = Project.query.get(project_id)
    if project is None:
        return jsonify({"error": "Проект не найден"}), 404

    tags = (
        Tag.query
        .join(Tag.entries)
        .filter(Entry.project_id == project_id)
        .distinct()
        .order_by(Tag.name)
        .all()
    )

    return jsonify([t.to_dict() for t in tags])
