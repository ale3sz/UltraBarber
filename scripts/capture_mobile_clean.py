import os
import sys
from playwright.sync_api import sync_playwright

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT_DIR, "audit_screenshots")
BASE_URL = "http://localhost:7200"
EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path=EDGE_PATH,
        headless=True,
        args=["--disable-gpu", "--no-sandbox"]
    )
    ctx = browser.new_context(
        viewport={"width": 390, "height": 844},
        device_scale_factor=2,
        is_mobile=True,
        has_touch=True
    )
    page = ctx.new_page()

    def snap(name, full_page=True):
        page.wait_for_timeout(600)
        p = os.path.join(OUT_DIR, f"mobile_{name}.png")
        page.screenshot(path=p, full_page=full_page)
        print(f"[SNAP MOBILE] {name}")

    page.goto(BASE_URL, wait_until="networkidle")
    page.wait_for_timeout(600)
    snap("01_home_invitado")

    # DNI Focus
    dni = page.locator("#dni-input")
    if dni.is_visible():
        dni.scroll_into_view_if_needed()
        snap("02_validacion_socio_dni", full_page=False)

    # Login Mateo
    demo = page.get_by_role("button", name="Mateo")
    if demo.is_visible():
        demo.click()
        page.wait_for_timeout(300)
        page.get_by_role("button", name="Entrar a mi cuenta").click()
        page.wait_for_timeout(800)

    # Scroll to top & snap 03
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(400)
    snap("03_home_socio_autenticado")

    # Beneficios & Canjes
    tab_premios = page.get_by_role("button", name="Beneficios & Canjes")
    if tab_premios.is_visible():
        tab_premios.click()
        page.wait_for_timeout(500)
        snap("04_socio_beneficios_canjes")
        # back to puntos
        page.get_by_role("button", name="Pase de Socio").click()
        page.wait_for_timeout(300)

    # QR modal
    qr_btn = page.locator('button[aria-label*="QR"]').first
    if qr_btn.is_visible():
        qr_btn.click()
        page.wait_for_timeout(500)
        snap("05_modal_qr_socio", full_page=False)
        page.get_by_role("button", name="Listo").click()
        page.wait_for_timeout(300)

    # Paso 1: Servicios
    dock_book = page.locator('nav[aria-label="Navegación principal móvil"] button').nth(1)
    dock_book.click()
    page.wait_for_timeout(600)
    snap("06_reserva_paso1_servicios")

    # Select Corte + Bebida and click Continuar
    page.locator('h3:has-text("Corte + Bebida")').first.click()
    page.wait_for_timeout(400)
    btn_paso2 = page.locator('button').filter(has_text="Elegir Día y Horario").first
    if btn_paso2.is_visible():
        btn_paso2.click()
        page.wait_for_timeout(600)

    # Paso 2: Horarios
    slot = page.locator('button:has-text(":"):not([disabled]):not(:has-text("Ocupado"))').first
    if slot.is_visible():
        slot.click()
        page.wait_for_timeout(400)
    snap("07_reserva_paso2_horario")

    # Paso 3: Confirmación / Hold
    solicitar = page.get_by_role("button", name="Solicitar Turno")
    if solicitar.is_visible() and solicitar.is_enabled():
        solicitar.click()
        page.wait_for_timeout(1200)
        snap("08_reserva_paso3_confirmacion_hold")

    # Mis Turnos
    dock_turns = page.locator('nav[aria-label="Navegación principal móvil"] button').nth(2)
    dock_turns.click()
    page.wait_for_timeout(600)
    snap("09_mis_turnos")

    browser.close()
    print("[DONE] Mobile suite complete.")
