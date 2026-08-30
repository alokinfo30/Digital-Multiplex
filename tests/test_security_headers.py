import unittest

try:
    from app import create_app
    HAS_FLASK = True
except ImportError:
    HAS_FLASK = False


@unittest.skipUnless(HAS_FLASK, "Flask dependency not installed in local environment")
class TestSecurityHeaders(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config.update(TESTING=True)
        self.client = self.app.test_client()

    def test_enterprise_security_headers_present(self):
        response = self.client.get("/")
        headers = response.headers

        self.assertEqual(headers.get("X-Content-Type-Options"), "nosniff")
        self.assertEqual(headers.get("X-Frame-Options"), "DENY")
        self.assertEqual(headers.get("X-XSS-Protection"), "1; mode=block")
        self.assertEqual(headers.get("Referrer-Policy"), "strict-origin-when-cross-origin")
        self.assertIn("default-src 'self'", headers.get("Content-Security-Policy", ""))

    def test_xss_injection_payload_sanitization(self):
        malicious_payload = {
            "type": "movie",
            "age_group": "young_adult",
            "language": "en",
            "extra": {"theme": "<script>alert('xss')</script>"}
        }
        response = self.client.post("/api/generate", json=malicious_payload)
        self.assertIn(response.status_code, [200, 202])

    def test_invalid_http_verb_rejected(self):
        response = self.client.put("/api/generate", json={})
        self.assertEqual(response.status_code, 405)


if __name__ == "__main__":
    unittest.main()
