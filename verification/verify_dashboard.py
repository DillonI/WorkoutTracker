from playwright.sync_api import sync_playwright

def verify_dashboard():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:4173")

            # Wait for dashboard to load
            page.wait_for_selector("text=Good Morning")
            page.wait_for_selector("text=Total Volume")
            page.wait_for_selector("text=Weekly Goal")

            # Check for grid items
            page.wait_for_selector("text=Workout A")
            page.wait_for_selector("text=Workout B")

            # Take screenshot
            page.screenshot(path="verification/dashboard_verification.png", full_page=True)
            print("Screenshot taken successfully")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_dashboard()
