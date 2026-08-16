import { useState } from "react";
import {
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
import { ErrorResponseModal } from "../components/ErrorResponseModal";

function ReportsBySales() {
  const [startDateSales, setStartDateSales] = useState<string>("");
  const [endDateSales, setEndDateSales] = useState<string>("");
  const [order, setOrder] = useState<number>(1);
  const [type, setType] = useState<string>("");

  const [showError, setShowError] = useState<boolean>(false);
  const [apiError, setApiError] = useState<unknown>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
          <h1 className="fs-3 fw-bold text-primary">Reporte de ventas</h1>
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
              Ranking de Ventas
            </p>
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

            <Button
              variant="primary"
              onClick={handleSalesSubmit}
              className="w-100 fw-bold"
              disabled={!startDateSales || !endDateSales}
            >
              Generar Ranking
            </Button>
          </Stack>
        </Col>
        <Col>
          {ranking && (
            <Stack>
              <p className="fs-5 text-center fw-semibold text-primary">
                Reporte desde {startDateSales || "fecha inicio"} hasta{" "}
                {endDateSales || "fecha término"}
              </p>

              {ranking.map((group) => {
                const packageName =
                  group.length > 0 ? group[0].tourPackageName : "Sin paquetes";
                const packageId =
                  group.length > 0 ? group[0].tourPackageId : "";
                return (
                  <Stack
                    key={packageId}
                    className="border border-secondary-subtle rounded p-3 mb-4"
                  >
                    <Row className="align-items-center mb-2">
                      <Col md={4}>
                        <p className="fs-5 fw-semibold text-dark mb-0">
                          #{packageId}: {packageName}
                        </p>
                      </Col>

                      <Col md={2}>
                        <p className="text-muted fw-medium small mb-0">
                          Reservas:{" "}
                          <span className="fw-bold">{group.length}</span>
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

                      <Col md={3}>
                        <p className="text-muted fw-medium small mb-0">
                          Total:{" "}
                          <span className="text-success fw-bold">
                            {formatCurrency(
                              group.reduce((acc, curr) => acc + curr.price, 0),
                            )}{" "}
                            CLP
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
                              {formatCurrency(reservation.price)} CLP
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
        </Col>
      </Row>
    </Container>
  );
}

export default ReportsBySales;
