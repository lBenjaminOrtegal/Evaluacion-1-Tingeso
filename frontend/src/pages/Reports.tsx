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

function ReportsPage() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [startDateSales, setStartDateSales] = useState<string>("");
  const [endDateSales, setEndDateSales] = useState<string>("");
  const [order, setOrder] = useState<number>(0);
  const [type, setType] = useState<string>("");

  const [showError, setShowError] = useState<boolean>(false);
  const [apiError, setApiError] = useState<unknown>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [ranking, setRanking] = useState<Reservation[][]>([[]]);

  const handleSalesSubmit = async () => {
    if (!startDateSales || !endDateSales) {
      alert("Por favor, selecciona ambas fechas.");
      return;
    }

    if (new Date(startDateSales) >= new Date(endDateSales)) {
      alert("La fecha de término debe ser posterior a la fecha de inicio.");
      return;
    }

    try {
      setLoading(true);
      const response = await reservationService.getRanking(
        startDateSales,
        endDateSales,
        order,
        type,
      );
      setRanking(response.data);
    } catch (error) {
      console.error("No se ha podido generar el reporte:", error);
      setApiError(error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="fs-3 fw-bold text-primary">Reportes</h1>
          <p className="text-muted m-0">
            Recopila y procesa la información generada por las distintas
            operaciones realizadas en el sistema.
          </p>
        </div>
      </Stack>
      <Stack className="p-4">
        <p className="text-primary text-center fs-5 fw-bold mb-3">
          Reporte por Fechas
        </p>
        <Row className="g-2">
          <Col md={6}>
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
          </Col>
          <Col md={6}>
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
          </Col>
          <Col className="mt-3">
            <Button
              variant="primary"
              onClick={handleDateSubmit}
              className="w-100 fw-bold"
              disabled={!startDate || !endDate}
            >
              Generar Listado
            </Button>
          </Col>
        </Row>
      </Stack>
      <hr></hr>
      {reservations && reservations.length >= 0 && (
        <Stack className="mt-4">
          <p className="fs-6 text-center fw-semibold text-dark">
            Reporte de fechas de {startDate || "fecha inicio"} a{" "}
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
                  <td className="fw-medium">{reservation.tourPackageName}</td>
                  <td className="fw-medium text-center">
                    {reservation.passengersAmount}
                  </td>
                  <td className="fw-bold text-success">
                    {formatCurrency(reservation.price)}
                  </td>
                  <td className="text-center">
                    <Badge
                      className={`fw-semibold ${getStateColor(reservation.reservationState)}`}
                    >
                      {getReservationStateWord(reservation.reservationState)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Stack>
      )}
      <hr></hr>
      <Stack className="p-4">
        <p className="text-primary text-center fs-5 fw-bold mb-3">
          Ranking de Ventas
        </p>
        <Row className="g-2">
          <Col md={3}>
            <Form.Group controlId="startDateSales">
              <Form.Label className="small fw-semibold text-secondary">
                Desde
              </Form.Label>
              <Form.Control
                type="date"
                value={startDateSales}
                onChange={(e) => setStartDateSales(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="endDateSales">
              <Form.Label className="small fw-semibold text-secondary">
                Hasta
              </Form.Label>
              <Form.Control
                type="date"
                value={endDateSales}
                onChange={(e) => setEndDateSales(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold text-secondary">
                Métrica
              </Form.Label>
              <Form.Select
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="reservations">Reservas</option>
                <option value="passengers">Pasajeros</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold text-secondary">
                Orden
              </Form.Label>
              <Form.Select
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
              >
                <option value="0">Ascendente</option>
                <option value="1">Descendente</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col className="mt-3">
            <Button
              variant="primary"
              onClick={handleSalesSubmit}
              className="w-100 fw-bold"
              disabled={!startDateSales || !endDateSales}
            >
              Generar Ranking
            </Button>
          </Col>
        </Row>
      </Stack>
      {ranking && ranking.length >= 0 && (
        <Stack className="mt-4">
          <p className="fs-6 text-center fw-semibold text-dark">
            Reporte de ventas de {startDateSales || "fecha inicio"} a{" "}
            {endDateSales || "fecha término"}
          </p>

          {ranking.map((group, index) => {
            const packageName =
              group.length > 0 ? group[0].tourPackageName : "Sin paquetes";
            const packageId = group.length > 0 ? group[0].tourPackageId : "";
            return (
              <Stack
                key={index}
                className="border border-secondary-subtle rounded p-3 mb-4"
              >
                <Row className="align-items-center mb-2">
                  <Col md={6}>
                    <p className="fs-5 fw-semibold text-dark mb-0">
                      #{packageId}: {packageName}
                    </p>
                  </Col>

                  <Col md={2}>
                    <p className="text-muted fw-medium small mb-0">
                      Reservas: <span className="fw-bold">{group.length}</span>
                    </p>
                  </Col>

                  <Col md={2}>
                    <p className="text-muted fw-medium small mb-0">
                      Pasajeros:{" "}
                      <span className="fw-bold">
                        {group.reduce(
                          (acc, curr) => acc + curr.passengersAmount,
                          0,
                        )}
                      </span>
                    </p>
                  </Col>

                  <Col md={2}>
                    <p className="text-muted fw-medium small mb-0">
                      Total:{" "}
                      <span className="text-success fw-bold">
                        {formatCurrency(
                          group.reduce((acc, curr) => acc + curr.price, 0),
                        )}
                      </span>
                    </p>
                  </Col>
                </Row>

                <Table bordered hover responsive className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="text-center">ID Reserva</th>
                      <th className="text-center">Pasajeros</th>
                      <th className="text-center">Monto Individual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.map((reservation) => (
                      <tr key={reservation.id}>
                        <td className="fw-medium text-center">
                          {reservation.id}
                        </td>
                        <td className="fw-medium text-center">
                          {reservation.passengersAmount}
                        </td>
                        <td className="fw-bold text-success text-center">
                          {formatCurrency(reservation.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Stack>
            );
          })}
        </Stack>
      )}
    </Container>
  );
}

export default ReportsPage;
