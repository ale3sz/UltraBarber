import os
import sys
import json
import time
from playwright.sync_api import sync_playwright

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCREENSHOTS_DIR = os.path.join(ROOT_DIR, "qa_audit_results")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
BASE_URL = "http://localhost:7200"

findings = {
    "console_errors": [],
    "network_errors": [],
    "mateo": {},
    "lucas": {},
    "admin": {},
    "mobile": {}
}

def monitor(page, ctx_name):
    page.on("console", lambda m: findings["console_errors"].append({"context": ctx_name, "text": m.text}) if m.type == 'error' else None)
    page.on("pageerror", lambda e: findings["console_errors"].append({"context": ctx_name, "error": str(e)}))
    page.on("response", lambda r: findings["network_errors"].append({"context": ctx_name, "status": r.status, "url": r.url}) if r.status >= 400 else None)

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=EDGE_PATH, headless=True, args=["--disable-gpu", "--no-sandbox"])

        # -----------------------------------------------------------------
        # 1. MATEO FLOW (DESKTOP)
        # -----------------------------------------------------------------
        print("=== 1. AUDITING MATEO (10 PTS) CLUB & REDEMPTION ===", flush=True)
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()
        monitor(page, "mateo")

        page.goto(BASE_URL)
        page.keyboard.press("Escape")
        page.wait_for_timeout(2300)
        page.evaluate("() => { localStorage.clear(); sessionStorage.setItem('david_intro_seen', 'true'); }")
        page.reload()
        page.wait_for_timeout(600)

        # Login Mateo
        page.locator("#dni-input").fill("38999888")
        page.locator("button:has-text('Validar DNI')").click()
        page.wait_for_timeout(600)
        page.locator("#pin-login-input").fill("1234")
        page.locator("button:has-text('Entrar a mi cuenta')").click()
        page.wait_for_timeout(1000)

        # Notice: App navigated to 'book' automatically!
        auto_redirected_to_book = page.locator("text='¿Qué te servimos hoy?'").is_visible()
        print(f"Did login automatically redirect out of Club to 'book'? {auto_redirected_to_book}", flush=True)
        page.screenshot(path=f"{SCREENSHOTS_DIR}/mateo_01_auto_redirect_to_booking.png")

        # Now click 'Mi Pase' to view Mateo's club dashboard
        page.locator("nav button:has-text('Mi Pase')").first.click()
        page.wait_for_timeout(600)
        page.screenshot(path=f"{SCREENSHOTS_DIR}/mateo_02_club_view.png")

        # Inspect elements in Mateo's membership card
        points_display = page.locator(".odometer, [class*='odometer']").inner_text() if page.locator(".odometer, [class*='odometer']").count() > 0 else "N/A"
        free_banner = page.locator("text='Tenés 1 corte de autor $0 bonificado listo para canjear'").is_visible()
        counter_ratio = page.locator("text=/\\d+\\s*\\/\\s*10/").inner_text() if page.locator("text=/\\d+\\s*\\/\\s*10/").count() > 0 else "N/A"

        print(f"Mateo points display: {points_display}", flush=True)
        print(f"Free cut banner visible: {free_banner}", flush=True)
        print(f"Counter ratio text: '{counter_ratio}'", flush=True)

        findings["mateo"] = {
            "auto_redirected_to_book": auto_redirected_to_book,
            "points": points_display,
            "free_cut_banner": free_banner,
            "counter_ratio": counter_ratio
        }

        # Open QR Credential Modal
        page.locator("button:has-text('Credencial QR')").click()
        page.wait_for_timeout(500)
        page.screenshot(path=f"{SCREENSHOTS_DIR}/mateo_03_qr_modal.png")
        # Note: Modal does NOT support Escape key! Must click 'Listo' or 'X'
        page.locator("button:has-text('Listo')").click()
        page.wait_for_timeout(400)

        # Tab: Beneficios & Canjes
        page.locator("button:has-text('Beneficios & Canjes')").click()
        page.wait_for_timeout(600)
        page.screenshot(path=f"{SCREENSHOTS_DIR}/mateo_04_benefits_tab.png")

        # Test Canje Modal
        canjear_btn = page.locator("button:has-text('Solicitar Canje')").first
        if canjear_btn.is_visible():
            canjear_btn.click()
            page.wait_for_timeout(500)
            page.screenshot(path=f"{SCREENSHOTS_DIR}/mateo_05_redemption_modal.png")
            page.locator("button:has-text('Cancelar')").first.click()
            page.wait_for_timeout(400)

        ctx.close()

        # -----------------------------------------------------------------
        # 2. LUCAS FLOW (DESKTOP)
        # -----------------------------------------------------------------
        print("=== 2. AUDITING LUCAS (8 PTS) ===", flush=True)
        ctx_l = browser.new_context(viewport={"width": 1440, "height": 900})
        page_l = ctx_l.new_page()
        monitor(page_l, "lucas")

        page_l.goto(BASE_URL)
        page_l.keyboard.press("Escape")
        page_l.wait_for_timeout(2300)
        page_l.evaluate("() => { localStorage.clear(); sessionStorage.setItem('david_intro_seen', 'true'); }")
        page_l.reload()
        page_l.wait_for_timeout(600)

        page_l.locator("#dni-input").fill("40123456")
        page_l.locator("button:has-text('Validar DNI')").click()
        page_l.wait_for_timeout(600)
        page_l.locator("#pin-login-input").fill("1234")
        page_l.locator("button:has-text('Entrar a mi cuenta')").click()
        page_l.wait_for_timeout(1000)

        page_l.locator("nav button:has-text('Mi Pase')").first.click()
        page_l.wait_for_timeout(600)
        page_l.screenshot(path=f"{SCREENSHOTS_DIR}/lucas_01_club_view.png")

        lucas_pts = page_l.locator(".odometer, [class*='odometer']").inner_text() if page_l.locator(".odometer, [class*='odometer']").count() > 0 else "N/A"
        lucas_ratio = page_l.locator("text=/\\d+\\s*\\/\\s*10/").inner_text() if page_l.locator("text=/\\d+\\s*\\/\\s*10/").count() > 0 else "N/A"
        lucas_remaining = page_l.locator("text=/FALTAN \\d+ PARA CORTE BONIFICADO/").inner_text() if page_l.locator("text=/FALTAN \\d+ PARA CORTE BONIFICADO/").count() > 0 else "N/A"

        print(f"Lucas points: {lucas_pts}, ratio: {lucas_ratio}, remaining text: {lucas_remaining}", flush=True)
        findings["lucas"] = {
            "points": lucas_pts,
            "ratio": lucas_ratio,
            "remaining": lucas_remaining
        }
        ctx_l.close()

        # -----------------------------------------------------------------
        # 3. ADMIN DASHBOARD & FEATURES
        # -----------------------------------------------------------------
        print("=== 3. AUDITING ADMIN PANEL ===", flush=True)
        ctx_a = browser.new_context(viewport={"width": 1440, "height": 900})
        page_a = ctx_a.new_page()
        monitor(page_a, "admin")

        page_a.goto(BASE_URL)
        page_a.keyboard.press("Escape")
        page_a.wait_for_timeout(2300)
        page_a.evaluate("() => { localStorage.clear(); sessionStorage.setItem('david_intro_seen', 'true'); }")
        page_a.reload()
        page_a.wait_for_timeout(600)

        # Login via admin DNI in DniStep
        page_a.locator("#dni-input").fill("11111111")
        page_a.locator("button:has-text('Validar DNI')").click()
        page_a.wait_for_timeout(600)
        page_a.locator("#admin-password-input").fill("barber2026")
        page_a.locator("button:has-text('Ingresar al Panel David')").click()
        page_a.wait_for_timeout(2000)
        page_a.screenshot(path=f"{SCREENSHOTS_DIR}/admin_01_dashboard.png")

        # Collect metrics text
        metrics = page_a.locator("text=/\\$\\d+|Turnos|Sillón/").all_inner_texts()
        print(f"Admin Dashboard Metrics sampled: {metrics[:8]}", flush=True)

        # Check tabs: Solicitudes, Agenda, Socios, Caja
        page_a.locator("button:has-text('Agenda & Sillón')").first.click()
        page_a.wait_for_timeout(600)
        page_a.screenshot(path=f"{SCREENSHOTS_DIR}/admin_02_agenda_bloqueos.png")

        # Check block slot button / inputs
        block_slot_btn = page_a.locator("button:has-text('Bloquear Horario'), button:has-text('Bloquear')").first
        print(f"Block slot button visible: {block_slot_btn.is_visible()}", flush=True)

        # Tab: Socios VIP
        page_a.locator("button:has-text('Radar & Socios VIP')").first.click()
        page_a.wait_for_timeout(600)
        page_a.screenshot(path=f"{SCREENSHOTS_DIR}/admin_03_socios_directory.png")

        findings["admin"] = {
            "metrics": metrics[:8],
            "block_slot_visible": block_slot_btn.is_visible()
        }
        ctx_a.close()

        # -----------------------------------------------------------------
        # 4. MOBILE LAYOUT & TAP TARGETS (390x844)
        # -----------------------------------------------------------------
        print("=== 4. AUDITING MOBILE LAYOUT & USABILITY ===", flush=True)
        ctx_m = browser.new_context(
            viewport={"width": 390, "height": 844},
            is_mobile=True,
            has_touch=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15"
        )
        page_m = ctx_m.new_page()
        monitor(page_m, "mobile")

        page_m.goto(BASE_URL)
        page_m.touchscreen.tap(195, 422)
        page_m.wait_for_timeout(2300)
        page_m.screenshot(path=f"{SCREENSHOTS_DIR}/mobile_01_home_screen.png")

        # Mobile horizontal scroll check
        overflow_res = page_m.evaluate("""() => {
            const docW = document.documentElement.scrollWidth;
            const winW = window.innerWidth;
            const bodyW = document.body.scrollWidth;
            return { docW, winW, bodyW, hasOverflow: docW > winW || bodyW > winW };
        }""")
        print(f"Mobile Overflow: {overflow_res}", flush=True)

        # Mobile Floating Help Button & Bottom Dock geometry
        geom = page_m.evaluate("""() => {
            const help = document.querySelector('button[aria-label*=\"ayuda\" i], button[aria-label*=\"whatsapp\" i], [title*=\"Consultas\"]');
            const dock = document.querySelector('nav[aria-label*=\"principal móvil\"]');
            const helpRect = help ? help.getBoundingClientRect() : null;
            const dockRect = dock ? dock.getBoundingClientRect() : null;
            return {
                helpRect,
                dockRect,
                gapBetweenHelpAndDock: (helpRect && dockRect) ? Math.round(dockRect.top - helpRect.bottom) : null
            };
        }""")
        print(f"Mobile Geometry: {geom}", flush=True)

        findings["mobile"] = {
            "overflow": overflow_res,
            "geometry": geom
        }

        ctx_m.close()
        browser.close()

    out_path = os.path.join(SCREENSHOTS_DIR, "final_audit_validation.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(findings, f, indent=2, ensure_ascii=False)
    print(f"\n[DONE] Validation finished! Written to {out_path}", flush=True)

if __name__ == "__main__":
    run()
