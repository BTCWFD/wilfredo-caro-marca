import os
import re
import sys
import time
import subprocess
from playwright.sync_api import sync_playwright

# Reconfigure stdout/stderr to handle UTF-8 symbols like ➜ on Windows
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

AGENT_DIR = r"c:\Users\USER\Wilfredo-Caro-Marca\.agents\teamwork_preview_explorer_dev_preview"

def kill_proc_tree(pid):
    print(f"Killing process tree for PID {pid}...")
    subprocess.run(f"taskkill /F /T /PID {pid}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def start_server(cmd, cwd, default_port, log_filename):
    print(f"\n--- Starting server: '{cmd}' in '{cwd}' ---")
    log_path = os.path.join(AGENT_DIR, log_filename)
    log_file = open(log_path, "w", encoding="utf-8")
    
    proc = subprocess.Popen(
        cmd,
        cwd=cwd,
        stdout=log_file,
        stderr=subprocess.STDOUT,
        shell=True
    )
    
    time.sleep(5) # Wait for server to write logs and spin up
    
    port = None
    if os.path.exists(log_path):
        with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            safe_content = content.encode('utf-8', errors='replace').decode('utf-8', errors='replace')
            print(f"[Server Log Content for {log_filename}]:\n{safe_content}\n[End Log]")
            m = re.search(r'http://(?:localhost|127\.0\.0\.1|\[::1\]):(\d+)', content)
            if m:
                port = int(m.group(1))
                print(f"--> Found active port in log: {port}")
            else:
                m2 = re.search(r':(\d{4,5})', content)
                if m2:
                    port = int(m2.group(1))
                    print(f"--> Found port from numbers: {port}")
                    
    if port is None:
        port = default_port
        print(f"--> No port found in log, using default port: {port}")
        
    return proc, port, log_file

def run_brand_site_audit(port, env_name):
    print(f"\n=== Auditing Wilfredo Caro Brand Web App ({env_name}) on port {port} ===")
    
    console_logs = []
    network_errors = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        
        # Listeners
        page.on("console", lambda msg: console_logs.append(f"[{msg.type.upper()}] {msg.text}"))
        page.on("pageerror", lambda err: console_logs.append(f"[EXCEPTION] {err.message}\n{err.stack}"))
        page.on("response", lambda res: network_errors.append(f"[STATUS {res.status}] {res.request.method} {res.url}") if res.status >= 400 else None)
        page.on("requestfailed", lambda req: network_errors.append(f"[FAILED] {req.method} {req.url} - {req.failure if req.failure else 'Unknown'}"))
        
        url = f"http://localhost:{port}/"
        print(f"Navigating to {url}...")
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=12000)
        except Exception as e:
            print(f"Navigation timed out or failed (expected in offline mode): {e}")
            
        page.wait_for_timeout(2000)
        
        # Force hide preloader
        try:
            page.evaluate("const p = document.getElementById('preloader'); if (p) p.style.display = 'none';")
            print("Force hid preloader")
        except Exception as e:
            print(f"Could not hide preloader: {e}")
            
        # 0. Initial load screenshot
        try:
            page.screenshot(path=os.path.join(AGENT_DIR, f"{env_name}_0_loaded.png"))
            print("Screenshot taken: initial load")
        except Exception as e:
            print(f"Failed initial screenshot: {e}")
        
        # 1. Toggle theme
        try:
            print("Toggling theme...")
            theme_btn = page.locator("#theme-toggle")
            if theme_btn.is_visible():
                theme_btn.click(timeout=3000)
                page.wait_for_timeout(1000)
                page.screenshot(path=os.path.join(AGENT_DIR, f"{env_name}_1_theme_toggled.png"))
                print("Screenshot taken: theme toggled")
                theme_btn.click(timeout=3000)
                page.wait_for_timeout(500)
            else:
                print("WARNING: Theme toggle button not visible!")
        except Exception as e:
            print(f"Error toggling theme: {e}")
            
        # 2. Change language
        try:
            print("Toggling languages...")
            es_btn = page.locator('button[data-lang="es"]')
            ja_btn = page.locator('button[data-lang="ja"]')
            en_btn = page.locator('button[data-lang="en"]')
            
            if es_btn.is_visible():
                es_btn.click(timeout=3000)
                page.wait_for_timeout(1000)
                page.screenshot(path=os.path.join(AGENT_DIR, f"{env_name}_2_lang_es.png"))
                print("Screenshot taken: lang ES")
                
            if ja_btn.is_visible():
                ja_btn.click(timeout=3000)
                page.wait_for_timeout(1000)
                page.screenshot(path=os.path.join(AGENT_DIR, f"{env_name}_2_lang_ja.png"))
                print("Screenshot taken: lang JA")
                
            if en_btn.is_visible():
                en_btn.click(timeout=3000)
                page.wait_for_timeout(1000)
                page.screenshot(path=os.path.join(AGENT_DIR, f"{env_name}_2_lang_en.png"))
                print("Screenshot taken: lang EN")
        except Exception as e:
            print(f"Error toggling languages: {e}")
            
        # 3. Open contact modal (CV Access Form)
        try:
            print("Testing CV Download Modal...")
            cv_btn = page.locator("#cv-download-btn")
            if cv_btn.is_visible():
                cv_btn.click(timeout=3000)
                page.wait_for_timeout(1000)
                page.screenshot(path=os.path.join(AGENT_DIR, f"{env_name}_3_cv_modal_open.png"))
                
                page.fill("#cv-modal-form input[type='text']", "Auditor Test")
                
                email_field = page.locator("#cv-modal-form input[type='email']")
                if email_field.is_visible():
                    email_field.fill("auditor@example.com")
                    
                inputs = page.locator("#cv-modal-form input[type='text']")
                if inputs.count() >= 2:
                    inputs.nth(1).fill("Audit Company")
                
                purpose_select = page.locator("#cv-modal-form select")
                if purpose_select.is_visible():
                    purpose_select.select_option(index=1)
                    
                page.screenshot(path=os.path.join(AGENT_DIR, f"{env_name}_3_cv_modal_filled.png"))
                
                print("Submitting CV modal form...")
                submit_btn = page.locator("#cv-modal-form button[type='submit']")
                if submit_btn.is_visible():
                    submit_btn.click(timeout=3000)
                    page.wait_for_timeout(3000)
                    page.screenshot(path=os.path.join(AGENT_DIR, f"{env_name}_3_cv_modal_submitted.png"))
                    
                close_btn = page.locator("#cv-modal-close")
                if close_btn.is_visible():
                    close_btn.click(timeout=3000)
                    page.wait_for_timeout(500)
            else:
                print("WARNING: CV Download button not visible!")
        except Exception as e:
            print(f"Error with CV download modal: {e}")
            
        # 4. Open service request modal
        try:
            print("Testing Service Request Modal...")
            service_trigger = page.locator(".service-modal-trigger").first
            if service_trigger.is_visible():
                service_trigger.click(timeout=3000)
                page.wait_for_timeout(1000)
                page.screenshot(path=os.path.join(AGENT_DIR, f"{env_name}_4_service_modal.png"))
                
                close_btn = page.locator("#service-modal-close")
                if close_btn.is_visible():
                    close_btn.click(timeout=3000)
                    page.wait_for_timeout(500)
            else:
                print("WARNING: Service modal trigger not visible!")
        except Exception as e:
            print(f"Error with service request modal: {e}")
            
        # 5. Interact with audio player
        try:
            print("Testing Audio Player...")
            play_audio_btn = page.locator("#player-play-btn")
            if play_audio_btn.is_visible():
                print("Clicking play...")
                play_audio_btn.click(timeout=3000)
                page.wait_for_timeout(2000)
                page.screenshot(path=os.path.join(AGENT_DIR, f"{env_name}_5_audio_playing.png"))
                
                next_audio_btn = page.locator("#player-next-btn")
                if next_audio_btn.is_visible():
                    print("Clicking next track...")
                    next_audio_btn.click(timeout=3000)
                    page.wait_for_timeout(1000)
                    
                prev_audio_btn = page.locator("#player-prev-btn")
                if prev_audio_btn.is_visible():
                    print("Clicking prev track...")
                    prev_audio_btn.click(timeout=3000)
                    page.wait_for_timeout(1000)
                    
                print("Pausing audio...")
                play_audio_btn.click(timeout=3000)
                page.wait_for_timeout(500)
            else:
                print("WARNING: Audio play button not visible!")
        except Exception as e:
            print(f"Error with audio player: {e}")
            
        # 6. AI Assistant chatbot interaction
        try:
            print("Testing AI Assistant...")
            ai_trigger_btn = page.locator("#ai-trigger")
            if ai_trigger_btn.is_visible():
                ai_trigger_btn.click(timeout=3000)
                page.wait_for_timeout(1000)
                page.screenshot(path=os.path.join(AGENT_DIR, f"{env_name}_6_ai_open.png"))
                
                ai_input_field = page.locator("#ai-input")
                ai_send_btn = page.locator("#ai-send")
                if ai_input_field.is_visible() and ai_send_btn.is_visible():
                    print("Sending query to AI assistant...")
                    ai_input_field.fill("Who is Wilfredo?")
                    ai_send_btn.click(timeout=3000)
                    page.wait_for_timeout(3000)
                    page.screenshot(path=os.path.join(AGENT_DIR, f"{env_name}_6_ai_responded.png"))
                    
                close_ai = page.locator("#ai-close")
                if close_ai.is_visible():
                    close_ai.click(timeout=3000)
                    page.wait_for_timeout(500)
            else:
                print("WARNING: AI Assistant trigger not visible!")
        except Exception as e:
            print(f"Error with AI assistant: {e}")
            
        # Click local anchor links to test routing
        try:
            print("Walking through local anchor links...")
            nav_links = page.locator("nav a, .nav-links a")
            link_count = nav_links.count()
            print(f"Found {link_count} total navigation links.")
            clicked_count = 0
            for i in range(link_count):
                if clicked_count >= 5:
                    break
                link = nav_links.nth(i)
                try:
                    href = link.get_attribute("href")
                    # ONLY click local links to avoid loading external sites
                    if href and href.startswith("#"):
                        text = link.inner_text().strip()
                        print(f"Clicking local link {i}: '{text}' -> {href}")
                        link.click(timeout=3000)
                        page.wait_for_timeout(800)
                        clicked_count += 1
                except Exception as e:
                    print(f"Could not click link {i}: {e}")
        except Exception as e:
            print(f"Error walking links: {e}")
                
        try:
            page.screenshot(path=os.path.join(AGENT_DIR, f"{env_name}_7_final.png"))
        except Exception as e:
            print(f"Failed final screenshot: {e}")
            
        page.close()
        browser.close()
        
    return console_logs, network_errors

def run_mobile_poc_audit(port):
    env_name = "mobile_poc"
    print(f"\n=== Auditing Mobile PoC App on port {port} ===")
    
    console_logs = []
    network_errors = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 375, "height": 812, "is_mobile": True, "has_touch": True}) # mobile simulation!
        page = context.new_page()
        
        page.on("console", lambda msg: console_logs.append(f"[{msg.type.upper()}] {msg.text}"))
        page.on("pageerror", lambda err: console_logs.append(f"[EXCEPTION] {err.message}\n{err.stack}"))
        page.on("response", lambda res: network_errors.append(f"[STATUS {res.status}] {res.request.method} {res.url}") if res.status >= 400 else None)
        page.on("requestfailed", lambda req: network_errors.append(f"[FAILED] {req.method} {req.url} - {req.failure}"))
        
        url = f"http://localhost:{port}/app/"
        print(f"Navigating to {url}...")
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=12000)
        except Exception as e:
            print(f"Navigation timed out or failed: {e}")
            
        page.wait_for_timeout(2000)
        
        # 0. Initial loaded
        try:
            page.screenshot(path=os.path.join(AGENT_DIR, f"{env_name}_0_loaded.png"))
            print("Screenshot taken: Mobile PoC initial load")
        except Exception as e:
            print(f"Failed Mobile PoC screenshot: {e}")
            
        # 1. Open Floating Assistant chatbot
        try:
            print("Testing Floating Assistant FAB...")
            fab_btn = page.locator("button.fab")
            if fab_btn.is_visible():
                fab_btn.click(timeout=3000)
                page.wait_for_timeout(1000)
                page.screenshot(path=os.path.join(AGENT_DIR, f"{env_name}_1_chat_open.png"))
                
                chat_input = page.locator("input.chat-input")
                send_btn = page.locator("button.send-btn")
                if chat_input.is_visible() and send_btn.is_visible():
                    print("Sending message in Mobile Assistant...")
                    chat_input.fill("Hello bot")
                    send_btn.click(timeout=3000)
                    page.wait_for_timeout(2000)
                    page.screenshot(path=os.path.join(AGENT_DIR, f"{env_name}_1_chat_sent.png"))
                    
                close_btn = page.locator("button.close-btn")
                if close_btn.is_visible():
                    close_btn.click(timeout=3000)
                    page.wait_for_timeout(500)
            else:
                print("WARNING: Mobile assistant FAB not visible!")
        except Exception as e:
            print(f"Error with mobile assistant: {e}")
            
        # 2. Swipe to Deploy interaction
        try:
            print("Testing Swipe to Deploy...")
            thumb = page.locator(".swipe-thumb")
            container = page.locator(".swipe-container")
            
            if thumb.is_visible() and container.is_visible():
                t_box = thumb.bounding_box()
                c_box = container.bounding_box()
                
                if t_box and c_box:
                    x_start = t_box['x'] + t_box['width'] / 2
                    y = t_box['y'] + t_box['height'] / 2
                    
                    print("Dragging thumb halfway...")
                    page.mouse.move(x_start, y)
                    page.mouse.down()
                    page.mouse.move(x_start + 80, y)
                    page.wait_for_timeout(500)
                    page.screenshot(path=os.path.join(AGENT_DIR, f"{env_name}_2_swiping.png"))
                    
                    drag_distance = c_box['width'] - t_box['width'] - 5
                    print(f"Dragging thumb fully by {drag_distance}px...")
                    page.mouse.move(x_start + drag_distance, y)
                    page.wait_for_timeout(500)
                    page.mouse.up()
                    page.wait_for_timeout(1000)
                    page.screenshot(path=os.path.join(AGENT_DIR, f"{env_name}_2_deployed.png"))
                    print("Swipe to deploy action complete")
            else:
                print("WARNING: Swipe-to-deploy elements not visible!")
        except Exception as e:
            print(f"Error with swipe to deploy: {e}")
            
        page.close()
        browser.close()
        
    return console_logs, network_errors

def main():
    print("Starting Comprehensive Browser Audit...")
    results = {}
    
    # Pre-clean up any leaked processes
    print("Cleaning up any existing Node/Vite processes on ports 5173/4173...")
    subprocess.run("taskkill /F /IM node.exe", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)
    
    # --- ENVIRONMENT 1: Development Server ---
    print("\n==============================================")
    print("=== ENVIRONMENT 1: ROOT DEV SERVER (npm run dev) ===")
    print("==============================================")
    
    dev_proc, dev_port, dev_log = start_server("npm run dev", "c:\\Users\\USER\\Wilfredo-Caro-Marca", 5173, "dev_server.log")
    try:
        c_logs, net_errs = run_brand_site_audit(dev_port, "env1_dev")
        results["env1_dev"] = {
            "port": dev_port,
            "console_logs": c_logs,
            "network_errors": net_errs,
            "status": "SUCCESS"
        }
    except Exception as ex:
        print(f"Error during Env 1 Audit: {ex}")
        results["env1_dev"] = {
            "port": dev_port,
            "status": "FAILED",
            "error": str(ex)
        }
    finally:
        kill_proc_tree(dev_proc.pid)
        dev_log.close()
        time.sleep(2)
        
    # --- ENVIRONMENT 2: Production Preview Server ---
    print("\n==============================================")
    print("=== ENVIRONMENT 2: ROOT PREVIEW (npm run build & preview) ===")
    print("==============================================")
    
    print("Running build step: 'npm run build'...")
    build_start = time.time()
    build_proc = subprocess.run(
        "npm run build",
        cwd="c:\\Users\\USER\\Wilfredo-Caro-Marca",
        shell=True,
        capture_output=True,
        text=True
    )
    print(f"Build completed in {time.time() - build_start:.2f}s")
    print(f"Build exit code: {build_proc.returncode}")
    
    if build_proc.returncode != 0:
        print("Build stdout:\n", build_proc.stdout)
        print("Build stderr:\n", build_proc.stderr)
        results["env2_preview"] = {
            "status": "BUILD_FAILED",
            "error": build_proc.stderr
        }
    else:
        preview_proc, preview_port, preview_log = start_server("npm run preview", "c:\\Users\\USER\\Wilfredo-Caro-Marca", 4173, "preview_server.log")
        try:
            c_logs, net_errs = run_brand_site_audit(preview_port, "env2_preview")
            results["env2_preview"] = {
                "port": preview_port,
                "console_logs": c_logs,
                "network_errors": net_errs,
                "status": "SUCCESS"
            }
        except Exception as ex:
            print(f"Error during Env 2 Audit: {ex}")
            results["env2_preview"] = {
                "port": preview_port,
                "status": "FAILED",
                "error": str(ex)
            }
        finally:
            kill_proc_tree(preview_proc.pid)
            preview_log.close()
            time.sleep(2)
            
    # --- ENVIRONMENT 3: Mobile PoC Dev Server ---
    print("\n==============================================")
    print("=== ENVIRONMENT 3: MOBILE POC DEV (npm run dev in Mobile-App-PoC) ===")
    print("==============================================")
    
    mobile_proc, mobile_port, mobile_log = start_server("npm run dev", "c:\\Users\\USER\\Wilfredo-Caro-Marca\\Mobile-App-PoC", 5173, "mobile_server.log")
    try:
        c_logs, net_errs = run_mobile_poc_audit(mobile_port)
        results["env3_mobile_poc"] = {
            "port": mobile_port,
            "console_logs": c_logs,
            "network_errors": net_errs,
            "status": "SUCCESS"
        }
    except Exception as ex:
        print(f"Error during Env 3 Audit: {ex}")
        results["env3_mobile_poc"] = {
            "port": mobile_port,
            "status": "FAILED",
            "error": str(ex)
        }
    finally:
        kill_proc_tree(mobile_proc.pid)
        mobile_log.close()
        
    write_findings_file(results)

def write_findings_file(results):
    report_path = os.path.join(AGENT_DIR, "audit_raw_results.txt")
    print(f"\nWriting raw audit results to {report_path}...")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("=== RAW BROWSER-BASED AUDIT RESULTS ===\n\n")
        for env, data in results.items():
            f.write(f"Environment: {env}\n")
            f.write(f"Status: {data.get('status')}\n")
            if "port" in data:
                f.write(f"Port: {data.get('port')}\n")
            if "error" in data:
                f.write(f"Error: {data.get('error')}\n")
            if "console_logs" in data:
                f.write("\n--- Console Logs ---\n")
                for log in data["console_logs"]:
                    f.write(f"{log}\n")
            if "network_errors" in data:
                f.write("\n--- Network / HTTP Failures ---\n")
                for err in data["network_errors"]:
                    f.write(f"{err}\n")
            f.write("\n" + "="*50 + "\n\n")
            
    print("Done running audit.")

if __name__ == "__main__":
    main()
