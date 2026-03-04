import { test, expect } from "@playwright/test";

test.describe("Inline i18n Locale Objects", () => {
  test("displays inline locale content and switches languages", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("i18n Example")).toBeVisible({ timeout: 10_000 });

    // --- Verify English inline content (default) ---
    await expect(page.locator("h3").filter({ hasText: "Welcome to Inline i18n" })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("inline locale objects")).toBeVisible();

    // --- Switch to Spanish ---
    await page.getByRole("button", { name: "Spanish" }).click();
    await expect(page.locator("h3").filter({ hasText: "Bienvenido a i18n en linea" })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("objetos de idioma en linea")).toBeVisible();

    // --- Switch back to English ---
    await page.getByRole("button", { name: "English" }).click();
    await expect(page.locator("h3").filter({ hasText: "Welcome to Inline i18n" })).toBeVisible({ timeout: 5000 });
  });

  test("submits form with inline i18n and shows interpolated text", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("i18n Example")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("h3").filter({ hasText: "Welcome to Inline i18n" })).toBeVisible({ timeout: 5000 });

    // Fill in name
    const nameInput = page.locator('input[data-wiz-label="Your name"]');
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill("Alice");
    await nameInput.blur();

    // Submit
    await page.getByRole("button", { name: "Continue", exact: true }).click();

    // Should show interpolated text with the name
    await expect(page.getByText("Hello, Alice!")).toBeVisible({ timeout: 5000 });
  });

  test("submits form in Spanish and shows interpolated text", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("i18n Example")).toBeVisible({ timeout: 10_000 });

    // Switch to Spanish
    await page.getByRole("button", { name: "Spanish" }).click();
    await expect(page.locator("h3").filter({ hasText: "Bienvenido a i18n en linea" })).toBeVisible({ timeout: 5000 });

    // Fill in name (label should be Spanish)
    const nameInput = page.locator('input[data-wiz-label="Tu nombre"]');
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill("Carlos");
    await nameInput.blur();

    // Submit
    await page.getByRole("button", { name: "Continue", exact: true }).click();

    // Should show Spanish interpolated text
    await expect(page.getByText("Hola, Carlos!")).toBeVisible({ timeout: 5000 });
  });
});
