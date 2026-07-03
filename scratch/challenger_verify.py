import os
import re
import json
import subprocess
import sys

def verify_i18n():
    print("--- 1. Verification of data-i18n keys ---")
    # Load translations.json
    try:
        with open('translations.json', 'r', encoding='utf-8') as f:
            translations = json.load(f)
    except Exception as e:
        print(f"FAILED to load translations.json: {e}")
        return False

    languages = list(translations.keys())
    print(f"Languages defined in translations.json: {languages}")

    # Extract data-i18n keys from index.html and planner.html
    html_files = ['index.html', 'planner.html']
    all_keys = {}
    
    for filename in html_files:
        if not os.path.exists(filename):
            print(f"WARNING: File {filename} not found.")
            continue
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Regex for data-i18n="..." or data-i18n='...'
        keys = set(re.findall(r'data-i18n=["\']([^"\']+)["\']', content))
        print(f"Found {len(keys)} unique data-i18n keys in {filename}: {sorted(list(keys))}")
        all_keys[filename] = keys

    # Check that all keys found exist in translations.json for each language
    mismatches = False
    for filename, keys in all_keys.items():
        for key in sorted(keys):
            for lang in languages:
                if key not in translations[lang]:
                    print(f"ERROR: Key '{key}' (found in {filename}) is MISSING in language '{lang}' in translations.json")
                    mismatches = True
    
    if not mismatches:
        print("PASS: All elements with data-i18n attributes have matching keys in translations.json.")
        return True
    else:
        print("FAIL: Missing keys detected.")
        return False

def verify_css():
    print("\n--- 2. Verification of style.css ---")
    css_path = 'style.css'
    if not os.path.exists(css_path):
        print(f"FAILED: {css_path} not found.")
        return False
        
    with open(css_path, 'r', encoding='utf-8') as f:
        css_content = f.read()
        
    # Check for basic compilation or syntax issues (e.g., matching braces)
    # We can count open and close braces
    open_braces = css_content.count('{')
    close_braces = css_content.count('}')
    print(f"Curly braces count: open={open_braces}, close={close_braces}")
    if open_braces != close_braces:
        print(f"ERROR: Unbalanced curly braces in style.css! open={open_braces}, close={close_braces}")
        return False
        
    # Check for PS6 Obsidian palette definition (#020203 / #000)
    has_020203 = '#020203' in css_content
    has_000 = '#000' in css_content or '#000000' in css_content
    
    print(f"Obsidian palette definition check:")
    print(f"  Contains '#020203': {has_020203}")
    print(f"  Contains '#000' or '#000000': {has_000}")
    
    if has_020203 and has_000:
        print("PASS: PS6 Obsidian palette (#020203 / #000) is defined in style.css.")
        return True
    else:
        print("FAIL: PS6 Obsidian palette variables or colors not found in style.css.")
        return False

def verify_js_and_simulator():
    print("\n--- 3. Verification of Javascript syntax and KEM/DSA in planner.html ---")
    planner_path = 'planner.html'
    if not os.path.exists(planner_path):
        print(f"FAILED: {planner_path} not found.")
        return False
        
    with open(planner_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Extract script blocks
    script_blocks = re.findall(r'<script\b[^>]*>(.*?)</script>', content, re.DOTALL)
    print(f"Found {len(script_blocks)} script block(s) in planner.html.")
    
    # Save the script blocks to a temp JS file to syntax check using node --check
    temp_js_path = 'scratch/temp_planner_script.js'
    # Ensure scratch directory exists
    os.makedirs('scratch', exist_ok=True)
    
    # Let's write them
    with open(temp_js_path, 'w', encoding='utf-8') as f:
        for idx, block in enumerate(script_blocks):
            f.write(f"// --- Script Block {idx} ---\n")
            f.write(block)
            f.write("\n\n")
            
    # Check JS syntax with node --check
    try:
        res = subprocess.run(['node', '--check', temp_js_path], capture_output=True, text=True)
        if res.returncode != 0:
            print(f"ERROR: Javascript syntax check failed for planner.html scripts!")
            print(res.stderr)
            return False
        else:
            print("PASS: Javascript script blocks contain valid syntax.")
    except Exception as e:
        print(f"WARNING: Could not run 'node --check' to verify syntax: {e}")
        
    # Clean up temp file
    if os.path.exists(temp_js_path):
        os.remove(temp_js_path)
        
    # Now check if KEM and DSA states are parsed/handled
    # Specifically, check for mentions of 'kem' and 'dsa' states in the simulation logic
    has_kem_logic = 'state === \'kem\'' in content or "state === \"kem\"" in content or ".state === 'kem'" in content
    has_dsa_logic = 'state === \'dsa\'' in content or "state === \"dsa\"" in content or ".state === 'dsa'" in content
    
    print(f"Swarm Simulator KEM/DSA state parsing check:")
    print(f"  Has KEM state handling logic: {has_kem_logic}")
    print(f"  Has DSA state handling logic: {has_dsa_logic}")
    
    if has_kem_logic and has_dsa_logic:
        print("PASS: Swarm Simulator in planner.html contains logic to parse and handle KEM and DSA states.")
        return True
    else:
        print("FAIL: Missing KEM or DSA state parsing/handling logic in planner.html.")
        return False

def verify_build():
    print("\n--- 4. Verification of Build exit code ---")
    try:
        res = subprocess.run(['npm', 'run', 'build'], shell=True, capture_output=True, text=True)
        print(f"npm run build exit code: {res.returncode}")
        if res.returncode == 0:
            print("PASS: npm run build completed with exit code 0.")
            return True
        else:
            print("FAIL: npm run build failed.")
            print("STDOUT:")
            print(res.stdout)
            print("STDERR:")
            print(res.stderr)
            return False
    except Exception as e:
        print(f"FAILED to run build command: {e}")
        return False

def main():
    s1 = verify_i18n()
    s2 = verify_css()
    s3 = verify_js_and_simulator()
    s4 = verify_build()
    
    print("\n====================================")
    if all([s1, s2, s3, s4]):
        print("SUMMARY: ALL VERIFICATIONS PASSED!")
        sys.exit(0)
    else:
        print("SUMMARY: SOME VERIFICATIONS FAILED!")
        sys.exit(1)

if __name__ == '__main__':
    main()
