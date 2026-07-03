import os
import xml.etree.ElementTree as ET
import json
import re

dist_dir = r"c:\Users\USER\Wilfredo-Caro-Marca\dist"

def test_index_html():
    index_path = os.path.join(dist_dir, "index.html")
    assert os.path.exists(index_path), "index.html not found in dist"
    with open(index_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 1. Canonical tag
    canonical_match = re.search(r'<link rel="canonical" href="([^"]+)"', content)
    assert canonical_match, "Canonical link tag missing in index.html"
    assert canonical_match.group(1) == "https://wilfredocaro.com/", f"Wrong canonical: {canonical_match.group(1)}"
    print("[PASS] index.html: Canonical tag is correct.")

    # 2. Hreflang alternate tags
    hreflangs = re.findall(r'<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"', content)
    expected_hreflangs = {
        "x-default": "https://wilfredocaro.com/",
        "en": "https://wilfredocaro.com/?lang=en",
        "es": "https://wilfredocaro.com/?lang=es",
        "ja": "https://wilfredocaro.com/?lang=ja",
        "zh": "https://wilfredocaro.com/?lang=zh",
        "ko": "https://wilfredocaro.com/?lang=ko",
        "ru": "https://wilfredocaro.com/?lang=ru",
        "ar": "https://wilfredocaro.com/?lang=ar"
    }
    found_hreflangs = dict(hreflangs)
    for lang, href in expected_hreflangs.items():
        assert lang in found_hreflangs, f"Missing hreflang: {lang}"
        assert found_hreflangs[lang] == href, f"Wrong hreflang href for {lang}: {found_hreflangs[lang]}"
    print(f"[PASS] index.html: All {len(expected_hreflangs)} hreflang alternate tags are correct.")

    # 3. Main script & style tags
    js_match = re.search(r'<script type="module" crossorigin src="([^"]+)"', content)
    css_match = re.search(r'<link rel="stylesheet" crossorigin href="([^"]+)"', content)
    assert js_match, "Main script missing in index.html"
    assert css_match, "Main stylesheet missing in index.html"
    
    js_path = os.path.join(dist_dir, js_match.group(1).lstrip('/'))
    css_path = os.path.join(dist_dir, css_match.group(1).lstrip('/'))
    assert os.path.exists(js_path), f"Referenced JS file does not exist: {js_path}"
    assert os.path.exists(css_path), f"Referenced CSS file does not exist: {css_path}"
    print("[PASS] index.html: Script and stylesheet references are correct.")

    # 4. JSON-LD parsing
    json_ld_match = re.search(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', content, re.DOTALL)
    assert json_ld_match, "JSON-LD schema tag missing in index.html"
    try:
        json_data = json.loads(json_ld_match.group(1).strip())
        assert json_data.get("@type") == "Person", "JSON-LD schema is not of type 'Person'"
        assert json_data.get("name") == "Wilfredo Caro", "JSON-LD schema name mismatch"
        print("[PASS] index.html: JSON-LD schema is valid and parsed correctly.")
    except Exception as e:
        raise AssertionError(f"Failed to parse JSON-LD: {e}")

    # 5. Header hierarchy
    headers = re.findall(r'<h[1-6][^>]*>(.*?)</h[1-6]>', content, re.DOTALL)
    assert len(headers) > 0, "No headers found in index.html"
    print(f"[PASS] index.html: Layout headers found (count: {len(headers)}).")

def test_epk_html():
    epk_path = os.path.join(dist_dir, "epk", "index.html")
    assert os.path.exists(epk_path), "epk/index.html not found in dist"
    with open(epk_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Canonical tag
    canonical_match = re.search(r'<link rel="canonical" href="([^"]+)"', content)
    assert canonical_match, "Canonical link tag missing in epk/index.html"
    assert canonical_match.group(1) == "https://wilfredocaro.com/epk/", f"Wrong epk canonical: {canonical_match.group(1)}"
    print("[PASS] epk/index.html: Canonical tag is correct.")

    # 2. Open Graph meta tags
    og_title = re.search(r'<meta property="og:title" content="([^"]+)"', content)
    og_type = re.search(r'<meta property="og:type" content="([^"]+)"', content)
    og_image = re.search(r'<meta property="og:image" content="([^"]+)"', content)
    og_url = re.search(r'<meta property="og:url" content="([^"]+)"', content)
    assert og_title and og_type and og_image and og_url, "Some Open Graph tags are missing in epk/index.html"
    assert og_type.group(1) == "profile", f"Expected type 'profile', got: {og_type.group(1)}"
    print("[PASS] epk/index.html: Open Graph tags verified.")

    # 3. Twitter metadata
    tw_card = re.search(r'<meta name="twitter:card" content="([^"]+)"', content)
    tw_title = re.search(r'<meta name="twitter:title" content="([^"]+)"', content)
    tw_image = re.search(r'<meta name="twitter:image" content="([^"]+)"', content)
    assert tw_card and tw_title and tw_image, "Some Twitter tags are missing in epk/index.html"
    assert tw_card.group(1) == "summary_large_image", f"Expected card 'summary_large_image', got: {tw_card.group(1)}"
    print("[PASS] epk/index.html: Twitter tags verified.")

def test_robots_txt():
    robots_path = os.path.join(dist_dir, "robots.txt")
    assert os.path.exists(robots_path), "robots.txt not found in dist"
    with open(robots_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    disallows = []
    has_sitemap = False
    for line in lines:
        line = line.strip()
        if line.startswith("Disallow:"):
            disallows.append(line.split(":", 1)[1].strip())
        if line.startswith("Sitemap:"):
            has_sitemap = True
            assert line.split(":", 1)[1].strip() == "https://wilfredocaro.com/sitemap.xml"

    expected_disallows = ["/.netlify/", "/private/", "/.agents/", "/planner.html", "/app/", "/app/index.html"]
    for d in expected_disallows:
        assert d in disallows, f"Missing Disallow: {d}"
    assert has_sitemap, "Sitemap directive missing or incorrect in robots.txt"
    print("[PASS] robots.txt: Exclusions and sitemap directives are correct.")

def test_sitemap_xml():
    sitemap_path = os.path.join(dist_dir, "sitemap.xml")
    assert os.path.exists(sitemap_path), "sitemap.xml not found in dist"
    
    # Parse XML
    tree = ET.parse(sitemap_path)
    root = tree.getroot()
    
    # Namespaces
    namespaces = {
        's': 'http://www.sitemaps.org/schemas/sitemap/0.9',
        'xhtml': 'http://www.w3.org/1999/xhtml'
    }
    
    urls = []
    for url in root.findall('s:url', namespaces):
        loc = url.find('s:loc', namespaces).text
        urls.append(loc)
        
        # Verify alternate translations links on homepages
        if loc == "https://wilfredocaro.com/" or loc.startswith("https://wilfredocaro.com/?lang="):
            alts = url.findall('xhtml:link', namespaces)
            assert len(alts) == 8, f"Expected 8 alternates for {loc}, found {len(alts)}"

    assert "https://wilfredocaro.com/epk/" in urls, "EPK page not present in sitemap.xml"
    assert "https://wilfredocaro.com/" in urls, "Home page not present in sitemap.xml"
    print("[PASS] sitemap.xml: EPK page and language variants are fully verified.")

if __name__ == "__main__":
    try:
        test_index_html()
        test_epk_html()
        test_robots_txt()
        test_sitemap_xml()
        print("\nALL TESTS PASSED SUCCESSFULLY!")
    except AssertionError as e:
        print(f"\nTEST FAILURE: {e}")
        exit(1)
    except Exception as e:
        print(f"\nUNEXPECTED ERROR: {e}")
        exit(2)
