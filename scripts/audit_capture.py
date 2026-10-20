import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT_DIR, "audit_screenshots")
BASE_URL = "http://localhost:7200"
EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def run_audit_capture():
    ensure_dir(OUT_DIR)
    print(f"[AUDIT] Iniciando captura de auditoria en: {OUT_DIR}")

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=EDGE_PATH,
            headless=True,
            args=["--disable-gpu", "--no-sandbox"]
        )

        # ---------------------------------------------------------
        # 1. DESKTOP VIEWPORT (1440x900)
        # ---------------------------------------------------------
        print("\n--- CAPTURAS DESKTOP (1440x900) ---")
        context_desktop = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=1.5
        )
        page = context_desktop.new_page()

        # Helper for capturing
        def snap_desktop(name, full_page=True):
            page.wait_for_timeout(600)
            file_path = os.path.join(OUT_DIR, f"desktop_{name}.png")
            page.screenshot(path=file_path, full_page=full_page)
            print(f"  [SNAP DESKTOP] desktop_{name}.png")

        # 1.1 Home / Club Invitado
        page.goto(BASE_URL, wait_until="networkidle")
        page.wait_for_timeout(500)
        snap_desktop("01_home_invitado")

        # 1.2 Validación de Socio (Focus en DNI / Toggle "Ya soy socio")
        dni_input = page.locator("#dni-input")
        if dni_input.is_visible():
            dni_input.scroll_into_view_if_needed()
            dni_input.click()
            snap_desktop("02_validacion_socio_dni", full_page=False)

        # 1.3 Login con socio demo (Mateo 10 PTS)
        demo_btn = page.locator('button').filter(has_text="Mateo").first
        if demo_btn.is_visible():
            demo_btn.click()
            page.wait_for_timeout(300)
            login_btn = page.locator('button').filter(has_text="Entrar a mi cuenta").first
            if login_btn.is_visible():
                login_btn.click()
                page.wait_for_timeout(700)

        # Volver al inicio con Mateo logueado
        tab_club = page.locator('header button').filter(has_text="Mi Pase").first
        if tab_club.is_visible():
            tab_club.click()
            page.wait_for_timeout(400)
        snap_desktop("03_home_socio_autenticado")

        # 1.4 Tab Premios & Canjes en MembershipCard
        tab_premios = page.locator('button').filter(has_text="Beneficios").first
        if tab_premios.is_visible():
            tab_premios.click()
            page.wait_for_timeout(400)
            snap_desktop("04_socio_beneficios_canjes")
            # Volver a puntos
            tab_puntos = page.locator('button').filter(has_text="Pase de Socio").first
            if tab_puntos.is_visible():
                tab_puntos.click()
                page.wait_for_timeout(300)

        # 1.5 Modal QR de Socio
        qr_btn = page.locator('button[aria-label*="QR"], button[title*="QR"]').first
        if qr_btn.is_visible():
            qr_btn.click()
            page.wait_for_timeout(400)
            snap_desktop("05_modal_qr_socio", full_page=False)
            close_qr = page.locator('button:has-text("Listo")').first
            if close_qr.is_visible():
                close_qr.click()
                page.wait_for_timeout(300)

        # 1.6 Flujo de Reserva - Paso 1: Servicios y Bebida
        tab_book = page.locator('header button:has-text("Reservar")').first
        if tab_book.is_visible():
            tab_book.click()
            page.wait_for_timeout(600)
            snap_desktop("06_reserva_paso1_servicios")

        # Seleccionar servicio con bebida para habilitar selector de bebidas
        corte_bebida = page.locator('h3:has-text("Corte + Bebida")').first
        if corte_bebida.is_visible():
            corte_bebida.click()
            page.wait_for_timeout(400)

        # Avanzar al Paso 2
        btn_paso2 = page.locator('button:has-text("Elegir Día y Horario"), button:has-text("Continuar")').first
        if btn_paso2.is_visible():
            btn_paso2.click()
            page.wait_for_timeout(600)

        # 1.7 Flujo de Reserva - Paso 2: Fecha y Horario
        # Clickear un slot de horario disponible (ej: 09:00 o cualquier botón de hora libre)
        slot = page.locator('button:has-text(":"):not([disabled]):not(:has-text("Ocupado"))').first
        if slot.is_visible():
            slot.click()
            page.wait_for_timeout(400)
        snap_desktop("07_reserva_paso2_horario")

        # 1.8 Flujo de Reserva - Paso 3: Confirmación / Hold 15 min
        solicitar_btn = page.locator('button:has-text("Solicitar Turno")')
        if solicitar_btn.is_visible() and solicitar_btn.is_enabled():
            solicitar_btn.click()
            page.wait_for_timeout(1000)
            snap_desktop("08_reserva_paso3_confirmacion_hold")

        # 1.9 Mis Turnos
        tab_turns = page.locator('header button:has-text("Mis Turnos")').first
        if tab_turns.is_visible():
            tab_turns.click()
            page.wait_for_timeout(600)
            snap_desktop("09_mis_turnos")

        context_desktop.close()

        # ---------------------------------------------------------
        # 2. MOBILE VIEWPORT (390x844)
        # ---------------------------------------------------------
        print("\n--- CAPTURAS MOBILE (390x844) ---")
        context_mobile = browser.new_context(
            viewport={"width": 390, "height": 844},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True,
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1"
        )
        m_page = context_mobile.new_page()

        def snap_mobile(name, full_page=True):
            m_page.wait_for_timeout(600)
            file_path = os.path.join(OUT_DIR, f"mobile_{name}.png")
            m_page.screenshot(path=file_path, full_page=full_page)
            print(f"  [SNAP MOBILE] mobile_{name}.png")

        # 2.1 Mobile Home Invitado
        m_page.goto(BASE_URL, wait_until="networkidle")
        m_page.wait_for_timeout(600)
        snap_mobile("01_home_invitado")

        # 2.2 Mobile Validación / DNI
        m_dni = m_page.locator("#dni-input")
        if m_dni.is_visible():
            m_dni.scroll_into_view_if_needed()
            snap_mobile("02_validacion_socio_dni", full_page=False)

        # 2.3 Mobile Login Mateo
        m_demo = m_page.locator('button').filter(has_text="Mateo").first
        if m_demo.is_visible():
            m_demo.click()
            m_page.wait_for_timeout(300)
            m_login = m_page.locator('button').filter(has_text="Entrar a mi cuenta").first
            if m_login.is_visible():
                m_login.click()
                m_page.wait_for_timeout(700)

        # Volver al home mobile con socio autenticado
        m_tab_club = m_page.locator('nav button').filter(has_text="Mi Pase").first
        if m_tab_club.is_visible():
            m_tab_club.click()
            m_page.wait_for_timeout(500)
        snap_mobile("03_home_socio_autenticado")

        # 2.4 Mobile Beneficios & Canjes
        m_premios = m_page.locator('button').filter(has_text="Beneficios").first
        if m_premios.is_visible():
            m_premios.click()
            m_page.wait_for_timeout(400)
            snap_mobile("04_socio_beneficios_canjes")
            m_puntos = m_page.locator('button').filter(has_text="Pase de Socio").first
            if m_puntos.is_visible():
                m_puntos.click()
                m_page.wait_for_timeout(300)

        # 2.5 Mobile QR Modal
        m_qr = m_page.locator('button[aria-label*="QR"], button[title*="QR"]').first
        if m_qr.is_visible():
            m_qr.click()
            m_page.wait_for_timeout(400)
            snap_mobile("05_modal_qr_socio", full_page=False)
            m_close_qr = m_page.locator('button:has-text("Listo")').first
            if m_close_qr.is_visible():
                m_close_qr.click()
                m_page.wait_for_timeout(300)

        # 2.6 Mobile Flujo de Reserva - Paso 1: Servicios
        m_tab_book = m_page.locator('nav button:has-text("Reservar")').first
        if m_tab_book.is_visible():
            m_tab_book.click()
            m_page.wait_for_timeout(600)
            snap_mobile("06_reserva_paso1_servicios")

        # Seleccionar Corte + Bebida y avanzar
        m_corte = m_page.locator('h3:has-text("Corte + Bebida")').first
        if m_corte.is_visible():
            m_corte.click()
            m_page.wait_for_timeout(300)

        m_btn2 = m_page.locator('button:has-text("Elegir Día y Horario"), button:has-text("Continuar")').first
        if m_btn2.is_visible():
            m_btn2.click()
            m_page.wait_for_timeout(600)

        # 2.7 Mobile Flujo de Reserva - Paso 2: Horarios
        m_slot = m_page.locator('button:has-text(":"):not([disabled]):not(:has-text("Ocupado"))').first
        if m_slot.is_visible():
            m_slot.click()
            m_page.wait_for_timeout(400)
        snap_mobile("07_reserva_paso2_horario")

        # 2.8 Mobile Paso 3: Hold 15 min & Handshake
        m_solicitar = m_page.locator('button:has-text("Solicitar Turno")')
        if m_solicitar.is_visible() and m_solicitar.is_enabled():
            m_solicitar.click()
            m_page.wait_for_timeout(1000)
            snap_mobile("08_reserva_paso3_confirmacion_hold")

        # 2.9 Mobile Mis Turnos
        m_tab_turns = m_page.locator('nav button:has-text("Turnos")').first
        if m_tab_turns.is_visible():
            m_tab_turns.click()
            m_page.wait_for_timeout(600)
            snap_mobile("09_mis_turnos")

        context_mobile.close()
        browser.close()

    print(f"\n[DONE] Auditoria visual completada con exito. Guardado en: {OUT_DIR}")

if __name__ == "__main__":
    run_audit_capture()
