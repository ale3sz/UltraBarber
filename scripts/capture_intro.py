import sys
import os
from playwright.sync_api import sync_playwright

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

SCREENSHOTS_DIR = os.path.join(os.getcwd(), 'audit_screenshots')
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
BASE_URL = "http://localhost:7200"

def capture_intro():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=EDGE_PATH,
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox']
        )
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # 1. Entering (Curtain + Champagne Shears + Brand)
        print("[INTRO] Capturando 01_curtain_shears...")
        page.goto(f"{BASE_URL}?intro_pause=entering")
        page.wait_for_selector('h2:has-text("David Barber")')
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "intro_01_curtain_shears.png"))

        # 2. Snipping (Blades closed in precision snip)
        print("[INTRO] Capturando 02_diagonal_snip...")
        page.goto(f"{BASE_URL}?intro_pause=snipping")
        page.wait_for_selector('h2:has-text("David Barber")')
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "intro_02_diagonal_snip.png"))

        # 3. Cutting (Laser cut line visible and panels sliding)
        print("[INTRO] Capturando 03_sliding_reveal...")
        page.goto(f"{BASE_URL}?intro_pause=cutting")
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "intro_03_sliding_reveal.png"))

        # 4. App fully revealed
        print("[INTRO] Capturando 04_app_revealed...")
        page.goto(BASE_URL)
        page.evaluate("sessionStorage.setItem('david_intro_seen', 'true')")
        page.goto(BASE_URL)
        page.wait_for_selector('text=Hola, Invitado')
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "intro_04_app_revealed.png"))

        print("[OK] Todas las capturas de intro fueron generadas!")
        browser.close()

if __name__ == '__main__':
    capture_intro()
