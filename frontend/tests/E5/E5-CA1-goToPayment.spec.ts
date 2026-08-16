import { test, expect } from "@playwright/test";

test("goToPayment", async ({ page }) => {
  // Given: El usuario se encuentra en la pagina de sus reservas y tiene una reserva creada
  await page.goto("/tour-packages");
  await page.getByRole("button", { name: "Reservar" }).first().click();
  await page.getByRole("button", { name: "Confirmar Reserva" }).click();
  await page.getByRole("button", { name: "Aceptar" }).click();
  await expect(page).toHaveURL(/reservations/);
  // When: El usuario selecciona la opcion pagar ahora de una determinada reserva
  await page.getByRole("button", { name: "Pagar Ahora" }).first().click();
  // Then: El sistema debe navegar a la pagina de pagos, mostrando la informacion del paquete turistico y el precio a pagar por la reserva
  await expect(page).toHaveURL(/payment/);
  await expect(page.getByText("Total a pagar")).toBeVisible();
});
