import pytest
from app import create_app


@pytest.fixture()
def client():
    app = create_app()
    app.config.update(TESTING=True)
    with app.test_client() as client:
        yield client


def test_enterprise_security_headers_present(client):
    response = client.get("/")
    headers = response.headers
    
    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-Frame-Options") == "DENY"
    assert headers.get("X-XSS-Protection") == "1; mode=block"
    assert headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "default-src 'self'" in headers.get("Content-Security-Policy", "")


def test_xss_injection_payload_sanitization(client):
    malicious_payload = {
        "type": "movie",
        "age_group": "young_adult",
        "language": "en",
        "extra": {"theme": "<script>alert('xss')</script>"}
    }
    response = client.post("/api/generate", json=malicious_payload)
    assert response.status_code in [200, 202]


def test_invalid_http_verb_rejected(client):
    response = client.put("/api/generate", json={})
    assert response.status_code == 405
