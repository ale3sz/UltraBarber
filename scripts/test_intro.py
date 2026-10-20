from playwright.sync_api import sync_playwright

p = sync_playwright().start()
b = p.chromium.launch(executable_path=r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe')
page = b.new_page()
page.goto('http://localhost:7200/?intro=1')
res = page.evaluate('() => ({ search: window.location.search, seen: sessionStorage.getItem("david_intro_seen") })')
print("EVAL RESULT:", res)
b.close()
p.stop()
