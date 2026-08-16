import { test, expect } from "@playwright/test";

test("goToPayment", async ({ page }) => {
  // Given: El usuario se encuentra en la pagina de pagos 
  await page.goto("/tour-packages");
  await page.getByRole("button", { name: "Reservar" }).first().click();
  await page.getByRole("button", { name: "Confirmar Reserva" }).click();
  await page.getByRole("button", { name: "Aceptar" }).click();
  await expect(page).toHaveURL(/reservations/);
  await page.getByRole("button", { name: "Pagar Ahora" }).first().click();
  await expect(page).toHaveURL(/payment/);
  // When: El usuario rellena la informacion de su metodo de pago y selecciona la opcion confirmar pago
  await page.getByRole('textbox', { name: '0000 0000 0000' }).click();
  await page.getByRole('textbox', { name: '0000 0000 0000' }).fill('1111111111111111');
  await page.getByRole('textbox', { name: 'MM/AA' }).click();
  await page.getByRole('textbox', { name: 'MM/AA' }).fill('11/11');
  await page.getByRole('textbox', { name: '123' }).click();
  await page.getByRole('textbox', { name: '123' }).fill('111');
  await page.getByRole('button', { name: 'Confirmar Pago' }).click();
  // Then: El sistema debe mostrar un mensaje indicando los detalles de la transaccion, y que esta ha sido exitosa
  const confirmationMessage = page.getByText("Transacción ÉXITOSA");
  await expect(confirmationMessage).toBeVisible();
});