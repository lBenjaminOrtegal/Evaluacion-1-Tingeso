import { useKeycloak } from "@react-keycloak/web";
import React, { useEffect, useState } from "react";
import tourPackageService from "../services/tourPackage.service";
import { useParams } from "react-router-dom";
import type { Reservation } from "../interfaces/reservation.interface";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  ListGroup,
  Row,
  Stack,
} from "react-bootstrap";
import type { TourPackage } from "../interfaces/tourPackage.interface";
import reservationService from "../services/reservation.service";

function ReservationCreationPage() {
  const [tourPackage, setTourPackage] = useState<TourPackage>();
  const { keycloak } = useKeycloak();
  const { id } = useParams();

  const [passengersAmount, setPassengersAmount] = useState<number>(1);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [specialRequests, setSpecialRequests] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();

  const getTourPackage = async () => {
    try {
      const response = await tourPackageService.getById(Number(id));
      setTourPackage(response.data);
    } catch (error) {
      console.error("Error cargando paquete:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passengersAmount || passengersAmount <= 0) {
      alert("Por favor, ingresa una cantidad válida de pasajeros");
      return;
    }

    if (!selectedDate || selectedDate == null) {
      alert("Por favor, ingresa una fecha válida.");
      return;
    }

    const newReservation: Partial<Reservation> = {
      userEmail: keycloak.tokenParsed?.email,
      tourPackageId: Number(id),
      passengersAmount: passengersAmount,
      preferences: preferences,
      specialRequests: specialRequests,
      reservationState: "PENDING",
      selectedDate: selectedDate,
    };

    try {
      await reservationService.create(newReservation as Reservation);
      alert("Reserva creada con éxito");
    } catch (error) {
      console.error("Error al crear la reserva:", error);
    }
  };

  useEffect(() => {
    getTourPackage();
  }, []);

  return (
    <Container className="align-items-center justify-content-center mt-4">
      <Stack
        direction="horizontal"
        gap={3}
        className="mb-4 pb-3 border-bottom align-items-center"
      >
        <div>
          <h1 className="fs-3 fw-bold text-primary">Reservar Tour</h1>
          <p className="text-muted m-0">
            Asigna la cantidad de pasajeros y tus preferencias.
          </p>
        </div>
      </Stack>
      <Row>
        <Col lg={5}>
          <Card className="shadow-sm border-0 bg-light">
            <Card.Body className="p-4">
              <Card.Title className="fw-bold mb-4 text-dark border-bottom pb-2">
                Detalles del Paquete
              </Card.Title>

              <Stack gap={3}>
                <section>
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
                    <span className="text-capitalize">
                      {tourPackage?.category?.toLowerCase()}
                    </span>
                  </div>
                </section>
                <hr></hr>
                <Row>
                  <Col xs={12} className="mb-3">
                    <span className="text-muted uppercase fw-bold d-block mb-2">
                      Servicios incluidos
                    </span>
                    <ul className="list-unstyled ps-0">
                      {tourPackage?.services.map((s, index) => (
                        <li key={index} className="mb-1 text-secondary">
                          + {s}
                        </li>
                      ))}
                    </ul>
                  </Col>

                  <Col xs={12}>
                    <span className="text-muted uppercase fw-bold d-block mb-2">
                      Restricciones
                    </span>
                    <ul className="list-unstyled ps-0">
                      {tourPackage?.restrictions.map((r, index) => (
                        <li key={index} className="mb-1 text-secondary">
                          - {r}
                        </li>
                      ))}
                    </ul>
                  </Col>
                </Row>
                <hr></hr>
                <section className="bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold">Precio Total</span>
                    <span className="fs-5 fw-bold text-dark">
                      ${tourPackage?.price?.toLocaleString()}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Disponibilidad</span>
                    <span className="text-primary fw-bold">
                      {tourPackage?.spots} cupos libres
                    </span>
                  </div>
                </section>
              </Stack>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Stack>
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
                      onChange={(e) =>
                        setPreferences(
                          e.target.value.split(",").map((p) => p.trim()),
                        )
                      }
                    />
                  </Form.Group>

                  <Form.Label className="fw-medium">
                    Seleccione una fecha
                  </Form.Label>
                  {tourPackage && tourPackage.availableDates?.length === 0 && (
                    <div className="text-center p-3 bg-light rounded">
                      <p className="text-muted mb-0">
                        No hay fechas disponibles para este paquete.
                      </p>
                    </div>
                  )}
                  <ListGroup className="mb-3">
                    {tourPackage?.availableDates.map((d, index) => {
                      const dateObject = new Date(d);

                      return (
                        <ListGroup.Item
                          key={index}
                          as="button"
                          type="button"
                          className="fw-medium"
                          active={
                            selectedDate?.getTime() === dateObject.getTime()
                          }
                          onClick={() => setSelectedDate(dateObject)}
                        >
                          {dateObject.toLocaleDateString()}
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                </Col>

                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">
                      Peticiones (separadas por coma)
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Alguna necesidad adicional..."
                      onChange={(e) =>
                        setSpecialRequests(
                          e.target.value.split(",").map((s) => s.trim()),
                        )
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">
                      Cantidad de pasajeros
                    </Form.Label>
                    <Form.Select
                      value={passengersAmount}
                      onChange={(e) =>
                        setPassengersAmount(Number(e.target.value))
                      }
                      disabled={!tourPackage || tourPackage.spots === 0}
                    >
                      {(!tourPackage || tourPackage.spots === 0) && (
                        <option value="0">No hay cupos disponibles</option>
                      )}

                      {tourPackage &&
                        tourPackage.spots > 0 &&
                        Array.from(
                          { length: tourPackage.spots },
                          (_, i) => i + 1,
                        ).map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? "pasajero" : "pasajeros"}
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
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
        </Col>
      </Row>
    </Container>
  );
}

export default ReservationCreationPage;
