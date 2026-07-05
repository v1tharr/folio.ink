from datetime import datetime
from app.database import db


class Project(db.Model):
    """
    Модель проекта — таблица 'project' в SQLite.
    Каждая строка = один проект пользователя (например "folio.ink", "Pet-проект")
    """

    # id — первичный ключ, SQLite сам генерирует автоинкрементом
    id = db.Column(db.Integer, primary_key=True)

    # nullable=False значит "обязательное поле", без имени проект не создать
    name = db.Column(db.String(100), nullable=False)

    # цвет в hex-формате для UI, например "#1D9E75"
    color = db.Column(db.String(7), nullable=True)

    # текстовое описание, может быть пустым
    description = db.Column(db.Text, nullable=True)

    # created_at заполняется автоматически при создании записи
    # datetime.utcnow — функция, а не вызов (без скобок!) —
    # SQLAlchemy сам вызовет её в момент вставки
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """
        Конвертирует объект Project в обычный Python-словарь,
        чтобы потом Flask мог превратить его в JSON через jsonify().
        Без этого метода Flask не знает как сериализовать объект модели.
        """
        return {
            "id": self.id,
            "name": self.name,
            "color": self.color,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
