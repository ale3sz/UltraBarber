import time
from playwright.sync_api import sync_playwright

p = sync_playwright().start()
b = p.chromium.launch(executable_path=r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', headless=True)
page = b.new_page(viewport={'width': 1440, 'height': 900})

console_msgs = []
failed_reqs = []
page.on('console', lambda m: console_msgs.append(f"{m.type}: {m.text}"))
page.on('response', lambda r: failed_reqs.append(f"{r.status} {r.url}") if r.status >= 400 else None)

page.goto('http://localhost:7200')
page.keyboard.press('Escape')
page.wait_for_timeout(2500)

nav_res = page.locator("nav button:has-text('Reservar')").first
nav_res.click()
page.wait_for_timeout(600)

primera_vez = page.locator("button:has-text('Primera vez')").first
primera_vez.click()
page.wait_for_timeout(400)

test_dni = f"49{int(time.time()) % 1000000:06d}"
page.locator("#dni-reg-input").fill(test_dni)
page.locator("input[placeholder='Agustín']").fill("Martín")
page.locator("input[placeholder='Gómez']").fill("Pérez")
page.locator("input[placeholder*='555-1234']").fill("3419991122")
page.locator("input[placeholder='Ej: 2580']").fill("1234")

page.locator("button:has-text('ACTIVAR MEMBRESÍA Y RESERVAR')").click()
page.wait_for_timeout(1500)

print("--- AFTER REGISTRATION SUBMIT ---")
print(page.inner_text('main')[:600])

print("--- HEADINGS IN MAIN ---")
for h in page.locator("h2, h3").all():
    print("H:", h.inner_text().strip())

print("--- CONSOLE MSGS ---")
for c in console_msgs:
    print(c)

print("--- FAILED REQS ---")
for r in failed_reqs:
    print(r)

b.close()
p.stop()
