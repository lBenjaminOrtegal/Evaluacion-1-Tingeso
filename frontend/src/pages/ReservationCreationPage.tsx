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

function ReservationCreationPage() {
  const { keycloak } = useKeycloak();
  const { id, reservationId } = useParams();
  const navigate = useNavigate();

  const [tourPackage, setTourPackage] = useState<TourPackage>();

  const [loading, setLoading] = useState<boolean>(true);
  const [show, setShow] = useState(false);

  const [passengersAmount, setPassengersAmount] = useState<number>(1);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [specialRequests, setSpecialRequests] = useState<string[]>([]);
  const [reservationState, setReservationState] = useState<string>("PENDING");
  const [discounts, setDiscounts] = useState<any>();

  const getCategoryColor = (category: string) => {
    const variants: Record<string, string> = {
      LOW_COST: "bg-success",
      STANDARD: "bg-primary",
      PREMIUM: "bg-dark",
    };
    return variants[category] || "bg-light";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount);
  };

  const getData = async () => {
    try {
      setLoading(true);
      const responseTourPackage = await tourPackageService.getById(Number(id));
      setTourPackage(responseTourPackage.data);
      if (reservationId) {
        const responseReservation = await reservationService.getById(
          Number(reservationId),
        );
        const responseReservationData: Reservation = responseReservation.data;
        setPassengersAmount(responseReservationData.passengersAmount);
        setPreferences(responseReservationData.preferences);
        setSpecialRequests(responseReservationData.specialRequests);
        setReservationState(responseReservationData.reservationState);
      }
    } catch (error) {
      console.error("No se pudieron cargar los datos:", error);
    } finally {
      setLoading(false);
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

  if (tourPackage?.tourPackageState !== "AVAILABLE") {
    return (
      <Stack gap={3} className="mb-4 py-4 align-items-center text-center">
        <div>
          <h1 className="fs-3 fw-bold text-danger">Acción no disponible</h1>
          <p className="text-muted m-0">
            No se puede realizar la reserva porque el paquete seleccionado no
            está disponible.
          </p>
          <Button
            variant="link"
            className="ms-auto fw-bold text-decoration-none"
            onClick={() => navigate("/tour-packages")}
          >
            Haz click aquí para regresar a los paquetes disponibles.
          </Button>
        </div>
      </Stack>
    );
  }

  return (
    <Container className="align-items-center justify-content-center mt-4">
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
                    {formatCurrency(Number(tourPackage?.price))}
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
                      {tourPackage?.category}
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
        <Col>
          <Stack>
            <p className="fs-4 text-center text-primary fw-semibold">
              Detalles
            </p>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">
                      Preferencias (separadas por coma)
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ej: Ventanilla, Vegetariano"
                      value={preferences}
                      onChange={(e) => {
                        setPreferences(e.target.value.split(","));
                      }}
                      onBlur={() => {
                        setPreferences((prev) =>
                          prev.map((s) => s.trim()).filter((s) => s !== ""),
                        );
                      }}
                    />
                  </Form.Group>
                </Col>

                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">
                      Solicitudes (separadas por coma)
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Alguna necesidad adicional..."
                      value={specialRequests}
                      onChange={(e) => {
                        setSpecialRequests(e.target.value.split(","));
                      }}
                      onBlur={() => {
                        setSpecialRequests((prev) =>
                          prev.map((s) => s.trim()).filter((s) => s !== ""),
                        );
                      }}
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
                      onChange={(e) =>
                        setPassengersAmount(Number(e.target.value))
                      }
                      disabled={
                        !tourPackage ||
                        (tourPackage.remainingSpots === 0 && !reservationId)
                      }
                    >
                      {tourPackage?.remainingSpots === 0 && !reservationId && (
                        <option value="0">No hay cupos disponibles</option>
                      )}

                      {(() => {
                        if (!tourPackage)
                          return <option value="0">Cargando...</option>;

                        const maxAvailable = reservationId
                          ? tourPackage.remainingSpots + (passengersAmount || 0)
                          : tourPackage.remainingSpots;

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
                        <option value="PENDINGs">Pendiente</option>
                        <option value="CONFIRMED">Confirmado</option>
                        <option value="CANCELED">Cancelado</option>
                        <option value="COMPLETED">Completado</option>
                        <option value="IN_PROGRESS">En Progreso</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                )}
              </Row>
              <Button
                type="submit"
                variant="primary"
                className="w-100 size-lg fw-semibold"
              >
                Confirmar Reserva
              </Button>
            </Form>
          </Stack>
          <hr></hr>
          <Row>
            <Stack>
              <p className="fs-4 text-center text-primary fw-semibold">
                Descuentos
              </p>
              <p>Descuento por cantidad de personas: </p>
              <p>Descuento por cliente frecuente: </p>
              <p>Descuento por compra de múltiples paquetes: </p>
              <p>Acumulación y límites de descuentos: </p>
              <p>Promociones por tiempo limitado: </p>
              <p>Monto final: </p>
            </Stack>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default ReservationCreationPage;
