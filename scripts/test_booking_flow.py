from playwright.sync_api import sync_playwright

p = sync_playwright().start()
b = p.chromium.launch(executable_path=r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe')
page = b.new_page(viewport={"width": 1440, "height": 900})

print("1. Cargando pagina principal...")
page.goto('http://localhost:7200')
page.evaluate("sessionStorage.setItem('david_intro_seen', 'true')")
page.goto('http://localhost:7200')

print("2. Haciendo clic en 'RESERVAR' en el Navbar...")
page.click('button:has-text("RESERVAR")')
page.wait_for_timeout(500)

step1_title = page.inner_text('h2')
print(f"Paso 1 detectado: {step1_title}")
assert "¿Qué te servimos hoy?" in step1_title

print("3. Haciendo clic en 'ELEGIR DÍA Y HORARIO'...")
page.click('button:has-text("ELEGIR DÍA Y HORARIO")')
page.wait_for_timeout(500)

step2_title = page.inner_text('h2')
print(f"Paso 2 detectado: {step2_title}")
assert "esperamos en el sillón" in step2_title

print("4. Seleccionando fecha y horario libre...")
# Click en el primer dia disponible
page.locator('div.grid-cols-3 button, div.grid-cols-6 button').first.click()
page.wait_for_timeout(300)

# Click en el primer horario disponible
available_slot = page.locator('button:not([disabled])').filter(has_text=":").first
print("Slot seleccionado:", available_slot.inner_text())
available_slot.click()
page.wait_for_timeout(300)

print("5. Haciendo clic en 'Solicitar Turno'...")
page.click('button:has-text("Solicitar Turno")')
page.wait_for_timeout(500)

step3_title = page.inner_text('h3:has-text("¿A nombre de quién reservamos el sillón?")')
print(f"Paso 3 detectado (Check-in): {step3_title}")
assert "¿A nombre de quién" in step3_title

print("\n>>> TEST DE FLUJO DE RESERVA EXITOSO AL 100%! <<<")
b.close()
p.stop()
