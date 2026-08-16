import { useKeycloak } from "@react-keycloak/web";
import React, { useEffect, useState } from "react";
import tourPackageService from "../services/tourPackage.service";
import { useNavigate, useParams } from "react-router-dom";
import type { Reservation } from "../interfaces/reservation.interface";
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  ListGroup,
  ListGroupItem,
  Modal,
  Row,
  Spinner,
  Stack,
} from "react-bootstrap";
import type { TourPackage } from "../interfaces/tourPackage.interface";
import reservationService from "../services/reservation.service";
import formatCurrency from "../utils/formatUtils";
import { getCategoryColor, getCategoryWord } from "../utils/colorUtils";
import type { DiscountData } from "../interfaces/discountData.interface";
import { ErrorResponseModal } from "../components/ErrorResponseModal";

function ReservationCreationEdition() {
  const { keycloak } = useKeycloak();
  const { id, reservationId } = useParams();
  const navigate = useNavigate();

  const [tourPackage, setTourPackage] = useState<TourPackage>();

  const [loading, setLoading] = useState<boolean>(true);
  const [showError, setShowError] = useState<boolean>(false);
  const [apiError, setApiError] = useState<unknown>(null);
  const [show, setShow] = useState(false);

  const [passengersAmount, setPassengersAmount] = useState<number>(1);
  const [originalPassengers, setOriginalPassengers] = useState<number>(0);

  const [preferences, setPreferences] = useState<string[]>([]);
  const [specialRequests, setSpecialRequests] = useState<string[]>([]);
  const [reservationState, setReservationState] = useState<string>("PENDING");
  const [discountsData, setDiscountsData] = useState<DiscountData>();

  const getData = async () => {
    try {
      setLoading(true);
      const responseTourPackage = await tourPackageService.getById(Number(id));
      setTourPackage(responseTourPackage.data);
      var passengers = 1;
      if (reservationId) {
        const responseReservation = await reservationService.getById(
          Number(reservationId),
        );
        const responseReservationData: Reservation = responseReservation.data;
        passengers = responseReservationData.passengersAmount;
        setPassengersAmount(passengers);
        setOriginalPassengers(passengers);
        setPreferences(responseReservationData.preferences);
        setSpecialRequests(responseReservationData.specialRequests);
        setReservationState(responseReservationData.reservationState);
      }
      await getPrice(passengers);
    } catch (error) {
      console.error("No se pudieron cargar los datos:", error);
      setApiError(error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const getPrice = async (passengers: number) => {
    const reservationData: Partial<Reservation> = {
      userEmail: keycloak.tokenParsed?.email || "",
      tourPackageId: Number(id),
      passengersAmount: passengers,
    };
    try {
      const priceResponse = await reservationService.calculatePrice(
        reservationData as Reservation,
      );
      setDiscountsData(priceResponse.data);
      console.log(discountsData);
    } catch (error) {
      console.error("Error cargando el monto final:", error);
      setApiError(error);
      setShowError(true);
    }
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!passengersAmount || passengersAmount <= 0) {
      alert("Por favor, ingresa una cantidad válida de pasajeros");
      return;
    }

    const reservationData: Partial<Reservation> = {
      ...(reservationId && { id: Number(reservationId) }),
      userEmail: keycloak.tokenParsed?.email || "",
      tourPackageId: Number(id),
      passengersAmount: passengersAmount,
      preferences: preferences.length > 0 ? preferences : ["Sin preferencias"],
      specialRequests:
        specialRequests.length > 0 ? specialRequests : ["Sin solicitudes"],
      reservationState: reservationState,
    };

    try {
      setLoading(true);
      if (reservationId) {
        await reservationService.update(reservationData as Reservation);
      } else {
        await reservationService.create(reservationData as Reservation);
      }
      setShow(true);
    } catch (error) {
      console.error("Error en la transacción:", error);
      setApiError(error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
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
    <Container className="align-items-center justify-content-center mt-4">
      <ErrorResponseModal
        show={showError}
        onClose={() => setShowError(false)}
        error={apiError}
      />
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {reservationId ? "Reserva editada" : "Reserva creada"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reservationId
            ? "Se ha editado correctamente la reserva."
            : "Se ha creado correctamente la reserva."}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => {
              reservationId
                ? navigate("/reservations-admin")
                : navigate("/reservations");
            }}
          >
            Aceptar
          </Button>
        </Modal.Footer>
      </Modal>
      <Stack
        direction="horizontal"
        gap={3}
        className="mb-4 pb-3 border-bottom align-items-center"
      >
        <div>
          <h1 className="fs-3 fw-bold text-primary">
            {reservationId ? "Editar reserva" : "Crear reserva"}
          </h1>
          <p className="text-muted m-0">
            Asigna la cantidad de pasajeros y tus preferencias.
          </p>
        </div>
        <Button
          variant="outline-danger"
          className="ms-auto fw-bold"
          onClick={() => navigate(-1)}
        >
          Cancelar
        </Button>
      </Stack>
      <Row>
        <Col lg={5}>
          <Card className="border-1 bg-light mb-3">
            <Card.Body className="p-4">
              <Card.Title className="fw-bold text-center">
                Información del Paquete
              </Card.Title>
              <hr></hr>
              <Stack className="bg-light rounded">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold">Precio unitario del paquete</span>
                  <span className="fs-5 fw-bold text-dark">
                    {formatCurrency(Number(tourPackage?.price))} CLP
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Disponibilidad</span>
                  <span className="text-primary fw-bold">
                    {tourPackage?.remainingSpots} cupos libres
                  </span>
                </div>
              </Stack>
              <hr></hr>
              <Stack>
                <Stack>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted uppercase fw-bold">Nombre</span>
                    <span className="fw-bold text-dark">
                      {tourPackage?.name}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted uppercase fw-bold">
                      Destino
                    </span>
                    <span className="fw-medium">{tourPackage?.destiny}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted uppercase fw-bold">
                      Duración
                    </span>
                    <span>{tourPackage?.duration}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted uppercase fw-bold">
                      Categoría
                    </span>
                    <Badge
                      className={`fw-semibold ${getCategoryColor(tourPackage?.category ? tourPackage?.category : "")}`}
                    >
                      {tourPackage
                        ? getCategoryWord(tourPackage.category)
                        : "No Definida"}
                    </Badge>
                  </div>
                </Stack>
                <hr></hr>
                <Stack>
                  <Row className="mb-3">
                    <Col>
                      <span className="text-muted text-center fw-bold d-block mb-2">
                        Servicios incluidos
                      </span>
                      <ListGroup>
                        {tourPackage?.services.map((s, index) => (
                          <ListGroupItem key={index}>{s}</ListGroupItem>
                        ))}
                      </ListGroup>
                    </Col>
                  </Row>
                  <hr></hr>
                  <Row>
                    <Col>
                      <span className="text-muted fw-bold mb-2">
                        Condiciones
                      </span>
                      <div>
                        {tourPackage?.conditions.map((c, index) => (
                          <p className="text-secondary mb-2" key={index}>
                            {c}
                          </p>
                        ))}
                      </div>
                    </Col>
                    <Col>
                      <span className="text-muted fw-bold mb-2">
                        Restricciones
                      </span>
                      <div>
                        {tourPackage?.restrictions.map((r, index) => (
                          <p className="text-secondary mb-2" key={index}>
                            {r}
                          </p>
                        ))}
                      </div>
                    </Col>
                  </Row>
                </Stack>
              </Stack>
            </Card.Body>
          </Card>
        </Col>
        <Col className="mb-4">
          <Stack>
            <p className="fs-4 text-center text-primary fw-semibold">
              Detalles
            </p>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Preferencias</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ej: Ventanilla, Vegetariano"
                      value={preferences.join(", ")}
                      onChange={(e) =>
                        setPreferences(
                          e.target.value.split(",").map((s) => s.trimStart()),
                        )
                      }
                      onBlur={() =>
                        setPreferences((prev) =>
                          prev.map((s) => s.trim()).filter(Boolean),
                        )
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">
                      Solicitudes Especiales
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Alguna necesidad adicional..."
                      value={specialRequests.join(", ")}
                      onChange={(e) =>
                        setSpecialRequests(
                          e.target.value.split(",").map((s) => s.trimStart()),
                        )
                      }
                      onBlur={() =>
                        setSpecialRequests((prev) =>
                          prev.map((s) => s.trim()).filter(Boolean),
                        )
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">
                      Cantidad de pasajeros
                    </Form.Label>
                    <Form.Select
                      value={passengersAmount}
                      onChange={(e) => {
                        const selectedAmount = Number(e.target.value);
                        setPassengersAmount(selectedAmount);
                        getPrice(selectedAmount);
                      }}
                      disabled={!tourPackage}
                    >
                      {(() => {
                        if (!tourPackage)
                          return <option value="0">Cargando...</option>;

                        const maxAvailable =
                          (tourPackage.remainingSpots || 0) +
                          originalPassengers;

                        if (maxAvailable === 0) {
                          return (
                            <option value="0">No hay cupos disponibles</option>
                          );
                        }

                        return Array.from(
                          { length: maxAvailable },
                          (_, i) => i + 1,
                        ).map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? "pasajero" : "pasajeros"}
                          </option>
                        ));
                      })()}
                    </Form.Select>
                  </Form.Group>
                </Col>
                {reservationId && (
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">
                        Estado de la reserva
                      </Form.Label>
                      <Form.Select
                        value={reservationState}
                        onChange={(e) => setReservationState(e.target.value)}
                      >
                        <option value="PENDING">Pendiente</option>
                        <option value="CONFIRMED">Confirmado</option>
                        <option value="IN_PROGRESS">En Progreso</option>
                        <option value="COMPLETED">Completado</option>
                        <option value="CANCELED">Cancelado</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                )}
              </Row>
              <hr></hr>
              <Row>
                <Stack gap={2}>
                  <p className="fs-4 text-center text-primary fw-semibold">
                    Pago
                  </p>
                  <Stack>
                    <Stack className="text-muted fw-medium">
                      <p className="mb-1">
                        Importe total sin descuentos:{" "}
                        {formatCurrency(
                          Number(discountsData?.totalAmountWithoutDiscounts),
                        )} CLP
                      </p>

                      {discountsData &&
                        discountsData.passengersDiscount > 0 && (
                          <p className="mb-1">
                            Descuento en función del número de pasajeros:{" "}
                            {formatCurrency(
                              Number(discountsData?.passengersDiscount),
                            )} CLP
                          </p>
                        )}

                      {discountsData &&
                        discountsData.frequentClientDiscount > 0 && (
                          <p className="mb-1">
                            Descuento para clientes frecuentes:{" "}
                            {formatCurrency(
                              Number(discountsData?.frequentClientDiscount),
                            )} CLP
                          </p>
                        )}

                      {discountsData &&
                        discountsData.multiplePackagesDiscount > 0 && (
                          <p className="mb-1">
                            Descuento por compras múltiples:{" "}
                            {formatCurrency(
                              Number(discountsData?.multiplePackagesDiscount),
                            )} CLP
                          </p>
                        )}

                      {discountsData && discountsData.promotionDiscount > 0 && (
                        <p className="mb-1">
                          Promociones aplicadas:{" "}
                          {formatCurrency(
                            Number(discountsData?.promotionDiscount),
                          )} CLP
                        </p>
                      )}

                      {discountsData?.maxDiscount ? (
                        <p className="mb-1 fw-semibold">
                          Descuentos totales aplicados (máximo de descuentos):{" "}
                          {formatCurrency(
                            Number(discountsData?.discountAmount),
                          )} CLP
                        </p>
                      ) : (
                        <p className="mb-1 text-decoration-underline">
                          Descuentos totales aplicados:{" "}
                          {formatCurrency(
                            Number(discountsData?.discountAmount),
                          )} CLP
                        </p>
                      )}

                      <p className="fw-bold fs-5 text-primary mb-3">
                        Importe final:{" "}
                        {formatCurrency(Number(discountsData?.totalAmount))} CLP
                      </p>
                    </Stack>
                  </Stack>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 size-lg fw-semibold py-2"
                  >
                    Confirmar Reserva
                  </Button>
                </Stack>
              </Row>
            </Form>
          </Stack>
          <Row></Row>
        </Col>
      </Row>
    </Container>
  );
}

export default ReservationCreationEdition;