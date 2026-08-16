import { test, expect } from "@playwright/test";

test("goToReservation", async ({ page }) => {
  // Given: El usuario se encuentra en la pagina de paquetes turisticos
  await page.goto("/tour-packages/");
  // When: El usuario selecciona la opcion "Reservar" de un determinado paquete turistico
  await page.getByRole("button", { name: "Reservar" }).first().click();
  // Then: El sistema debe navegar a la pagina de reservas y mostrar la informacion del paquete seleccionado
  await expect(page).toHaveURL(/reservation/);
});
