import { test, expect, Page } from "@playwright/test";

// Helper: click a button by its visible text
async function clickButton(page: Page, text: string) {
  await page.getByRole("button", { name: text }).click();
}

// Helper: type into an input identified by data-wiz-label
async function typeInput(page: Page, label: string, value: string) {
  const input = page.locator(`input[data-wiz-label="${label}"], textarea[data-wiz-label="${label}"]`);
  await input.fill(value);
  await input.blur();
  // Brief wait for React to process ASSIGN_CONTEXT event
  await page.waitForTimeout(200);
}

// Helper: select a dropdown value by data-wiz-label
async function selectInput(page: Page, label: string, value: string) {
  await page.locator(`select[data-wiz-label="${label}"]`).selectOption(value);
}

test.describe("Screener -> Interview E2E Flow", () => {
  test("completes the screener and navigates to interview", async ({ page }) => {
    // --- HOME PAGE ---
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("XState-Wizards");
    await clickButton(page, "Start");

    // --- SCREENER: INTERVIEW_INTRO_STATE ---
    await expect(page.getByText("Welcome!")).toBeVisible({ timeout: 5000 });
    await typeInput(page, "First Name", "TestUser");
    await clickButton(page, "Get Started");

    // --- SCREENER: personalizedStartMessage ---
    await expect(page.getByText("Great to meet you, TestUser!")).toBeVisible({ timeout: 5000 });
    // Wait for 5s countdown timer to complete and auto-transition
    await expect(page.getByText("How many questions")).toBeVisible({ timeout: 10_000 });

    // --- SCREENER: questionVolume ---
    await clickButton(page, "200+ Questions");

    // --- SCREENER: questionComplexity ---
    await expect(page.getByText("Do you find yourself asking users")).toBeVisible({ timeout: 5000 });
    await clickButton(page, "Yes! Very very complex");

    // --- SCREENER: developerExperience ---
    await expect(page.getByText("developer experience")).toBeVisible({ timeout: 5000 });
    // The "View Outline Tool" buttonLink fires VIEW_OUTLINE event and opens a new tab
    const popupPromise = page.waitForEvent("popup");
    await page.getByText("View Outline Tool").click();
    const popup = await popupPromise;
    await popup.close();
    // Now the Yes/No buttons should be enabled
    await clickButton(page, "Yes, I care about maintability.");

    // --- SCREENER: jsonLogicNeed ---
    await expect(page.getByText("json-logic interest you")).toBeVisible({ timeout: 5000 });
    await clickButton(page, "Oh perfect!");

    // --- SCREENER: evaluationProcessing ---
    await expect(page.getByText("Calculating need")).toBeVisible({ timeout: 5000 });

    // --- SCREENER: evaluationResult (wait for 2s processing) ---
    await expect(page.getByText("XState Wizards will be useful")).toBeVisible({ timeout: 10_000 });
    await clickButton(page, "Great! Show me more.");

    // After INTERESTED event, the form re-renders with name inputs
    await expect(page.getByText("add your first and last names")).toBeVisible({ timeout: 5000 });
    await typeInput(page, "First Name", "TestUser");
    await typeInput(page, "Last Name", "Doe");
    await typeInput(page, "Password", "secret123");
    await clickButton(page, "Yea! Let's do it");

    // --- Should navigate to /interview ---
    await page.waitForURL("**/interview", { timeout: 10_000 });
  });

  test("completes the interview flow with child machine", async ({ page }) => {
    // Start directly at /interview (bypasses screener for focused testing)
    await page.goto("/interview");

    // --- INTERVIEW: INTERVIEW_INTRO_STATE ---
    await expect(page.getByText("explore functionality")).toBeVisible({ timeout: 10_000 });
    await clickButton(page, "Continue");

    // --- INTERVIEW: humanTestPi ---
    await expect(page.getByText("starting digits of Pi")).toBeVisible({ timeout: 5000 });
    // The Pi input may be shown by invoke timeout or by clicking "show pi input" button
    const piInput = page.locator('input[data-wiz-label="Pi"]');
    const showPiButton = page.getByRole("button", { name: "show pi input" });
    // Wait for either the input to appear (invoke worked) or the button to appear
    await expect(piInput.or(showPiButton)).toBeVisible({ timeout: 5000 });
    // If the button appeared instead, click it to show the input
    if (await showPiButton.isVisible()) {
      await showPiButton.click();
      await expect(piInput).toBeVisible({ timeout: 3000 });
    }
    await piInput.fill("3.14");
    await piInput.blur();
    await clickButton(page, "Continue");

    // --- INTERVIEW: humanTestYear ---
    await expect(page.getByText("custom drop down")).toBeVisible({ timeout: 5000 });
    const currentYear = new Date().getFullYear().toString();
    await selectInput(page, "Current Year", currentYear);
    await page.waitForTimeout(300);
    await clickButton(page, "Continue");

    // --- INTERVIEW: userName ---
    await expect(page.getByText("Editing a data model")).toBeVisible({ timeout: 5000 });
    await typeInput(page, "First Name", "Test");
    await typeInput(page, "Last Name", "User");
    await typeInput(page, "E-mail", "test@example.com");
    // Age input (AgeInput component has two selects: years and months, inside a label)
    const ageLabel = page.locator('label').filter({ hasText: "Pick your age!" });
    const ageYearSelect = ageLabel.locator('select').first();
    await ageYearSelect.selectOption("25");
    await page.waitForTimeout(200);
    // Phone number is optional — skip filling it since Playwright's fill()
    // bypasses the component's country code prefix logic, causing validation failure
    // Wait for validation to clear and button to become enabled
    const looksGoodBtn = page.getByRole("button", { name: "Looks good" });
    await expect(looksGoodBtn).toBeEnabled({ timeout: 5000 });
    await looksGoodBtn.click();

    // --- INTERVIEW: petsAsk ---
    await expect(page.getByText("Do you have pets")).toBeVisible({ timeout: 5000 });
    await clickButton(page, "No");

    // --- INTERVIEW: hobbiesAsk ---
    await expect(page.getByText("Do you have any hobbies")).toBeVisible({ timeout: 5000 });
    await clickButton(page, "Yep!");

    // --- INTERVIEW: hobbiesList ---
    await expect(page.getByText("Have any hobbies")).toBeVisible({ timeout: 5000 });
    await clickButton(page, "+ Add Hobby");

    // --- SPAWNED MACHINE: hobbyEditor (child machine) ---
    await expect(page.getByText("Hobby Editor")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("sub-machine, spawned in isolation")).toBeVisible();
    await typeInput(page, "Description", "Playing guitar");
    // Date select - fill in the 3 date selects (month/day/year)
    const dateSelects = page.locator('.content-node__input.date select');
    if (await dateSelects.count() >= 3) {
      await dateSelects.nth(0).selectOption({ index: 1 }); // First non-empty month
      await dateSelects.nth(1).selectOption({ index: 1 }); // First non-empty day
      await dateSelects.nth(2).selectOption({ index: 1 }); // First non-empty year
    }
    await typeInput(page, "Collaborator Name (Optional)", "A Friend");
    // Address fields
    const street1 = page.locator('input[data-wiz-label="Street 1"], input[data-wiz-label="Street"]');
    if (await street1.count() > 0) {
      await street1.first().fill("123 Main St");
      await street1.first().blur();
    }
    const city = page.locator('input[data-wiz-label="City"]');
    if (await city.count() > 0) {
      await city.fill("Anytown");
      await city.blur();
    }
    const stateInput = page.locator('input[data-wiz-label="State"]');
    if (await stateInput.count() > 0) {
      await stateInput.fill("CA");
      await stateInput.blur();
    }
    const zipcode = page.locator('input[data-wiz-label="Zip"], input[data-wiz-label="Zipcode"], input[data-wiz-label="Zip Code"]');
    if (await zipcode.count() > 0) {
      await zipcode.first().fill("90210");
      await zipcode.first().blur();
    }
    const country = page.locator('select[data-wiz-label="Country"], input[data-wiz-label="Country"]');
    if (await country.count() > 0) {
      const tagName = await country.first().evaluate((el) => el.tagName);
      if (tagName === "SELECT") {
        await country.first().selectOption({ index: 1 });
      } else {
        await country.first().fill("US");
        await country.first().blur();
      }
    }
    await clickButton(page, "Save");

    // --- Back to INTERVIEW: hobbiesList (verify hobby was saved) ---
    await expect(page.getByText("Playing guitar")).toBeVisible({ timeout: 10_000 });
    await clickButton(page, "Done");

    // --- INTERVIEW: faq ---
    await expect(page.getByText("Thanks for checking things out")).toBeVisible({ timeout: 5000 });
    await clickButton(page, "Exit");

    // --- Interview complete: should navigate back to / ---
    await page.waitForURL("**/", { timeout: 10_000 });
  });
});
