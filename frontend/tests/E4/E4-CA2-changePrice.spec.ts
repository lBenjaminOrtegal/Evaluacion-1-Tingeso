import { test, expect } from "@playwright/test";

test("changePrice", async ({ page }) => {
  // Given: El usuario se encuentra en la pagina de reserva de un paquete turistico
  await page.goto("/tour-packages/");
  await page.getByRole('button', { name: 'Reservar' }).first().click();
  await expect(page).toHaveURL(/reservation/);
  const priceLocator = page.locator("text=Importe final:");
  const initialPriceText = await priceLocator.innerText();
  // When: El usuario selecciona una cierta cantidad de pasajeros
  await page.getByRole("combobox").selectOption("2");
  // Then: El sistema debe cambiar el precio total de la reserva
  await expect(priceLocator).not.toHaveText(initialPriceText);
});
