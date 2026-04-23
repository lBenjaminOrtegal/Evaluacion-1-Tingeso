import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Stack,
  Container,
  Modal,
  Badge,
  Spinner,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import reservationService from "../services/reservation.service";
import type { Reservation } from "../interfaces/reservation.interface";

function ReservationsAdminPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getreservations = async () => {
    try {
      setLoading(true);
      const response = await reservationService.getAll();
      setReservations(response.data);
    } catch (error) {
      console.error("Error cargando reservas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (idToDelete === null) return;
    try {
      await reservationService.deleteById(idToDelete);
      setIdToDelete(null);
      await getreservations();
    } catch (error) {
      console.error("No se pudo eliminar la reserva:", error);
    }
  };

  useEffect(() => {
    getreservations();
  }, []);

  const getStateColor = (state: string) => {
    const variants: Record<string, string> = {
      PENDING: "bg-warning",
      CONFIRMED: "bg-primary",
      CANCELED: "bg-danger",
      COMPLETED: "bg-success",
      IN_PROGRESS: "bg-info",
    };
    return variants[state] || "bg-light";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center align-items-center">
        <Spinner animation="border" variant="primary" />
        <h5 className="fw-medium text-secondary">Cargando...</h5>
        <p className="text-muted small">Por favor, espera un momento.</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Stack
        direction="horizontal"
        gap={3}
        className="mb-4 pb-3 border-bottom align-items-center"
      >
        <div>
          <h1 className="fs-3 fw-bold text-primary">Reservas</h1>
          <p className="text-muted m-0">
            Gestión y edición de las reservas creadas.
          </p>
        </div>
      </Stack>

      <Table bordered hover responsive className="align-middle">
        <thead className="table-light">
          <tr>
            <th>ID Reserva</th>
            <th>Usuario (Email)</th>
            <th>ID Paquete</th>
            <th>Paquete</th>
            <th>Monto</th>
            <th className="text-center">Pasajeros</th>
            <th className="text-center">Estado</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservations.length <= 0 && (
            <tr>
              <td colSpan={7} className="text-center py-4">
                No hay reservas registradas.
              </td>
            </tr>
          )}

          {reservations.map((reservation) => (
            <tr key={reservation.id}>
              <td className="text-muted">#{reservation.id}</td>
              <td className="fw-medium">{reservation.userEmail}</td>
              <td className="text-muted">#{reservation.tourPackageId}</td>
              <td className="fw-medium">{reservation.tourPackageName}</td>
              <td className="fw-bold text-success">
                {formatCurrency(reservation.price)}
              </td>
              <td className="text-center">{reservation.passengersAmount}</td>
              <td className="text-center">
                <Badge
                  className={`fw-semibold ${getStateColor(reservation.reservationState)}`}
                >
                  {reservation.reservationState}
                </Badge>
              </td>
              <td>
                <Stack
                  className="justify-content-center"
                  direction="horizontal"
                  gap={2}
                >
                  <Button
                    as={Link as any}
                    to={`/tour-packages/reservation/${reservation.tourPackageId}/${reservation.id}`}
                    className="fw-semibold w-50"
                    variant="primary"
                    size="sm"
                  >
                    Editar
                  </Button>
                  <Button
                    className="fw-semibold w-50"
                    variant="danger"
                    size="sm"
                    onClick={() => setIdToDelete(reservation.id)}
                  >
                    Eliminar
                  </Button>
                </Stack>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={idToDelete !== null} onHide={() => setIdToDelete(null)}>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-center">Eliminar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar la reserva con ID:{" "}
          <strong>#{idToDelete}</strong>? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="fw-bold btn-secondary"
            onClick={() => setIdToDelete(null)}
          >
            Cancelar
          </Button>
          <Button className="fw-bold btn-danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ReservationsAdminPage;
