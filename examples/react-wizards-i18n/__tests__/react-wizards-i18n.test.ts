import { test, expect } from "@playwright/test";

test.describe("i18n Language Switching Flow", () => {
  test("switches languages and completes the wizard", async ({ page }) => {
    await page.goto("/");

    // --- Verify English is the default language ---
    await expect(page.getByText("i18n Example")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("English Title")).toBeVisible();
    // English content nodes
    await expect(page.locator("h3").filter({ hasText: "English" }).first()).toBeVisible();

    // --- Switch to Spanish ---
    await page.getByRole("button", { name: "Spanish" }).click();
    await expect(page.getByText("Spanish Title")).toBeVisible({ timeout: 5000 });
    // Spanish content nodes
    await expect(page.locator("h3").filter({ hasText: "Spanish" }).first()).toBeVisible();

    // --- Switch back to English ---
    await page.getByRole("button", { name: "English" }).click();
    await expect(page.getByText("English Title")).toBeVisible({ timeout: 5000 });

    // --- Fill in email and submit ---
    const emailInput = page.locator('input[data-wiz-label="English Email"]');
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await emailInput.fill("test@example.com");
    await emailInput.blur();

    // Click Continue button (CONTENT_NODE_SUBMIT text is "Continue")
    await page.getByRole("button", { name: "Continue", exact: true }).click();

    // --- Verify second state content ---
    await expect(page.getByText("English 2")).toBeVisible({ timeout: 5000 });
  });

  test("displays Spanish translations in second state when Spanish is selected", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("i18n Example")).toBeVisible({ timeout: 10_000 });

    // Switch to Spanish first
    await page.getByRole("button", { name: "Spanish" }).click();
    await expect(page.getByText("Spanish Title")).toBeVisible({ timeout: 5000 });

    // Fill email and submit
    const emailInput = page.locator('input[data-wiz-label="Spanish Email"]');
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await emailInput.fill("test@example.com");
    await emailInput.blur();

    // Submit (first Continue-type button)
    await page.getByRole("button", { name: "Continue", exact: true }).click();

    // Second state should show Spanish text
    await expect(page.getByText("Spanish 2")).toBeVisible({ timeout: 5000 });
  });
});
