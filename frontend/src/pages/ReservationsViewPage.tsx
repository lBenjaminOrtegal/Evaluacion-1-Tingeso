import React, { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { Alert, Button, Container, Stack } from "react-bootstrap";
import reservationService from "../services/reservation.service";
import type { Reservation } from "../interfaces/reservation.interface";
import { Link } from "react-router-dom";

function ReservationsViewPage() {
  const { keycloak } = useKeycloak();

  const [reservations, setReservations] = useState<Reservation[]>([]);

  const getReservations = async () => {
    if (!keycloak.authenticated) {
      return;
    }
    const email: string = keycloak.tokenParsed?.email;
    try {
      const response = await reservationService.getByEmail(email);
      setReservations(response.data);
    } catch (error) {
      console.error("Error cargando reservas:", error);
    }
  };

  if (!keycloak.authenticated) {
    return (
      <Container className="d-flex justify-content-center align-items-center">
        <div className="text-center p-5 border-0">
          <h2 className="text-primary fw-bold h4 mb-3">Gestionar Reservas</h2>

          <p className="text-muted mb-4">
            Para hacer, editar y gestionar reservas necesitamos verificar tu
            identidad.
          </p>

          <div className="d-grid">
            <Button
              onClick={() => keycloak.login()}
              variant="primary"
              className="py-2 fw-bold shadow-sm"
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  useEffect(() => {
    getReservations();
  }, []);

  return (
    <Container className="mt-4">
      <Stack
        direction="horizontal"
        gap={3}
        className="mb-4 pb-3 border-bottom align-items-center"
      >
        <div>
          <h1 className="fs-3 fw-bold text-primary">Mis reservas</h1>
          <p className="text-muted m-0">
            Visualiza, edita y administra tus reservas.
          </p>
        </div>
      </Stack>

      {reservations.length <= 0 && (
        <div className="text-center p-5 border rounded bg-light">
          <p className="text-muted mb-0">Aún no tienes reservas registradas.</p>
          <Button
            as={Link as any}
            to="/tour-packages"
            variant="link"
            className="p-0 ms-0 fw-medium text-decoration-none"
          >
            Haz click aquí para ver el catálogo!
          </Button>
        </div>
      )}
    </Container>
  );
}

export default ReservationsViewPage;
