import { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Modal,
  Row,
  Spinner,
  Stack,
} from "react-bootstrap";
import reservationService from "../services/reservation.service";
import type { Reservation } from "../interfaces/reservation.interface";
import { Link } from "react-router-dom";
import tourPackageService from "../services/tourPackage.service";
import type { TourPackage } from "../interfaces/tourPackage.interface";
import formatCurrency from "../utils/formatUtils";
import { getCategoryColor, getStateColor } from "../utils/colorUtils";

function ReservationsViewPage() {
  const { keycloak } = useKeycloak();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation>();
  const [tourPackage, setTourPackage] = useState<TourPackage>();

  const [show, setShow] = useState<boolean>();
  const [showCancel, setShowCancel] = useState<boolean>();
  const [loading, setLoading] = useState<boolean>(false);

  const handleShow = (reservation: Reservation) => {
    setShow(true);
    setSelectedReservation(reservation);
    getTourPackage(reservation.tourPackageId);
  };

  const handleCancelShow = (reservation: Reservation) => {
    setShowCancel(true);
    setSelectedReservation(reservation);
  };

  const getReservations = async () => {
    if (!keycloak.authenticated) {
      return;
    }
    const email: string = keycloak.tokenParsed?.email;
    try {
      setLoading(true);
      const response = await reservationService.getByEmail(email);
      setReservations(response.data);
    } catch (error) {
      console.error("Error cargando reservas:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTourPackage = async (id: number) => {
    try {
      setLoading(true);
      const response = await tourPackageService.getById(id);
      setTourPackage(response.data);
    } catch (error) {
      console.error("Error cargando paquete túristico:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedReservation) {
      return;
    }
    const updatedReservation = {
      ...selectedReservation,
      reservationState: "CANCELED",
    };
    try {
      setLoading(true);
      await reservationService.update(updatedReservation);
      getReservations();
    } catch (error) {
      console.error("Error cancelando la reserva:", error);
    } finally {
      setShowCancel(false);
      setLoading(false);
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
    <Container className="mt-4">
      <Modal show={showCancel} onHide={() => setShowCancel(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-center">
            Cancelar reserva
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas cancelar la reserva? Esta acción no se
          puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="fw-bold btn-secondary"
            onClick={() => setShowCancel(false)}
          >
            Atrás
          </Button>
          <Button className="fw-bold btn-danger" onClick={handleCancel}>
            Cancelar Reserva
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        size="lg"
        centered
        show={show}
        onHide={() => setShow(false)}
        contentClassName="shadow-lg border-0"
      >
        {tourPackage && (
          <>
            <Modal.Header closeButton className="bg-light border-0 py-3">
              <div>
                <Modal.Title className="fw-bold fs-3 mb-0 text-dark">
                  {selectedReservation?.tourPackageName}
                </Modal.Title>
                <small className="text-secondary fw-semibold">
                  <span className="">
                    Email: {selectedReservation?.userEmail}
                  </span>
                </small>
              </div>
            </Modal.Header>

            <Modal.Body className="px-4 py-4">
              <Row className="g-4">
                <Col md={7}>
                  <section className="mb-4">
                    <h6 className="text-uppercase text-primary fw-bold small mb-2">
                      Detalles de la reserva
                    </h6>
                    <p className="fw-medium small text-muted">
                      Número de la reserva: #
                      {selectedReservation?.tourPackageId}
                    </p>
                    <p className="fw-medium small text-muted">
                      Realizada el:{" "}
                      {selectedReservation?.reservationDate.substring(0, 10) +
                        " (" +
                        selectedReservation?.reservationDate.substring(11, 19) +
                        ")"}
                    </p>
                    <p className="fw-medium small text-muted">
                      Fecha de pago:{" "}
                      {selectedReservation?.paymentDate
                        ? selectedReservation?.paymentDate.substring(0, 10) +
                          " (" +
                          selectedReservation?.paymentDate.substring(11, 19) +
                          ")"
                        : "Pendiente"}
                    </p>
                    <p className="fw-medium small text-muted">
                      Destino: {tourPackage.destiny}
                    </p>
                  </section>

                  <Row className="g-3 mb-4">
                    <Col xs={6}>
                      <div className="p-3 border rounded-3 bg-light-subtle">
                        <h6 className="small text-muted mb-1">Duración</h6>
                        <p className="fw-bold mb-0">{tourPackage.duration}</p>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="p-3 border rounded-3 bg-light-subtle">
                        <h6 className="small text-muted mb-1">Categoría</h6>
                        <Badge
                          className={`fw-semibold ${getCategoryColor(tourPackage.category)}`}
                        >
                          {tourPackage.category}
                        </Badge>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="p-3 border rounded-3 bg-light-subtle">
                        <h6 className="small text-muted mb-1">Monto</h6>
                        <p className="fw-bold mb-0 text-success">
                          {formatCurrency(Number(selectedReservation?.price))}
                        </p>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="p-3 border rounded-3 bg-light-subtle">
                        <h6 className="small text-muted mb-1">Estado</h6>
                        <Badge
                          className={`${selectedReservation ? getStateColor(selectedReservation.reservationState) : "bg-primary"}`}
                        >
                          {selectedReservation?.reservationState}
                        </Badge>
                      </div>
                    </Col>
                  </Row>
                </Col>

                <Col md={5} className="border-start ps-md-4">
                  <div className="mb-4">
                    <h6 className="text-uppercase text-primary fw-bold small mb-2">
                      Cantidad de personas
                    </h6>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted small fw-medium">
                        {selectedReservation?.passengersAmount} pasajeros
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="text-uppercase text-primary fw-bold small mb-2">
                      Periodo del Paquete
                    </h6>
                    <p className="small mb-1 text-muted">
                      Del <strong>{tourPackage.startDate}</strong> al{" "}
                      <strong>{tourPackage.endDate}</strong>
                    </p>
                  </div>

                  <section>
                    <h6 className="text-uppercase text-primary fw-bold small mb-2">
                      Información adicional
                    </h6>
                    <div className="small text-muted overflow-auto">
                      <p className="mb-1">
                        <strong>Preferencias</strong>{" "}
                      </p>
                      <ol>
                        {selectedReservation?.preferences.map((p, index) => (
                          <li key={index}>{p}</li>
                        ))}
                      </ol>
                      <p className="mb-0">
                        <strong>Solicitudes</strong>{" "}
                      </p>
                      <ol>
                        {selectedReservation?.specialRequests.map(
                          (p, index) => (
                            <li key={index}>{p}</li>
                          ),
                        )}
                      </ol>
                      <p className="mb-0">
                        <strong>Servicios contratados</strong>{" "}
                      </p>
                      <ol>
                        {tourPackage?.services.map((s, index) => (
                          <li key={index}>{s}</li>
                        ))}
                      </ol>
                    </div>
                  </section>
                </Col>
              </Row>
            </Modal.Body>
          </>
        )}
      </Modal>

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
          <p className="text-muted mb-0">No hay reservas registradas</p>
          <Button
            as={Link as any}
            to="/tour-packages"
            variant="link"
            className="text-decoration-none"
          >
            Haz click aquí para ver el catálogo
          </Button>
        </div>
      )}

      {reservations.map((reservation) => (
        <Card
          key={reservation.id}
          className={`border-1 mb-4 overflow-hidden ${reservation.reservationState === "CANCELED" ? "opacity-50" : ""}`}
        >
          <Card.Header className="bg-white border-bottom-0 pt-3">
            <Stack
              direction="horizontal"
              className="justify-content-between align-items-center"
            >
              <Badge
                className={`px-3 py-2 fw-semibold ${getStateColor(reservation.reservationState)}`}
              >
                {reservation.reservationState}
              </Badge>

              <Button
                onClick={() => handleShow(reservation)}
                variant="link"
                className="text-muted fw-medium fs-6"
              >
                Ver más detalles
              </Button>

              <span className="fw-bold fs-5 text-success">
                {formatCurrency(reservation.price)}
              </span>
            </Stack>
          </Card.Header>

          <Card.Body>
            <Card.Title className="fs-4 fw-bold mb-1">
              {reservation.tourPackageName}
            </Card.Title>
            <Card.Subtitle className="text-muted mb-3">
              ID de Reserva: #{reservation.id} • {reservation.userEmail}
            </Card.Subtitle>

            <Row className="mb-3 g-2">
              <Col xs={6} md={4}>
                <div className="fw-medium text-muted"> Realizada el:</div>
                <div className="fs-5 fw-medium">
                  {reservation.reservationDate.substring(0, 10)} (
                  {reservation.reservationDate.substring(11, 19)})
                </div>
              </Col>
              <Col xs={6} md={4}>
                <div className="fw-medium text-muted">Pasajeros:</div>
                <div className="fs-5 fw-medium">
                  {reservation.passengersAmount} personas
                </div>
              </Col>
              <Col xs={12} md={4}>
                <div className="fw-medium text-muted">Pago:</div>
                <div className="fs-5 fw-medium">
                  {reservation.paymentDate
                    ? reservation.paymentDate.substring(0, 10) +
                      " (" +
                      reservation.paymentDate.substring(11, 19) +
                      ")"
                    : "Pendiente"}
                </div>
              </Col>
            </Row>
          </Card.Body>

          {reservation.reservationState !== "CANCELED" &&
            reservation.reservationState !== "COMPLETED" && (
              <Card.Footer className="bg-white border-top-0 pb-3">
                <Stack direction="horizontal" gap={2}>
                  <Button
                    variant="outline-danger"
                    className="w-25 fw-semibold"
                    onClick={() => handleCancelShow(reservation)}
                  >
                    Cancelar reserva
                  </Button>

                  {reservation.reservationState === "PENDING" && (
                    <Button
                      as={Link as any}
                      variant="primary"
                      className="w-75 fw-bold"
                      to={`/reservations/payment/${reservation.id}`}
                    >
                      Pagar Ahora
                    </Button>
                  )}
                </Stack>
              </Card.Footer>
            )}
        </Card>
      ))}
    </Container>
  );
}

export default ReservationsViewPage;
