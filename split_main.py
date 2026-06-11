import os
import re

main_path = "c:/Users/USER/Wilfredo-Caro-Marca/main.js"
modules_dir = "c:/Users/USER/Wilfredo-Caro-Marca/src/modules"
os.makedirs(modules_dir, exist_ok=True)

with open(main_path, 'r', encoding='utf-8') as f:
    content = f.read()

sections = [
    ("Theme Toggle Logic", "theme.js"),
    ("Dynamic Geo-Pricing Logic", "pricing.js"),
    ("Service Request Modal Logic", "service-modal.js"),
    ("Web3: Connect Wallet", "web3.js"),
    ("Dynamic Contact Info Block", "contact-info.js"),
    ("Multilingual (i18n) Logic", "i18n.js"),
    ("Navbar Scroll Effect", "navbar.js"),
    ("Mobile Menu Toggle", "mobile-menu.js"),
    ("Scroll Reveal Animations", "scroll-reveal.js"),
    ("Skills Tab Switching", "skills-tab.js"),
    ("Smooth Scrolling", "smooth-scroll.js"),
    ("Preloader Logic", "preloader.js"),
    ("Custom Cursor Tracker", "cursor.js"),
    ("3D Background", "three-bg.js"),
    ("Medium Blog Dynamic Fetch", "medium-blog.js"),
    ("AI Assistant Logic", "ai-assistant.js"),
    ("3D Card Tilt Effect", "card-tilt.js"),
    ("Custom DJ Player Logic", "audio-player.js"),
    ("Floating UI Controls", "floating-ui.js"),
    ("CV Download Guard", "cv-download.js"),
    ("Payment Gateways Logic", "payments.js"),
    ("Mobile: light haptic feedback", "haptic.js"),
    ("Mobile: keep the AI chat input above", "viewport.js"),
]

parts = re.split(r'\n// --- (.*?) ---\n', content)

window_utils = """
window.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
window.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
window.trackEvent = (action, params = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, params);
  }
};
"""

new_main_content = "import translations from './src/translations.js';\nwindow.translations = translations;\nimport { registerSW } from 'virtual:pwa-register';\n"
new_main_content += window_utils

for i in range(1, len(parts), 2):
    header = parts[i]
    body = parts[i+1]
    
    filename = header.split(' ')[0].lower() + '-' + str(i) + ".js"
    for title, fname in sections:
        if title in header:
            filename = fname
            break
    
    body = body.replace('trackEvent(', 'window.trackEvent(')
    body = body.replace('prefersReducedMotion', 'window.prefersReducedMotion')
    body = body.replace('isTouchDevice', 'window.isTouchDevice')
    body = body.replace('translations[', 'window.translations[')
    
    with open(os.path.join(modules_dir, filename), 'w', encoding='utf-8') as f:
        f.write("// --- " + header + " ---\n")
        f.write(body)
    
    new_main_content += f"import './src/modules/{filename}';\n"

new_main_content += """
// --- PWA: register the service worker only for built output (PROD) ---
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}
"""

with open(main_path, 'w', encoding='utf-8') as f:
    f.write(new_main_content)

print("Split completed successfully!")
