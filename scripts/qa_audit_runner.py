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

results = {
    "console_errors": [],
    "console_warnings": [],
    "network_failures": [],
    "horizontal_overflows": [],
    "ux_friction_points": [],
    "verified_flows": {}
}

def log_audit(msg):
    print(f"[AUDIT] {msg}", flush=True)

def attach_monitoring(page, label):
    def on_console(msg):
        if msg.type == 'error':
            results["console_errors"].append({
                "context": label,
                "text": msg.text,
                "location": msg.location
            })
            log_audit(f"CONSOLE ERROR [{label}]: {msg.text}")
        elif msg.type == 'warning':
            if "React DevTools" not in msg.text:
                results["console_warnings"].append({
                    "context": label,
                    "text": msg.text
                })

    def on_pageerror(exc):
        results["console_errors"].append({
            "context": label,
            "error": str(exc)
        })
        log_audit(f"PAGE EXCEPTION [{label}]: {exc}")

    def on_response(res):
        if res.status >= 400:
            results["network_failures"].append({
                "context": label,
                "url": res.url,
                "status": res.status,
                "method": res.request.method
            })
            log_audit(f"HTTP ERROR [{label}]: {res.status} {res.request.method} {res.url}")

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
            results["horizontal_overflows"].append({
                "screen": screen_name,
                "data": data
            })
            log_audit(f"⚠️ OVERFLOW in {screen_name}: docW={data['docW']} > winW={data['winW']}, items={len(data['culprits'])}")
        return data
    except Exception as e:
        log_audit(f"Error checking overflow in {screen_name}: {e}")
        return {"hasOverflow": False}

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=EDGE_PATH,
            headless=True,
            args=["--disable-gpu", "--no-sandbox"]
        )

        # =========================================================================
        # 1. DESKTOP AUDIT (1440x900)
        # =========================================================================
        log_audit("=== 1. DESKTOP VIEWPORT AUDIT (1440x900) ===")
        ctx_desk = browser.new_context(viewport={"width": 1440, "height": 900})
        page_desk = ctx_desk.new_page()
        attach_monitoring(page_desk, "desktop")

        # 1.1 Intro Curtain Test
        log_audit("Testing Intro Curtain on Desktop...")
        t0 = time.time()
        page_desk.goto(BASE_URL, wait_until="domcontentloaded")
        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/01_desk_intro_mounted.png")

        # Check skip behavior
        intro_btn = page_desk.locator("[aria-label='Saltar intro']").first
        intro_visible = intro_btn.is_visible()
        log_audit(f"Intro visible on initial load: {intro_visible}")

        # Press Escape to skip
        page_desk.keyboard.press("Escape")
        time.sleep(0.3)
        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/02_desk_intro_after_skip.png")
        page_desk.wait_for_timeout(2300) # Ensure unmounted
        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/03_desk_home_clean.png")
        check_overflow(page_desk, "desktop_home_clean")

        # 1.2 Repeat visit / sessionStorage test
        log_audit("Testing Repeat Visit (sessionStorage persistence)...")
        page_desk.reload(wait_until="domcontentloaded")
        # Check if intro flashes
        has_intro_flash = page_desk.locator("[aria-label='Saltar intro']").count() > 0
        log_audit(f"Did intro element render on repeat visit with sessionStorage? {has_intro_flash}")
        page_desk.wait_for_timeout(400)
        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/04_desk_repeat_visit.png")
        results["verified_flows"]["intro_session_storage"] = {
            "initial_visible": intro_visible,
            "flash_on_repeat": has_intro_flash
        }

        # 1.3 Guest Booking Barrier Inspection
        log_audit("Auditing Guest Booking Flow & Barrier...")
        nav_book = page_desk.locator("nav button:has-text('RESERVAR')").first
        nav_book.click()
        page_desk.wait_for_timeout(600)
        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/05_desk_booking_unauthenticated_barrier.png")

        dni_step_visible = page_desk.locator("text='Acceso de socio'").is_visible()
        services_visible = page_desk.locator("text='¿Qué te servimos hoy?'").is_visible()
        log_audit(f"When guest navigates to booking: DniStep shown? {dni_step_visible}, Services shown? {services_visible}")

        results["ux_friction_points"].append({
            "flow": "Reserva como Invitado",
            "friction": "Bloqueo por barrera de autenticación previa",
            "detail": "El usuario invitado no puede ver el catálogo interactivo de servicios ni elegir fecha/hora hasta ingresar su DNI y PIN o registrarse primero. Esto invierte la convención estándar de e-commerce y reservas (Seleccionar Servicio -> Horario -> Identificación -> Confirmación)."
        })

        # 1.4 Test Guest Registration ("Primera vez")
        log_audit("Testing Guest Registration via 'Primera vez' tab...")
        first_time_tab = page_desk.locator("button:has-text('Primera vez')").first
        if first_time_tab.is_visible():
            first_time_tab.click()
            page_desk.wait_for_timeout(400)
            page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/06_desk_guest_register_tab.png")

            # Fill registration form
            guest_dni = f"48{int(time.time()) % 1000000:06d}"
            page_desk.locator("#dni-reg-input").fill(guest_dni)
            page_desk.locator("input[placeholder='Agustín']").first.fill("Valentín")
            page_desk.locator("input[placeholder='Gómez']").first.fill("Rossi")
            page_desk.locator("input[placeholder*='555-1234']").first.fill("3416554433")
            page_desk.locator("input[placeholder='Ej: 2580']").first.fill("1234")

            page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/07_desk_guest_register_filled.png")
            page_desk.locator("button:has-text('Crear cuenta y activar pase')").first.click()
            page_desk.wait_for_timeout(1500)

        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/08_desk_after_registration_logged_in.png")

        # 1.5 Now in Booking Flow: Step 1 Services
        log_audit("Auditing Step 1 (Services Bento Grid)...")
        # Ensure we are on Step 1
        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/09_desk_step1_services_bento.png")
        check_overflow(page_desk, "desktop_step1_services")

        # Inspect services rendered
        service_cards = page_desk.locator("[role='button']:has-text('Fade'), [role='button']:has-text('Corte')")
        log_audit(f"Service cards count: {service_cards.count()}")

        # Select 'Corte + Bebida'
        corte_bebida = page_desk.locator("text='Corte + Bebida'").first
        if corte_bebida.is_visible():
            corte_bebida.click()
            page_desk.wait_for_timeout(400)
            log_audit("Selected 'Corte + Bebida'")

        # Check Drink options
        drink_bar = page_desk.locator("text='Elegí tu bebida de cortesía:'")
        log_audit(f"Drink selector bar visible: {drink_bar.is_visible()}")
        if drink_bar.is_visible():
            cerveza_btn = page_desk.locator("button:has-text('Cerveza')").first
            cerveza_btn.click()
            page_desk.wait_for_timeout(200)

        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/10_desk_step1_service_drink_selected.png")

        # Click Continue to Step 2
        page_desk.locator("button:has-text('Elegir Día y Horario')").first.click()
        page_desk.wait_for_timeout(800)

        # 1.6 Step 2 (DateTime Agenda)
        log_audit("Auditing Step 2 (Date & Time Slots)...")
        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/11_desk_step2_agenda.png")
        check_overflow(page_desk, "desktop_step2_agenda")

        # Check day buttons
        day_buttons = page_desk.locator("button:has-text('Hoy'), button:has-text('Mañana'), button:has-text('Lun'), button:has-text('Mar'), button:has-text('Mié'), button:has-text('Jue'), button:has-text('Vie'), button:has-text('Sáb')")
        log_audit(f"Available day chips count: {day_buttons.count()}")

        # Check morning / afternoon slots
        slots = page_desk.locator("button:has-text(':')")
        log_audit(f"Total time slots visible: {slots.count()}")

        # Select first enabled slot
        selected_slot_text = None
        for i in range(slots.count()):
            s = slots.nth(i)
            if not s.is_disabled() and "line-through" not in (s.get_attribute("class") or ""):
                selected_slot_text = s.inner_text().strip().split("\n")[0]
                s.click()
                page_desk.wait_for_timeout(400)
                log_audit(f"Selected slot: {selected_slot_text}")
                break

        if not selected_slot_text and day_buttons.count() > 1:
            # Click tomorrow
            log_audit("Today has no free slots, picking tomorrow...")
            day_buttons.nth(1).click()
            page_desk.wait_for_timeout(600)
            slots = page_desk.locator("button:has-text(':')")
            for i in range(slots.count()):
                s = slots.nth(i)
                if not s.is_disabled():
                    selected_slot_text = s.inner_text().strip().split("\n")[0]
                    s.click()
                    page_desk.wait_for_timeout(400)
                    log_audit(f"Selected tomorrow slot: {selected_slot_text}")
                    break

        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/12_desk_step2_slot_picked.png")

        # Submit Appointment: Click "Solicitar Turno"
        log_audit("Submitting reservation request...")
        submit_btn = page_desk.locator("button:has-text('Solicitar Turno')").first
        submit_btn.click()
        page_desk.wait_for_timeout(2000)

        # 1.7 Step 3/4: HoldWaitingStep & WhatsApp Handshake
        log_audit("Auditing Step 3/4 (Hold Waiting & WhatsApp)...")
        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/13_desk_hold_waiting_screen.png")
        check_overflow(page_desk, "desktop_hold_screen")

        # Inspect elements
        timer_text = page_desk.locator("text=/\\d{2}:\\d{2}/").first.inner_text() if page_desk.locator("text=/\\d{2}:\\d{2}/").count() > 0 else "MISSING"
        code_elem = page_desk.locator("span:has-text('#')").first
        booking_code = code_elem.inner_text() if code_elem.is_visible() else "MISSING"
        wa_btn = page_desk.locator("button:has-text('Enviar confirmación por WhatsApp')").first
        copy_btn = page_desk.locator("button:has-text('Copiar texto')").first
        prebuilt_msg = page_desk.locator("p:has-text('Hola David')").first.inner_text() if page_desk.locator("p:has-text('Hola David')").count() > 0 else "MISSING"

        log_audit(f"Hold Timer: {timer_text}")
        log_audit(f"Booking Code: {booking_code}")
        log_audit(f"Prebuilt message: {prebuilt_msg[:80]}...")

        results["verified_flows"]["appointment_hold"] = {
            "timer": timer_text,
            "code": booking_code,
            "has_whatsapp_action": wa_btn.is_visible(),
            "has_copy_action": copy_btn.is_visible(),
            "prebuilt_message": prebuilt_msg
        }

        # Verify DB directly via API
        log_audit("Verifying appointment presence in backend API...")
        try:
            req = urllib.request.urlopen("http://localhost:7201/api/appointments/busy-slots?date=" + time.strftime("%Y-%m-%d"))
            busy_data = json.loads(req.read().decode())
            log_audit(f"Backend busy slots confirmed: {len(busy_data.get('busySlots', []))} slots blocked.")
        except Exception as e:
            log_audit(f"Backend check error: {e}")

        # 1.8 Mis Turnos View
        log_audit("Auditing 'Mis Turnos' tab...")
        page_desk.locator("button:has-text('Ver Mis Turnos')").first.click()
        page_desk.wait_for_timeout(800)
        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/14_desk_mis_turnos.png")
        check_overflow(page_desk, "desktop_mis_turnos")

        # Check turn status and cancel button
        cancel_btn = page_desk.locator("button:has-text('Cancelar')").first
        log_audit(f"Cancel button visible in Mis Turnos: {cancel_btn.is_visible()}")

        # 1.9 Member Club Experience: Mateo (10 PTS) & Lucas (8 PTS)
        log_audit("Auditing Member Experience with Mateo (38999888, PIN: 1234)...")
        # Log out current user
        page_desk.locator("button:has-text('Cambiar'), button:has-text('Cerrar sesión')").first.click()
        page_desk.wait_for_timeout(600)

        # Go to CLUB
        page_desk.locator("nav button:has-text('CLUB')").first.click()
        page_desk.wait_for_timeout(600)

        # Quick fill Mateo demo
        mateo_demo_btn = page_desk.locator("button:has-text('Mateo')").first
        if mateo_demo_btn.is_visible():
            mateo_demo_btn.click()
            page_desk.wait_for_timeout(400)
            page_desk.locator("button:has-text('Entrar a mi cuenta')").first.click()
            page_desk.wait_for_timeout(1000)

        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/15_desk_mateo_club_overview.png")
        check_overflow(page_desk, "desktop_mateo_club")

        # Check progress bar & 10 points
        mateo_pts_text = page_desk.locator("text='10 PTS'").count()
        log_audit(f"Mateo 10 PTS badge count: {mateo_pts_text}")

        # QR Credential Modal
        qr_btn = page_desk.locator("button:has-text('Mi Credencial QR'), button:has-text('Credencial')").first
        if qr_btn.is_visible():
            qr_btn.click()
            page_desk.wait_for_timeout(600)
            page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/16_desk_mateo_qr_credential_modal.png")
            page_desk.keyboard.press("Escape")
            page_desk.wait_for_timeout(400)

        # Benefits & Redemptions
        benefits_tab = page_desk.locator("button:has-text('Beneficios & Canjes')").first
        if benefits_tab.is_visible():
            benefits_tab.click()
            page_desk.wait_for_timeout(600)
            page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/17_desk_mateo_benefits_redemptions.png")

        # 1.10 Admin Panel Auditing
        log_audit("Auditing Admin Panel (DNI: 11111111, Clave: barber2026)...")
        page_desk.locator("button:has-text('Panel de David')").first.click()
        page_desk.wait_for_timeout(800)
        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/18_desk_admin_login.png")

        # Login admin
        admin_dni_inp = page_desk.locator("input[placeholder*='DNI'], input[placeholder*='Usuario']").first
        admin_pw_inp = page_desk.locator("input[type='password']").first
        admin_dni_inp.fill("11111111")
        admin_pw_inp.fill("barber2026")
        page_desk.locator("button:has-text('Ingresar al Panel David'), button:has-text('Iniciar Sesión')").first.click()
        page_desk.wait_for_timeout(1500)

        page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/19_desk_admin_dashboard.png")
        check_overflow(page_desk, "desktop_admin_dashboard")

        # Check pending appointments tab and block slot tool
        pending_tab = page_desk.locator("button:has-text('Turnos Solicitados'), button:has-text('Solicitudes')").first
        if pending_tab.is_visible():
            pending_tab.click()
            page_desk.wait_for_timeout(600)
            page_desk.screenshot(path=f"{SCREENSHOTS_DIR}/20_desk_admin_pending_appointments.png")

        ctx_desk.close()

        # =========================================================================
        # 2. MOBILE VIEWPORT AUDIT (390x844 - iPhone)
        # =========================================================================
        log_audit("=== 2. MOBILE VIEWPORT AUDIT (390x844) ===")
        ctx_mob = browser.new_context(
            viewport={"width": 390, "height": 844},
            is_mobile=True,
            has_touch=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
        )
        page_mob = ctx_mob.new_page()
        attach_monitoring(page_mob, "mobile")

        # 2.1 Mobile Intro & Touch dismiss
        log_audit("Testing Mobile Intro tap gesture...")
        page_mob.goto(BASE_URL, wait_until="domcontentloaded")
        page_mob.screenshot(path=f"{SCREENSHOTS_DIR}/21_mob_intro_start.png")
        page_mob.touchscreen.tap(195, 422)
        page_mob.wait_for_timeout(400)
        page_mob.screenshot(path=f"{SCREENSHOTS_DIR}/22_mob_intro_dismissed.png")
        page_mob.wait_for_timeout(2300)

        page_mob.screenshot(path=f"{SCREENSHOTS_DIR}/23_mob_home.png")
        check_overflow(page_mob, "mobile_home")

        # 2.2 Mobile Floating Controls & Overlap Analysis
        log_audit("Analyzing Mobile Floating Controls & Overlap...")
        overlap_data = page_mob.evaluate("""() => {
            const results = {};
            const helpBtn = document.querySelector('button[aria-label*=\"ayuda\" i], button[aria-label*=\"whatsapp\" i]');
            const bottomNav = document.querySelector('nav.fixed');
            const pwaBanner = document.querySelector('[class*=\"pwa\"], [class*=\"install\"]');

            if (helpBtn) {
                const r = helpBtn.getBoundingClientRect();
                results.helpBtn = { top: r.top, bottom: r.bottom, right: r.right, height: r.height, zIndex: window.getComputedStyle(helpBtn).zIndex };
            }
            if (bottomNav) {
                const r = bottomNav.getBoundingClientRect();
                results.bottomNav = { top: r.top, bottom: r.bottom, zIndex: window.getComputedStyle(bottomNav).zIndex };
            }
            if (pwaBanner) {
                const r = pwaBanner.getBoundingClientRect();
                results.pwaBanner = { top: r.top, bottom: r.bottom, zIndex: window.getComputedStyle(pwaBanner).zIndex };
            }

            // Check if floating help button collides with bottom navigation dock
            let overlapsWithNav = false;
            if (results.helpBtn && results.bottomNav) {
                if (results.helpBtn.bottom > results.bottomNav.top) {
                    overlapsWithNav = true;
                }
            }
            results.overlapsWithNav = overlapsWithNav;
            return results;
        }""")
        log_audit(f"Mobile Floating Elements: {overlap_data}")
        results["ux_friction_points"].append({
            "flow": "Mobile Layout & Floating UI",
            "friction": "Superposición potencial de botones flotantes sobre navegación o contenido",
            "data": overlap_data
        })

        # 2.3 Mobile Member Flow (Lucas: 40123456, PIN: 1234)
        log_audit("Auditing Lucas login on Mobile...")
        page_mob.locator("nav button:has-text('CLUB')").first.click()
        page_mob.wait_for_timeout(400)

        lucas_btn = page_mob.locator("button:has-text('Lucas')").first
        if lucas_btn.is_visible():
            lucas_btn.click()
            page_mob.wait_for_timeout(400)
            page_mob.locator("button:has-text('Entrar a mi cuenta')").first.click()
            page_mob.wait_for_timeout(1000)

        page_mob.screenshot(path=f"{SCREENSHOTS_DIR}/24_mob_lucas_club.png")
        check_overflow(page_mob, "mobile_lucas_club")

        # Mobile QR Credential
        log_audit("Auditing Mobile QR Modal...")
        mob_qr_btn = page_mob.locator("button:has-text('Mi Credencial QR'), button:has-text('Credencial')").first
        if mob_qr_btn.is_visible():
            mob_qr_btn.click()
            page_mob.wait_for_timeout(600)
            page_mob.screenshot(path=f"{SCREENSHOTS_DIR}/25_mob_qr_modal.png")
            check_overflow(page_mob, "mobile_qr_modal")
            page_mob.keyboard.press("Escape")
            page_mob.wait_for_timeout(400)

        # 2.4 Mobile Booking Flow
        log_audit("Auditing Mobile Booking Flow (Step 1 -> Step 2)...")
        page_mob.locator("nav button:has-text('RESERVAR')").first.click()
        page_mob.wait_for_timeout(600)
        page_mob.screenshot(path=f"{SCREENSHOTS_DIR}/26_mob_step1_services.png")
        check_overflow(page_mob, "mobile_step1_services")

        # Select service on mobile
        first_svc = page_mob.locator("[role='button']:has-text('Fade & Corte de Autor')").first
        if first_svc.is_visible():
            first_svc.click()
            page_mob.wait_for_timeout(300)

        page_mob.locator("button:has-text('Elegir Día y Horario')").first.click()
        page_mob.wait_for_timeout(800)
        page_mob.screenshot(path=f"{SCREENSHOTS_DIR}/27_mob_step2_datetime.png")
        check_overflow(page_mob, "mobile_step2_datetime")

        # Check tap targets sizes on mobile
        tap_targets_audit = page_mob.evaluate("""() => {
            const smallTargets = [];
            document.querySelectorAll('button, a, input').forEach(el => {
                const r = el.getBoundingClientRect();
                if ((r.width > 0 && r.height > 0) && (r.width < 40 || r.height < 40)) {
                    smallTargets.push({
                        text: (el.innerText || el.getAttribute('aria-label') || el.name || '').slice(0, 30),
                        width: Math.round(r.width),
                        height: Math.round(r.height),
                        className: (el.className || '').slice(0, 50)
                    });
                }
            });
            return smallTargets.slice(0, 10);
        }""")
        log_audit(f"Mobile touch targets < 40px: {len(tap_targets_audit)} found.")
        results["ux_friction_points"].append({
            "flow": "Touch Targets en Móvil",
            "friction": "Elementos clickeables menores a los 44x44px recomendados por Apple HIG / Material Design",
            "items": tap_targets_audit
        })

        # 2.5 Mobile Mis Turnos
        log_audit("Auditing Mobile 'Mis Turnos'...")
        page_mob.locator("nav button:has-text('MIS TURNOS')").first.click()
        page_mob.wait_for_timeout(600)
        page_mob.screenshot(path=f"{SCREENSHOTS_DIR}/28_mob_mis_turnos.png")
        check_overflow(page_mob, "mobile_mis_turnos")

        ctx_mob.close()
        browser.close()

    # Write summary
    summary_file = os.path.join(SCREENSHOTS_DIR, "detailed_audit_summary.json")
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    log_audit(f"Full audit complete! Report written to {summary_file}")

if __name__ == "__main__":
    run()
