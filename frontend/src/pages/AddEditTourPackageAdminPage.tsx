import React, { useEffect, useState } from "react";
import {
  Button,
  Container,
  Form,
  Stack,
  Row,
  Col,
  Card,
  InputGroup,
  Modal,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import tourPackageService from "../services/tourPackage.service";

function AddTourPackageAdminPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [titleForm, setTitleForm] = useState<string>(
    "Agregar Paquete Turístico",
  );

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [name, setName] = useState("");
  const [destiny, setDestiny] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [availableDates, setAvailableDates] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState(1);
  const [services, setServices] = useState("");
  const [conditions, setConditions] = useState("");
  const [restrictions, setRestrictions] = useState("");
  const [spots, setSpots] = useState(1);
  const [tripType, setTripType] = useState("ADVENTURE");
  const [season, setSeason] = useState("SUMMER");
  const [category, setCategory] = useState("STANDARD");
  const [tourPackageState, setTourPackageState] = useState("AVAILABLE");

  useEffect(() => {
    if (id) {
      setTitleForm("Editar Paquete Turístico");
      tourPackageService
        .getById(Number(id))
        .then((response) => {
          const pkg = response.data;
          setName(pkg.name);
          setDestiny(pkg.destiny);
          setDescription(pkg.description);
          setStartDate(pkg.startDate);
          setEndDate(pkg.endDate);
          setPrice(pkg.price);
          setSpots(pkg.spots);
          setCategory(pkg.category);
          setTourPackageState(pkg.tourPackageState || "AVAILABLE");
          setDuration(pkg.duration || "");
          setServices(pkg.services?.join(", "));
          setConditions(pkg.conditions?.join(", "));
          setRestrictions(pkg.restrictions?.join(", "));
          setSeason(pkg.season || "SUMMER");
          setTripType(pkg.tripType || "STANDARD");
          setAvailableDates(pkg.availableDates?.join(", ") || "");
        })
        .catch((error) => console.error("Error al cargar paquete", error));
    }
  }, [id]);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    if (tourPackageState === "AVAILABLE" && spots <= 0) {
      alert(
        "Un paquete no puede publicarse como disponible si no tiene cupos.",
      );
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      alert("La fecha de término debe ser posterior a la fecha de inicio.");
      return;
    }

    if (price <= 0) {
      alert("El precio del paquete debe ser mayor a cero.");
      return;
    }

    const tourPackage: any = {
      id: id ? Number(id) : undefined,
      name,
      destiny,
      description,
      startDate,
      endDate,
      availableDates: availableDates
        ? availableDates.split(",").map((d) => d.trim())
        : [],
      duration,
      price,
      services: services ? services.split(",").map((s) => s.trim()) : [],
      conditions: conditions ? conditions.split(",").map((c) => c.trim()) : [],
      restrictions: restrictions
        ? restrictions.split(",").map((r) => r.trim())
        : [],
      spots,
      tripType,
      season,
      category,
      tourPackageState,
    };

    const request = id
      ? tourPackageService.update(tourPackage)
      : tourPackageService.create(tourPackage);

    request
      .then(() => {
        handleShow();
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  };

  return (
    <Container className="py-4">
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Transacción completa</Modal.Title>
        </Modal.Header>
        <Modal.Body>Se ha actualizado correctamente el paquete.</Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => navigate("/tour-packages-admin")}
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
          <h1 className="fs-3 fw-bold text-primary">{titleForm}</h1>
          <p className="text-muted m-0">
            Gestión de inventario y logística de viajes.
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

      <Card className="shadow-sm border-0 bg-light">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="pe-md-4 border-end">
                <h5 className="mb-3 text-secondary text-uppercase small fw-bold">
                  Información General
                </h5>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small">
                    Nombre del Paquete
                  </Form.Label>
                  <Form.Control
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Ej: Torres del Paine Express"
                    className="bg-white"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small">Destino</Form.Label>
                  <Form.Control
                    value={destiny}
                    onChange={(e) => setDestiny(e.target.value)}
                    required
                    placeholder="¿A dónde vamos?"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small">
                    Descripción del Viaje
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe la experiencia..."
                  />
                </Form.Group>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold small">
                        Precio (CLP)
                      </Form.Label>
                      <InputGroup>
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control
                          type="number"
                          min="1"
                          value={price || ""}
                          onChange={(e) => setPrice(Number(e.target.value))}
                          isInvalid={price <= 0}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold small">
                        Cupos Totales
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        value={spots || ""}
                        onChange={(e) => setSpots(Number(e.target.value))}
                        isInvalid={spots <= 0}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>

              <Col md={6} className="ps-md-4">
                <h5 className="mb-3 text-secondary text-uppercase small fw-bold">
                  Logística y Fechas
                </h5>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold small">
                        Fecha Inicio
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold small">
                        Fecha Término
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        isInvalid={
                          startDate !== "" &&
                          endDate !== "" &&
                          new Date(startDate) >= new Date(endDate)
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold small">
                        Temporada
                      </Form.Label>
                      <Form.Select
                        value={season}
                        onChange={(e) => setSeason(e.target.value)}
                      >
                        <option value="SUMMER">Verano</option>
                        <option value="FALL">Otoño</option>
                        <option value="WINTER">Invierno</option>
                        <option value="SPRING">Primavera</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold small">
                        Categoría
                      </Form.Label>
                      <Form.Select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="LOW_COST">Económico</option>
                        <option value="STANDARD">Estándar</option>
                        <option value="PREMIUM">Premium</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold small">
                        Estado de Publicación
                      </Form.Label>
                      <Form.Select
                        value={tourPackageState}
                        onChange={(e) => setTourPackageState(e.target.value)}
                      >
                        <option value="AVAILABLE">Disponible</option>
                        <option value="NOT_AVAILABLE">No Disponible</option>
                        <option value="SOLD_OUT">Vendido</option>
                        <option value="CANCELED">Cancelado</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold small">
                        Tipo de viaje
                      </Form.Label>
                      <Form.Select
                        value={tripType}
                        onChange={(e) => setTripType(e.target.value)}
                      >
                        <option value="ADVENTURE">Aventura</option>
                        <option value="RELAXATION">Relajación</option>
                        <option value="CULTURAL">Cultural</option>
                        <option value="BUSINESS">Negocios</option>
                        <option value="FAMILY">Familia</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small">
                    Duración Estándar
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Ej: 3 días / 2 noches"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small d-flex justify-content-between">
                    Fechas Específicas{" "}
                    <span className="text-muted fw-normal">AAAA-MM-DD</span>
                  </Form.Label>
                  <Form.Control
                    placeholder="2026-05-01, 2026-06-15"
                    value={availableDates}
                    onChange={(e) => setAvailableDates(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr className="my-4" />

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small">
                    Servicios Incluidos
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={services}
                    onChange={(e) => setServices(e.target.value)}
                    placeholder="Guía, Almuerzo, Seguro..."
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small">Condiciones</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                    placeholder="Edad mínima 12 años, no reembolsable..."
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small">
                    Restricciones
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={restrictions}
                    onChange={(e) => setRestrictions(e.target.value)}
                    placeholder="No se permiten mascotas, ..."
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-grid gap-2 mt-4">
              <Button
                className="py-3 fw-bold shadow-sm"
                variant="primary"
                size="lg"
                type="submit"
              >
                {id ? "Actualizar Paquete Turístico" : "Crear Nuevo Paquete"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AddTourPackageAdminPage;
