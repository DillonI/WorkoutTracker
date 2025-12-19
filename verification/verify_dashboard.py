
from playwright.sync_api import sync_playwright
import time
import datetime

def verify_dashboard():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to the dashboard
        page.goto("http://localhost:3000")

        # Wait for the dashboard to load
        page.wait_for_selector("text=Workout A")

        # Determine expected greeting
        hour = datetime.datetime.now().hour
        expected_greeting = ""
        if 5 <= hour < 12:
            expected_greeting = "Good Morning"
        elif 12 <= hour < 17:
            expected_greeting = "Good Afternoon"
        else:
            expected_greeting = "Good Evening"

        print(f"Current hour: {hour}, Expected greeting: {expected_greeting}")

        # Verify greeting
        # Using a flexible locator to find the greeting text
        greeting_locator = page.get_by_text(expected_greeting)
        if greeting_locator.count() > 0:
            print(f"SUCCESS: Found greeting '{expected_greeting}'")
        else:
            print(f"FAILURE: Could not find greeting '{expected_greeting}'")
            # Dump page content for debugging
            print(page.content())

        # Verify Avatar
        # Look for a button containing "D"
        avatar_button = page.locator("button").filter(has_text="D")
        if avatar_button.count() > 0:
            print("SUCCESS: Found Avatar button with 'D'")
        else:
            print("FAILURE: Could not find Avatar button with 'D'")

        # Take screenshot
        page.screenshot(path="verification/dashboard_verification.png")

        browser.close()

if __name__ == "__main__":
    verify_dashboard()
