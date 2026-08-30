import unittest

try:
    from app import create_app
    HAS_FLASK = True
except ImportError:
    HAS_FLASK = False


@unittest.skipUnless(HAS_FLASK, "Flask dependency not installed in local environment")
class TestMultiplexCore(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config.update(TESTING=True)
        self.client = self.app.test_client()

    def test_index_page_returns_success(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get("X-Content-Type-Options"), "nosniff")
        self.assertEqual(response.headers.get("X-Frame-Options"), "DENY")

    def test_health_check_returns_healthy(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["status"], "healthy")

    def test_api_health_returns_healthy(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["status"], "healthy")

    def test_generate_endpoint_accepts_valid_payload(self):
        payload = {
            "type": "movie",
            "age_group": "young_adult",
            "language": "en",
            "extra": {"theme": "cyberpunk"}
        }
        response = self.client.post("/api/generate", json=payload)
        self.assertIn(response.status_code, [200, 202])
        data = response.get_json()
        self.assertTrue("status" in data or "job_id" in data or "result" in data)

    def test_languages_endpoint_returns_list(self):
        response = self.client.get("/api/languages")
        self.assertEqual(response.status_code, 200)
        langs = response.get_json()
        self.assertIsInstance(langs, list)
        self.assertGreater(len(langs), 0)


if __name__ == "__main__":
    unittest.main()
