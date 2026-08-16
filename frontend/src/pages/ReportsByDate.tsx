import { useState } from "react";
import {
  Badge,
  Button,
  Col,
  Container,
  Form,
  Row,
  Spinner,
  Stack,
  Table,
} from "react-bootstrap";
import reservationService from "../services/reservation.service";
import type { Reservation } from "../interfaces/reservation.interface";
import formatCurrency from "../utils/formatUtils";
import { getReservationStateWord, getStateColor } from "../utils/colorUtils";
import { ErrorResponseModal } from "../components/ErrorResponseModal";

function ReportsByDate() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [showError, setShowError] = useState<boolean>(false);
  const [apiError, setApiError] = useState<unknown>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [reservations, setReservations] = useState<Reservation[]>([]);

  const handleDateSubmit = async () => {
    if (!startDate || !endDate) {
      alert("Por favor, selecciona ambas fechas.");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      alert("La fecha de término debe ser posterior a la fecha de inicio.");
      return;
    }

    try {
      setLoading(true);
      const response = await reservationService.getDateReports(
        startDate,
        endDate,
      );
      setReservations(response.data);
    } catch (error) {
      console.error("No se ha podido generar el reporte:", error);
      setApiError(error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
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
      <ErrorResponseModal
        show={showError}
        onClose={() => setShowError(false)}
        error={apiError}
      />
      <Stack
        direction="horizontal"
        gap={3}
        className="mb-4 pb-3 border-bottom align-items-center"
      >
        <div>
          <h1 className="fs-3 fw-bold text-primary">Reporte por fechas</h1>
          <p className="text-muted m-0">
            Recopila y procesa la información generada por las distintas
            operaciones realizadas en el sistema.
          </p>
        </div>
      </Stack>
      <Row>
        <Col md={3}>
          <Stack gap={3}>
            <p className="text-primary text-center fs-5 fw-bold mb-3">
              Buscar por fechas
            </p>
            <Form.Group controlId="startDate">
              <Form.Label className="small fw-semibold text-secondary">
                Desde
              </Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="endDate">
              <Form.Label className="small fw-semibold text-secondary">
                Hasta
              </Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Form.Group>
            <Button
              variant="primary"
              onClick={handleDateSubmit}
              className="w-100 fw-bold"
              disabled={!startDate || !endDate}
            >
              Generar Listado
            </Button>
          </Stack>
        </Col>

        <Col>
          {reservations && (
            <Stack>
              <p className="fs-5 text-center fw-semibold text-primary">
                Reporte desde {startDate || "fecha inicio"} hasta{" "}
                {endDate || "fecha término"}
              </p>
              <Table bordered hover responsive className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="text-center">Cliente</th>
                    <th className="text-center">Fecha reserva</th>
                    <th className="text-center">Fecha pago</th>
                    <th className="text-center">Paquete</th>
                    <th className="text-center">Pasajeros</th>
                    <th className="text-center">Monto</th>
                    <th className="text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.length <= 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        No se encontraron reservas.
                      </td>
                    </tr>
                  )}

                  {reservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td className="fw-medium">{reservation.userEmail}</td>
                      <td className="fw-medium text-muted">
                        {reservation.reservationDate.substring(0, 10) +
                          ` (${reservation.reservationDate.substring(11, 19)})`}
                      </td>
                      <td className="fw-medium text-muted">
                        {(reservation.paymentDate?.substring(0, 10) ||
                          "No definida") +
                          ` (${reservation.paymentDate?.substring(11, 19) || ""})`}
                      </td>
                      <td className="fw-medium">
                        {reservation.tourPackageName}
                      </td>
                      <td className="fw-medium text-center">
                        {reservation.passengersAmount}
                      </td>
                      <td className="fw-bold text-success">
                        {formatCurrency(reservation.price)} CLP
                      </td>
                      <td className="text-center">
                        <Badge
                          className={`fw-semibold ${getStateColor(reservation.reservationState)}`}
                        >
                          {getReservationStateWord(
                            reservation.reservationState,
                          )}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Stack>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default ReportsByDate;
