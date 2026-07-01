# файл единая точка входа для работы с бд
# все модели и все роуты импортируют объект `db` отсюда,
# а не создают свои подключения иначе будет несколько несвязанных баз

from flask_sqlalchemy import SQLAlchemy

# создаётся один раз здесь. в models/project.py и models/entry.py
# нужно писать: from app.database import db
# и наследовать классы моделей от db.Model
db = SQLAlchemy()


def init_db(app):
    """
    Подключает базу данных к Flask-приложению.
    Вызывается один раз при старте — внутри create_app() в app.py.
    Больше нигде вызывать не нужно.
    """

    # путь к файлу базы. sqlite:/// значит "локальный файл рядом с проектом"
    # файл folioink.db появится автоматически при первом запуске
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///folioink.db'

    # трекинг изменений не нужен
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    # app_context нужен потому что Flask требует явно сказать
    # "сейчас мы работаем в контексте приложения" перед операциями с базой
    with app.app_context():
        # create_all() смотрит на все классы-модели (Project, Entry и т.д.)
        # и создаёт для них таблицы, ЕСЛИ они ещё не существуют
        # Если таблицы уже есть ничего не делает, безопасно вызывать много раз
        # ВАЖНО: чтобы это сработало, модели (Project, Entry) должны быть
        # импортированы ДО вызова create_all(), иначе SQLAlchemy о них не узнает
        # их нужно импортировать здесь же, когда андрей их создаст:
        # from app.models.project import Project
        # from app.models.entry import Entry
        db.create_all()


def get_db():
    """
    Хелпер для получения текущей сессии базы данных.
    Используется в routes.py для запросов, например:

        from app.database import get_db
        session = get_db()
        projects = session.query(Project).all()

    Хотя чаще пишут напрямую через db.session — это то же самое,
    просто get_db() как явная точка входа, если понадобится подменить логику.
    """
    return db.session