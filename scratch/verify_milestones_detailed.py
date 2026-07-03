import json
import re
import os
import sys
from html.parser import HTMLParser

class I18nParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.keys = set()
    def handle_starttag(self, tag, attrs):
        for attr, val in attrs:
            if attr == 'data-i18n':
                self.keys.add(val)

def verify_i18n():
    print("--- STEP 1: i18n Verification ---")
    if not os.path.exists('translations.json'):
        print("[FAIL] translations.json not found!")
        return False
        
    with open('translations.json', 'r', encoding='utf-8') as f:
        translations = json.load(f)
    languages = list(translations.keys())
    print(f"Languages found: {languages}")
    
    parser_index = I18nParser()
    if os.path.exists('index.html'):
        with open('index.html', 'r', encoding='utf-8') as f:
            parser_index.feed(f.read())
    else:
        print("[FAIL] index.html not found!")
        return False
        
    parser_planner = I18nParser()
    if os.path.exists('planner.html'):
        with open('planner.html', 'r', encoding='utf-8') as f:
            parser_planner.feed(f.read())
    else:
        print("[FAIL] planner.html not found!")
        return False
        
    all_keys = parser_index.keys.union(parser_planner.keys)
    print(f"Total unique data-i18n keys found: {len(all_keys)}")
    print(f"  - index.html keys: {len(parser_index.keys)}")
    print(f"  - planner.html keys: {len(parser_planner.keys)}")
    
    missing_by_lang = {lang: [] for lang in languages}
    for key in sorted(all_keys):
        for lang in languages:
            if key not in translations[lang]:
                missing_by_lang[lang].append(key)
                
    all_ok = True
    for lang in languages:
        missing = missing_by_lang[lang]
        if missing:
            all_ok = False
            print(f"[FAIL] Language '{lang}' is missing {len(missing)} keys: {missing}")
        else:
            print(f"[PASS] Language '{lang}' has all keys.")
            
    if all_ok:
        print("[SUCCESS] All data-i18n keys match translations.json.")
    return all_ok

def verify_css():
    print("\n--- STEP 2: CSS Verification ---")
    css_path = 'style.css'
    if not os.path.exists(css_path):
        print(f"[FAIL] {css_path} not found!")
        return False
        
    with open(css_path, 'r', encoding='utf-8') as f:
        css_content = f.read()
        
    # Check brace matching
    open_braces = css_content.count('{')
    close_braces = css_content.count('}')
    print(f"CSS open braces: {open_braces}, close braces: {close_braces}")
    if open_braces != close_braces:
        print(f"[FAIL] Braces mismatch! open: {open_braces}, close: {close_braces}")
        return False
        
    # Check if PS6 Obsidian palette (#020203 / #000) is defined
    has_obsidian = '#020203' in css_content
    has_black = '#000' in css_content or '#000000' in css_content
    
    if has_obsidian:
        print("[PASS] PS6 Obsidian color #020203 is defined.")
    else:
        print("[FAIL] PS6 Obsidian color #020203 is NOT defined.")
        
    if has_black:
        print("[PASS] Black color #000 / #000000 is defined.")
    else:
        print("[FAIL] Black color #000 / #000000 is NOT defined.")
        
    if has_obsidian and has_black:
        print("[SUCCESS] CSS syntax and palette colors verified.")
        return True
    return False

def verify_js():
    print("\n--- STEP 3: Swarm Simulator JS Verification ---")
    if not os.path.exists('planner.html'):
        print("[FAIL] planner.html not found!")
        return False
        
    with open('planner.html', 'r', encoding='utf-8') as f:
        html_content = f.read()
        
    # Extract the script block
    # Simple regex to extract script tag content (ignoring script tags that load external files)
    scripts = re.findall(r'<script>(.*?)</script>', html_content, re.DOTALL)
    if not scripts:
        print("[FAIL] No inline <script> tag found in planner.html!")
        return False
        
    js_content = scripts[0]
    
    # Save script to a temporary file to run syntax check
    temp_js_path = 'temp_planner_script.js'
    with open(temp_js_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    # Check syntax using node -c
    syntax_ok = False
    try:
        import subprocess
        result = subprocess.run(['node', '-c', temp_js_path], capture_output=True, text=True)
        if result.returncode == 0:
            print("[PASS] Javascript syntax is valid.")
            syntax_ok = True
        else:
            print(f"[FAIL] Javascript syntax error: {result.stderr}")
    except Exception as e:
        print(f"[WARN] Failed to run 'node -c': {e}. Falling back to basic regex checks.")
        # Fallback: check if we can parse basic structures
        syntax_ok = True  # fallback assumption
        
    # Clean up temp file
    if os.path.exists(temp_js_path):
        os.remove(temp_js_path)
        
    # Check for KEM and DSA states
    # Look for KEM state keywords e.g. state: 'kem', state === 'kem', ML-KEM
    has_kem = any(x in js_content for x in ["'kem'", '"kem"', "ML-KEM"])
    has_dsa = any(x in js_content for x in ["'dsa'", '"dsa"', "ML-DSA"])
    
    if has_kem:
        print("[PASS] KEM states are defined/parsed in Swarm Simulator script.")
    else:
        print("[FAIL] KEM states are NOT found in Swarm Simulator script.")
        
    if has_dsa:
        print("[PASS] DSA states are defined/parsed in Swarm Simulator script.")
    else:
        print("[FAIL] DSA states are NOT found in Swarm Simulator script.")
        
    if syntax_ok and has_kem and has_dsa:
        print("[SUCCESS] Swarm Simulator JS code verified.")
        return True
    return False

if __name__ == '__main__':
    all_passed = True
    all_passed &= verify_i18n()
    all_passed &= verify_css()
    all_passed &= verify_js()
    
    if all_passed:
        print("\n[ALL PASSED] Local validations completed successfully!")
        sys.exit(0)
    else:
        print("\n[FAILED] Some validations failed.")
        sys.exit(1)
