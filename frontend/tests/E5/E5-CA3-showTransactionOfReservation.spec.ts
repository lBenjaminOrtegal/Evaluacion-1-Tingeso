import { test, expect } from "@playwright/test";

test("showTransactionOfReservation", async ({ page }) => {
  // Given: El usuario se encuentra en la pagina de reservas y posee una reserva confirmada (pago hecho)
  await page.goto("/tour-packages");
  await page.getByRole("button", { name: "Reservar" }).first().click();
  await page.getByRole("button", { name: "Confirmar Reserva" }).click();
  await page.getByRole("button", { name: "Aceptar" }).click();
  await expect(page).toHaveURL(/reservations/);
  await page.getByRole("button", { name: "Pagar Ahora" }).first().click();
  await expect(page).toHaveURL(/payment/);
  await page.getByRole("textbox", { name: "0000 0000 0000 0000" }).click();
  await page.getByRole("textbox", { name: "0000 0000 0000 0000" }).fill("1111111111111111");
  await page.getByRole("textbox", { name: "MM/AA" }).click();
  await page.getByRole("textbox", { name: "MM/AA" }).fill("11/11");
  await page.getByRole("textbox", { name: "123" }).click();
  await page.getByRole("textbox", { name: "123" }).fill("111");
  await page.getByRole('button', { name: 'Confirmar Pago' }).click();
  await page.getByRole('button', { name: 'Aceptar' }).click();
  await expect(page).toHaveURL(/reservations/);
  // When: El usuario selecciona la opcion transaccion de dicha reserva
  await page.getByText(/transacci[oó]n/i).first().click();
  // Then: El sistema debe mostrar la informacion relacionada a la transaccion de dicha reserva
  const transactionMessage = page.getByText(/transacci[oó]n/i).first();
  await expect(transactionMessage).toBeVisible();
});
