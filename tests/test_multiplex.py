import pytest
from app import create_app


@pytest.fixture()
def client():
    app = create_app()
    app.config.update(TESTING=True)
    with app.test_client() as client:
        yield client


def test_index_page_returns_success(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"


def test_health_check_returns_healthy(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.get_json()["status"] == "healthy"


def test_api_health_returns_healthy(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.get_json()["status"] == "healthy"


def test_generate_endpoint_accepts_valid_payload(client):
    payload = {
        "type": "movie",
        "age_group": "young_adult",
        "language": "en",
        "extra": {"theme": "cyberpunk"}
    }
    response = client.post("/api/generate", json=payload)
    assert response.status_code in [200, 202]
    assert "status" in response.get_json() or "job_id" in response.get_json()


def test_languages_endpoint_returns_list(client):
    response = client.get("/api/languages")
    assert response.status_code == 200
    langs = response.get_json()
    assert isinstance(langs, list)
    assert len(langs) > 0
