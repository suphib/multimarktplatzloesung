import { test, expect } from "@playwright/test";

test.describe("Artikelsuche", () => {
  test("sollte die Suchseite laden", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByText("KI-gestuetzte Beschaffung")).toBeVisible();
  });

  test("sollte nach Artikeln suchen koennen", async ({ page }) => {
    await page.goto("/search");
    await page.getByPlaceholder("Artikel suchen").fill("Laptop");
    await page.getByRole("button", { name: "Suchen" }).click();
    await expect(page).toHaveURL(/\/results/);
  });
});
