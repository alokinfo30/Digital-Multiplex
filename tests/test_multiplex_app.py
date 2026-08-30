import unittest

try:
    from app import create_app
    HAS_FLASK = True
except ImportError:
    HAS_FLASK = False


@unittest.skipUnless(HAS_FLASK, "Flask dependency not installed in local environment")
class TestMultiplexApp(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config.update(TESTING=True)
        self.client = self.app.test_client()

    def test_index_page_returns_200_and_headers(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get("X-Content-Type-Options"), "nosniff")
        self.assertEqual(response.headers.get("X-Frame-Options"), "DENY")
        self.assertIn("Content-Security-Policy", response.headers)

    def test_health_endpoints(self):
        r1 = self.client.get("/health")
        self.assertEqual(r1.status_code, 200)
        self.assertEqual(r1.get_json()["status"], "healthy")

        r2 = self.client.get("/api/health")
        self.assertEqual(r2.status_code, 200)
        self.assertEqual(r2.get_json()["status"], "healthy")

    def test_generate_endpoint_handles_all_entertainment_types(self):
        types = ["movie", "song", "radio", "documentary", "podcast"]
        for t in types:
            payload = {
                "type": t,
                "age_group": "young_adult",
                "language": "hi",
                "extra": {"theme": "cyberpunk"}
            }
            res = self.client.post("/api/generate", json=payload)
            self.assertIn(res.status_code, [200, 202])
            data = res.get_json()
            self.assertTrue("status" in data or "job_id" in data or "result" in data)

    def test_languages_endpoint(self):
        res = self.client.get("/api/languages")
        self.assertEqual(res.status_code, 200)
        langs = res.get_json()
        self.assertIsInstance(langs, list)
        self.assertGreaterEqual(len(langs), 5)


if __name__ == "__main__":
    unittest.main()
