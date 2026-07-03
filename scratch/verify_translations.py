import re
import json

def verify():
    # Read index.html and find all data-i18n values
    with open('index.html', 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Extract keys like data-i18n="key_name"
    keys_in_html = set(re.findall(r'data-i18n=["\']([^"\']+)["\']', html_content))
    
    # Read translations.json
    with open('translations.json', 'r', encoding='utf-8') as f:
        translations = json.load(f)
    
    languages = list(translations.keys())
    print(f"Languages found in translations.json: {languages}")
    
    missing_by_lang = {lang: [] for lang in languages}
    
    for key in sorted(keys_in_html):
        for lang in languages:
            if key not in translations[lang]:
                missing_by_lang[lang].append(key)
                
    print("\n--- Validation Results ---")
    all_ok = True
    for lang, missing in missing_by_lang.items():
        if missing:
            all_ok = False
            print(f"Language '{lang}' is missing {len(missing)} keys:")
            for k in missing:
                print(f"  - {k}")
        else:
            print(f"Language '{lang}' has all keys.")
            
    if all_ok:
        print("\nAll data-i18n keys in index.html are present in translations.json!")
    else:
        print("\nMismatches found!")

if __name__ == '__main__':
    verify()
