import { test, expect } from "@playwright/test";

test("showReservationConfirmation", async ({ page }) => {
  // Given: El usuario se encuentra en la pagina de reservas
  await page.goto("/tour-packages/");
  await page.getByRole('button', { name: 'Reservar' }).first().click();
  await expect(page).toHaveURL(/reservation/);
  // When: El usuario selecciona la opcion confirmar reserva
  await page.getByRole("button", { name: "Confirmar Reserva" }).click();
  // Then: El sistema debe mostrar un mensaje indicando que la reserva ha sido creada con exito
  const confirmationMessage = page.getByText("Reserva creada");
  await expect(confirmationMessage).toBeVisible();
});
