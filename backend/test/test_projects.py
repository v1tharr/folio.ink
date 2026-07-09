import json
from app.models.project import Project


class TestGetProjects:
    def test_empty_list_when_no_projects(self, client):
        response = client.get('/api/projects')

        assert response.status_code == 200
        assert response.get_json() == []

    def test_returns_created_projects(self, client, app):
        from app.database import db

        with app.app_context():
            db.session.add(Project(name="folio.ink", color="#1D9E75", description="дневник разработчика"))
            db.session.add(Project(name="Pet-проект"))
            db.session.commit()

        response = client.get('/api/projects')
        data = response.get_json()

        assert response.status_code == 200
        assert len(data) == 2
        names = {p['name'] for p in data}
        assert names == {"folio.ink", "Pet-проект"}

    def test_response_shape(self, client, app):
        from app.database import db

        with app.app_context():
            db.session.add(Project(name="Тест", color="#ABCDEF", description="описание"))
            db.session.commit()

        data = client.get('/api/projects').get_json()[0]

        assert set(data.keys()) == {"id", "name", "color", "description", "created_at"}
        assert data["name"] == "Тест"
        assert data["color"] == "#ABCDEF"
        assert data["description"] == "описание"
        assert data["created_at"] is not None


class TestCreateProject:
    def test_create_with_all_fields(self, client):
        response = client.post(
            '/api/projects',
            data=json.dumps({
                "name": "Новый проект",
                "color": "#112233",
                "description": "описание проекта"
            }),
            content_type='application/json'
        )
        data = response.get_json()

        assert response.status_code == 201
        assert data["name"] == "Новый проект"
        assert data["color"] == "#112233"
        assert data["description"] == "описание проекта"
        assert data["id"] is not None

    def test_create_with_only_required_field(self, client):
        response = client.post(
            '/api/projects',
            data=json.dumps({"name": "Минимальный проект"}),
            content_type='application/json'
        )
        data = response.get_json()

        assert response.status_code == 201
        assert data["name"] == "Минимальный проект"
        assert data["color"] is None
        assert data["description"] is None

    def test_missing_name_returns_400(self, client):
        response = client.post(
            '/api/projects',
            data=json.dumps({"color": "#000000"}),
            content_type='application/json'
        )

        assert response.status_code == 400
        assert "error" in response.get_json()

    def test_empty_name_returns_400(self, client):
        response = client.post(
            '/api/projects',
            data=json.dumps({"name": ""}),
            content_type='application/json'
        )

        assert response.status_code == 400

    def test_empty_body_returns_400(self, client):
        response = client.post(
            '/api/projects',
            data=json.dumps({}),
            content_type='application/json'
        )

        assert response.status_code == 400

    def test_created_project_is_persisted(self, client, app):
        client.post(
            '/api/projects',
            data=json.dumps({"name": "Проверка сохранения"}),
            content_type='application/json'
        )

        with app.app_context():
            saved = Project.query.filter_by(name="Проверка сохранения").first()
            assert saved is not None

    def test_create_then_get_returns_it(self, client):
        client.post(
            '/api/projects',
            data=json.dumps({"name": "Видимый проект"}),
            content_type='application/json'
        )

        response = client.get('/api/projects')
        names = [p['name'] for p in response.get_json()]

        assert "Видимый проект" in names
