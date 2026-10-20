import os
import sys
import json
import time
import urllib.request
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

report = {
    "console_errors": [],
    "console_warnings": [],
    "network_failures": [],
    "horizontal_overflows": [],
    "ux_friction_points": [],
    "flows": {},
    "touch_targets_audit": [],
    "overlap_audit": []
}

def log(msg):
    print(f"[QA AUDIT] {msg}", flush=True)

def attach_page_listeners(page, label):
    def on_console(msg):
        if msg.type == 'error':
            report["console_errors"].append({
                "context": label,
                "text": msg.text,
                "location": msg.location
            })
            log(f"CONSOLE ERROR [{label}]: {msg.text}")
        elif msg.type == 'warning':
            if "React DevTools" not in msg.text:
                report["console_warnings"].append({
                    "context": label,
                    "text": msg.text
                })

    def on_pageerror(exc):
        report["console_errors"].append({
            "context": label,
            "error": str(exc)
        })
        log(f"PAGE EXCEPTION [{label}]: {exc}")

    def on_response(res):
        if res.status >= 400:
            report["network_failures"].append({
                "context": label,
                "url": res.url,
                "status": res.status,
                "method": res.request.method
            })
            log(f"HTTP ERROR [{label}]: {res.status} {res.request.method} {res.url}")

    page.on("console", on_console)
    page.on("pageerror", on_pageerror)
    page.on("response", on_response)

def check_overflow(page, screen_name):
    try:
        data = page.evaluate("""() => {
            const docW = document.documentElement.scrollWidth;
            const winW = window.innerWidth;
            const bodyW = document.body.scrollWidth;
            const hasOverflow = docW > winW || bodyW > winW;
            const culprits = [];
            if (hasOverflow) {
                document.querySelectorAll('*').forEach(el => {
                    const r = el.getBoundingClientRect();
                    if (r.right > winW + 1) {
                        culprits.push({
                            tag: el.tagName,
                            className: (el.className || '').toString().slice(0, 80),
                            id: el.id || '',
                            right: Math.round(r.right),
                            winW: winW
                        });
                    }
                });
            }
            return { hasOverflow, docW, winW, bodyW, culprits: culprits.slice(0, 5) };
        }""")
        if data["hasOverflow"]:
            report["horizontal_overflows"].append({
                "screen": screen_name,
                "data": data
            })
            log(f"⚠️ OVERFLOW DETECTED [{screen_name}]: docW={data['docW']} > winW={data['winW']}")
        return data
    except Exception as e:
        log(f"Error checking overflow in {screen_name}: {e}")
        return {"hasOverflow": False}

def run_all_audits():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=EDGE_PATH,
            headless=True,
            args=["--disable-gpu", "--no-sandbox"]
        )

        # =========================================================================
        # SUITE 1: DESKTOP AUDIT (1440x900)
        # =========================================================================
        log("=== SUITE 1: DESKTOP VIEWPORT AUDIT (1440x900) ===")
        ctx_desk = browser.new_context(viewport={"width": 1440, "height": 900})
        page_desk = ctx_desk.new_page()
        attach_page_listeners(page_desk, "desktop")

        # 1.1 Intro Curtain Test
        log("1.1 Testing Intro Curtain and Dismissal...")
        page_desk.goto(BASE_URL, wait_until="domcontentloaded")
        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/01_desk_intro_mounted.png")

        intro_elem = page_desk.locator("[aria-label='Saltar intro']").first
        is_intro_visible = intro_elem.is_visible()
        log(f"Intro visible on initial load: {is_intro_visible}")

        # Test click dismiss
        intro_elem.click()
        page_desk.wait_for_timeout(300)
        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/02_desk_intro_clicked.png")
        page_desk.wait_for_timeout(2200) # wait until unmounted
        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/03_desk_home_ready.png")
        check_overflow(page_desk, "desktop_home_ready")

        # Repeat visit check
        log("1.2 Testing sessionStorage repeat visit...")
        page_desk.reload(wait_until="domcontentloaded")
        intro_flashed = page_desk.locator("[aria-label='Saltar intro']").count() > 0
        log(f"Intro present on reload (sessionStorage set): {intro_flashed}")
        page_desk.wait_for_timeout(400)
        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/04_desk_reload_no_intro.png")
        report["flows"]["intro"] = {
            "initial_mounted": is_intro_visible,
            "flashed_on_reload": intro_flashed
        }

        # 1.3 Booking Flow as Guest (Checking barrier & registration)
        log("1.3 Testing Booking as Guest (Barrier -> Registration -> Steps)...")
        page_desk.locator("nav button:has-text('Reservar')").first.click()
        page_desk.wait_for_timeout(600)
        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/05_desk_booking_barrier.png")

        report["ux_friction_points"].append({
            "flow": "Reserva Invitado",
            "type": "Bloqueo Prematuro de Autenticación",
            "screen": "SubTab 'Reservar' con usuario no autenticado",
            "description": "El usuario no puede ver la carta de servicios, precios ni horarios disponibles hasta identificarse con DNI/PIN o registrarse. Esto produce alta fricción inicial y abandono en usuarios que sólo quieren ver disponibilidad antes de dar sus datos personales."
        })

        # Register new guest via 'Primera vez'
        page_desk.locator("button:has-text('Primera vez')").first.click()
        page_desk.wait_for_timeout(400)

        test_guest_dni = f"39{int(time.time()) % 1000000:06d}"
        page_desk.locator("#dni-reg-input").fill(test_guest_dni)
        page_desk.locator("input[placeholder='Agustín']").first.fill("Rodrigo")
        page_desk.locator("input[placeholder='Gómez']").first.fill("Álvarez")
        page_desk.locator("input[placeholder*='555-1234']").first.fill("3416778899")
        page_desk.locator("input[placeholder='Ej: 2580']").first.fill("1234")
        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/06_desk_guest_form_filled.png")

        page_desk.locator("button:has-text('ACTIVAR MEMBRESÍA Y RESERVAR')").first.click()
        page_desk.wait_for_timeout(1500)
        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/07_desk_step1_services.png")
        check_overflow(page_desk, "desktop_step1_services")

        # 1.4 Step 1: Select Service & Drink
        log("1.4 Testing Step 1 (Services Bento Grid & Drink selection)...")
        corte_bebida_card = page_desk.locator("text='Corte + Bebida'").first
        corte_bebida_card.click()
        page_desk.wait_for_timeout(400)

        cerveza_btn = page_desk.locator("button:has-text('Cerveza')").first
        if cerveza_btn.is_visible():
            cerveza_btn.click()
            page_desk.wait_for_timeout(300)
        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/08_desk_step1_drink_selected.png")

        # Continue to Step 2
        page_desk.locator("button:has-text('Elegir Día y Horario')").first.click()
        page_desk.wait_for_timeout(800)
        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/09_desk_step2_agenda.png")
        check_overflow(page_desk, "desktop_step2_agenda")

        # 1.5 Step 2: Select Date & Time
        log("1.5 Testing Step 2 (Date & Time selection)...")
        slots = page_desk.locator("button:has-text(':')")
        slot_picked = False
        for i in range(slots.count()):
            btn = slots.nth(i)
            if not btn.is_disabled() and "line-through" not in (btn.get_attribute("class") or ""):
                btn.click()
                slot_picked = True
                page_desk.wait_for_timeout(400)
                break

        if not slot_picked:
            day_chips = page_desk.locator("button:has-text('Hoy'), button:has-text('Mañana'), button:has-text('Lun'), button:has-text('Mar'), button:has-text('Mié'), button:has-text('Jue'), button:has-text('Vie'), button:has-text('Sáb')")
            if day_chips.count() > 1:
                day_chips.nth(1).click()
                page_desk.wait_for_timeout(600)
                slots = page_desk.locator("button:has-text(':')")
                for i in range(slots.count()):
                    btn = slots.nth(i)
                    if not btn.is_disabled():
                        btn.click()
                        slot_picked = True
                        page_desk.wait_for_timeout(400)
                        break

        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/10_desk_step2_slot_chosen.png")

        # Submit Appointment: Solicitar Turno
        log("1.6 Submitting appointment to reach Step 3 (Hold / WhatsApp)...")
        page_desk.locator("button:has-text('Solicitar Turno')").first.click()
        page_desk.wait_for_timeout(2000)
        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/11_desk_step3_hold_whatsapp.png")
        check_overflow(page_desk, "desktop_hold_screen")

        timer_text = page_desk.locator("text=/\\d{2}:\\d{2}/").first.inner_text() if page_desk.locator("text=/\\d{2}:\\d{2}/").count() > 0 else "N/A"
        booking_code = page_desk.locator("span:has-text('#')").first.inner_text() if page_desk.locator("span:has-text('#')").count() > 0 else "N/A"
        wa_btn = page_desk.locator("button:has-text('Enviar confirmación por WhatsApp')").first
        copy_btn = page_desk.locator("button:has-text('Copiar texto del mensaje')").first

        log(f"Hold Timer: {timer_text}, Booking Code: {booking_code}")

        report["flows"]["guest_booking_full"] = {
            "dni": test_guest_dni,
            "timer": timer_text,
            "code": booking_code,
            "wa_button_visible": wa_btn.is_visible(),
            "copy_button_visible": copy_btn.is_visible()
        }

        # 1.6 Verify Mis Turnos tab
        log("1.7 Checking Mis Turnos tab for the created appointment...")
        page_desk.locator("button:has-text('Ver Mis Turnos')").first.click()
        page_desk.wait_for_timeout(800)
        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/12_desk_mis_turnos_created.png")
        check_overflow(page_desk, "desktop_mis_turnos")

        cancel_btn = page_desk.locator("button:has-text('Cancelar')").first
        log(f"Cancel button visible in Mis Turnos: {cancel_btn.is_visible()}")

        # 1.7 Member Club Audit: Mateo (38999888, 10 PTS) & Lucas (40123456, 8 PTS)
        log("1.8 Testing Member Experience with Mateo (38999888, PIN: 1234)...")
        # Logout using the navbar icon button
        logout_btn = page_desk.locator("[aria-label='Cerrar sesión de cliente']").first
        if logout_btn.is_visible():
            logout_btn.click()
            page_desk.wait_for_timeout(600)

        # Go to CLUB / Mi Pase
        page_desk.locator("nav button:has-text('Mi Pase')").first.click()
        page_desk.wait_for_timeout(600)

        # Click Mateo demo fill
        page_desk.locator("button:has-text('Mateo')").first.click()
        page_desk.wait_for_timeout(400)
        page_desk.locator("button:has-text('Entrar a mi cuenta')").first.click()
        page_desk.wait_for_timeout(1000)

        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/13_desk_mateo_club.png")
        check_overflow(page_desk, "desktop_mateo_club")

        # QR Credential Modal
        qr_btn = page_desk.locator("button:has-text('Mi Credencial QR'), button:has-text('Credencial')").first
        if qr_btn.is_visible():
            qr_btn.click()
            page_desk.wait_for_timeout(600)
            page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/14_desk_mateo_qr_modal.png")
            page_desk.keyboard.press("Escape")
            page_desk.wait_for_timeout(400)

        # Benefits & Redemptions
        benefits_tab = page_desk.locator("button:has-text('Beneficios & Canjes')").first
        if benefits_tab.is_visible():
            benefits_tab.click()
            page_desk.wait_for_timeout(600)
            page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/15_desk_mateo_benefits.png")

        # 1.8 Admin Panel Login (DNI: 11111111 / david, PIN: barber2026)
        log("1.9 Auditing Admin Panel Login and Management...")
        admin_trigger = page_desk.locator("button:has-text('Panel de David')").first
        if admin_trigger.is_visible():
            admin_trigger.click()
            page_desk.wait_for_timeout(800)

        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/16_desk_admin_login.png")

        # Fill credentials
        page_desk.locator("input[placeholder*='DNI'], input[placeholder*='Usuario']").first.fill("11111111")
        page_desk.locator("input[type='password']").first.fill("barber2026")
        page_desk.locator("button:has-text('Ingresar al Panel David'), button:has-text('Iniciar Sesión')").first.click()
        page_desk.wait_for_timeout(1500)

        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/17_desk_admin_dashboard.png")
        check_overflow(page_desk, "desktop_admin_dashboard")

        # Admin tabs: Turnos Solicitados, Agenda & Bloqueos, etc.
        agenda_tab = page_desk.locator("button:has-text('Agenda & Bloqueos')").first
        if agenda_tab.is_visible():
            agenda_tab.click()
            page_desk.wait_for_timeout(600)
            page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/18_desk_admin_agenda.png")

        # Return to client view
        page_desk.locator("button:has-text('Volver a la Web')").first.click()
        page_desk.wait_for_timeout(600)

        ctx_desk.close()

        # =========================================================================
        # SUITE 2: MOBILE VIEWPORT AUDIT (390x844 - iPhone)
        # =========================================================================
        log("=== SUITE 2: MOBILE VIEWPORT AUDIT (390x844) ===")
        ctx_mob = browser.new_context(
            viewport={"width": 390, "height": 844},
            is_mobile=True,
            has_touch=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
        )
        page_mob = ctx_mob.new_page()
        attach_page_listeners(page_mob, "mobile")

        # 2.1 Mobile Intro & Tap Dismissal
        log("2.1 Testing Mobile Intro & Tap gesture...")
        page_mob.goto(BASE_URL, wait_until="domcontentloaded")
        page_mob.screenshot(path=f"{SCREENSHOTS_DIR}/19_mob_intro.png")

        page_mob.touchscreen.tap(195, 422)
        page_mob.wait_for_timeout(400)
        page_mob.screenshot(path=f"{SCREENSHOTS_DIR}/20_mob_intro_dismissed.png")
        page_mob.wait_for_timeout(2200)

        page_mob.screenshot(path=f"{SCREENSHOTS_DIR}/21_mob_home.png")
        check_overflow(page_mob, "mobile_home")

        # 2.2 Mobile Floating Buttons & Overlap Audit
        log("2.2 Auditing Floating Help Button & Bottom Dock Overlap...")
        overlap_info = page_mob.evaluate("""() => {
            const help = document.querySelector('button[aria-label*=\"ayuda\" i], button[aria-label*=\"whatsapp\" i]');
            const dock = document.querySelector('nav[aria-label*=\"principal móvil\"]');
            const banner = document.querySelector('.pwa-banner');

            const res = {};
            if (help) {
                const r = help.getBoundingClientRect();
                res.help = { bottom: r.bottom, top: r.top, right: r.right, left: r.left, height: r.height };
            }
            if (dock) {
                const r = dock.getBoundingClientRect();
                res.dock = { top: r.top, bottom: r.bottom, height: r.height };
            }
            if (banner) {
                const r = banner.getBoundingClientRect();
                res.banner = { top: r.top, bottom: r.bottom };
            }

            let isHelpOverlappingDock = false;
            if (res.help && res.dock) {
                if (res.help.bottom >= res.dock.top) {
                    isHelpOverlappingDock = true;
                }
            }
            res.isHelpOverlappingDock = isHelpOverlappingDock;
            return res;
        }""")
        log(f"Overlap Audit: {overlap_info}")
        report["overlap_audit"].append(overlap_info)

        # 2.3 Mobile Lucas Login (40123456, PIN 1234)
        log("2.3 Testing Lucas Login on Mobile...")
        # Mi Pase
        page_mob.locator("nav button:has-text('Mi Pase')").first.click()
        page_mob.wait_for_timeout(500)

        # Lucas demo fill
        lucas_demo = page_mob.locator("button:has-text('Lucas')").first
        if lucas_demo.is_visible():
            lucas_demo.click()
            page_mob.wait_for_timeout(400)
            page_mob.locator("button:has-text('Entrar a mi cuenta')").first.click()
            page_mob.wait_for_timeout(1000)

        page_mob.screenshot(path=f"{SCREENSHOTS_DIR}/22_mob_lucas_club.png")
        check_overflow(page_mob, "mobile_lucas_club")

        # Mobile QR Credential Modal
        log("2.4 Testing QR Credential Modal on Mobile...")
        mob_qr_btn = page_mob.locator("button:has-text('Mi Credencial QR'), button:has-text('Credencial')").first
        if mob_qr_btn.is_visible():
            mob_qr_btn.click()
            page_mob.wait_for_timeout(600)
            page_mob.screenshot(path=f"{SCREENSHOTS_DIR}/23_mob_qr_modal.png")
            check_overflow(page_mob, "mobile_qr_modal")
            page_mob.keyboard.press("Escape")
            page_mob.wait_for_timeout(400)

        # 2.4 Mobile Booking Flow (Step 1 -> Step 2)
        log("2.5 Testing Mobile Booking Flow...")
        page_mob.locator("nav button:has-text('Reservar')").first.click()
        page_mob.wait_for_timeout(600)
        page_mob.screenshot(path=f"{SCREENSHOTS_DIR}/24_mob_step1_services.png")
        check_overflow(page_mob, "mobile_step1_services")

        # Select Service on mobile
        svc_first = page_mob.locator("[role='button']:has-text('Fade')").first
        if svc_first.is_visible():
            svc_first.click()
            page_mob.wait_for_timeout(400)

        page_mob.locator("button:has-text('Elegir Día y Horario')").first.click()
        page_mob.wait_for_timeout(800)
        page_mob.screenshot(path=f"{SCREENSHOTS_DIR}/25_mob_step2_agenda.png")
        check_overflow(page_mob, "mobile_step2_agenda")

        # 2.5 Touch Target Size Audit on Mobile
        log("2.6 Auditing Touch Targets Size on Mobile (< 42px)...")
        targets_audit = page_mob.evaluate("""() => {
            const smallOnes = [];
            document.querySelectorAll('button, a, input, select').forEach(el => {
                const r = el.getBoundingClientRect();
                if (r.width > 0 && r.height > 0 && (r.width < 42 || r.height < 42)) {
                    smallOnes.push({
                        text: (el.innerText || el.getAttribute('aria-label') || el.name || el.placeholder || '').slice(0, 35),
                        width: Math.round(r.width),
                        height: Math.round(r.height),
                        tag: el.tagName
                    });
                }
            });
            return smallOnes.slice(0, 15);
        }""")
        log(f"Touch targets < 42px found: {len(targets_audit)}")
        report["touch_targets_audit"] = targets_audit

        # Mobile Mis Turnos
        log("2.7 Testing Mobile 'Mis Turnos' tab...")
        page_mob.locator("nav button:has-text('Turnos')").first.click()
        page_mob.wait_for_timeout(600)
        page_mob.screenshot(path=f"{SCREENSHOTS_DIR}/26_mob_mis_turnos.png")
        check_overflow(page_mob, "mobile_mis_turnos")

        ctx_mob.close()
        browser.close()

    # Save summary json
    summary_path = os.path.join(SCREENSHOTS_DIR, "detailed_audit_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    log(f"=== AUDIT COMPLETE! Data saved to {summary_path} ===")

if __name__ == "__main__":
    run_all_audits()
