import os
import unittest


class TestSEOAndLLMs(unittest.TestCase):
    def setUp(self):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.public_dir = os.path.join(self.base_dir, "public")

    def test_public_seo_files_exist(self):
        self.assertTrue(os.path.exists(os.path.join(self.public_dir, "robots.txt")), "robots.txt must exist in public/")
        self.assertTrue(os.path.exists(os.path.join(self.public_dir, "sitemap.xml")), "sitemap.xml must exist in public/")
        self.assertTrue(os.path.exists(os.path.join(self.public_dir, "llms.txt")), "llms.txt must exist in public/")
        self.assertTrue(os.path.exists(os.path.join(self.public_dir, "_headers")), "_headers must exist in public/")

    def test_robots_txt_allows_ai_and_search_bots(self):
        robots_path = os.path.join(self.public_dir, "robots.txt")
        with open(robots_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("Googlebot", content)
        self.assertIn("GPTBot", content)
        self.assertIn("PerplexityBot", content)
        self.assertIn("ClaudeBot", content)
        self.assertIn("sitemap.xml", content)

    def test_llms_txt_contains_overview_and_studios(self):
        llms_path = os.path.join(self.public_dir, "llms.txt")
        with open(llms_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("Digital Multiplex", content)
        self.assertIn("Cinema Studio", content)
        self.assertIn("Music Studio", content)
        self.assertIn("Radio", content)


if __name__ == "__main__":
    unittest.main()
