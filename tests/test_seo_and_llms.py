import os


def test_public_seo_files_exist():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(base_dir, "public")
    
    assert os.path.exists(os.path.join(public_dir, "robots.txt")), "robots.txt must exist in public/"
    assert os.path.exists(os.path.join(public_dir, "sitemap.xml")), "sitemap.xml must exist in public/"
    assert os.path.exists(os.path.join(public_dir, "llms.txt")), "llms.txt must exist in public/"
    assert os.path.exists(os.path.join(public_dir, "_headers")), "_headers must exist in public/"


def test_robots_txt_allows_ai_and_search_bots():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    robots_path = os.path.join(base_dir, "public", "robots.txt")
    with open(robots_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    assert "Googlebot" in content
    assert "GPTBot" in content
    assert "PerplexityBot" in content
    assert "ClaudeBot" in content
    assert "sitemap.xml" in content


def test_llms_txt_contains_overview_and_studios():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    llms_path = os.path.join(base_dir, "public", "llms.txt")
    with open(llms_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    assert "Digital Multiplex" in content
    assert "Cinema Studio" in content
    assert "Music Studio" in content
    assert "Radio" in content
