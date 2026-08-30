import pytest
from app import create_app


@pytest.fixture()
def client():
    app = create_app()
    app.config.update(TESTING=True)
    with app.test_client() as client:
        yield client


def test_index_page_returns_200_and_headers(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert "Content-Security-Policy" in response.headers


def test_health_endpoints(client):
    r1 = client.get("/health")
    assert r1.status_code == 200
    assert r1.get_json()["status"] == "healthy"

    r2 = client.get("/api/health")
    assert r2.status_code == 200
    assert r2.get_json()["status"] == "healthy"


def test_generate_endpoint_handles_all_entertainment_types(client):
    types = ["movie", "song", "radio", "documentary", "podcast"]
    for t in types:
        payload = {
            "type": t,
            "age_group": "young_adult",
            "language": "hi",
            "extra": {"theme": "cyberpunk"}
        }
        res = client.post("/api/generate", json=payload)
        assert res.status_code in [200, 202]
        data = res.get_json()
        assert "status" in data or "job_id" in data or "result" in data


def test_languages_endpoint(client):
    res = client.get("/api/languages")
    assert res.status_code == 200
    langs = res.get_json()
    assert isinstance(langs, list)
    assert len(langs) >= 5
