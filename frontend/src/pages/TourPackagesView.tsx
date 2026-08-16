import { useEffect, useState } from "react";
import {
  Accordion,
  Badge,
  Button,
  Card,
  Col,
  Container,
  FloatingLabel,
  Form,
  ListGroup,
  ListGroupItem,
  Modal,
  Row,
  Spinner,
  Stack,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import type { TourPackage } from "../interfaces/tourPackage.interface";
import { useKeycloak } from "@react-keycloak/web";
import tourPackageService from "../services/tourPackage.service";
import formatCurrency from "../utils/formatUtils";
import {
  getCategoryColor,
  getCategoryWord,
  getSeasonWord,
  getTripTypeWord,
} from "../utils/colorUtils";
import { ErrorResponseModal } from "../components/ErrorResponseModal";

function TourPackagesView() {
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);
  const { keycloak } = useKeycloak();
  const [tour, setTour] = useState<TourPackage | null>(null);
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [apiError, setApiError] = useState<unknown>(null);

  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [category, setCategory] = useState<string>("");
  const [season, setSeason] = useState<string>("");
  const [tripType, setTripType] = useState<string>("");
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(true);
  const [packageName, setPackageName] = useState<string>("");
  const [destiny, setDestiny] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const handleReset = () => {
    setMaxPrice(1000000);
    setCategory("");
    setSeason("");
    setTripType("");
    setOnlyAvailable(true);
    setPackageName("");
    setDestiny("");
    setStartDate("");
    setEndDate("");
  };

  const getTourPackages = async () => {
    try {
      setLoading(true);
      const response = await tourPackageService.getByCustomFilters(
        packageName,
        destiny,
        category,
        season,
        tripType,
        maxPrice,
        startDate,
        endDate,
        onlyAvailable ? "AVAILABLE" : "",
      );
      setTourPackages(response.data);
    } catch (error) {
      console.error("Error cargando paquetes:", error);
      setApiError(error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShow(false);
    setTour(null);
  };

  const handleShow = (tour: TourPackage) => {
    setTour(tour);
    setShow(true);
  };

  const handleReservation = (id: number) => {
    if (keycloak.authenticated) {
      navigate(`/tour-packages/reservation/${id}`);
    } else {
      keycloak.login();
    }
  };

  useEffect(() => {
    getTourPackages();
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
          <h1 className="fs-3 fw-bold text-primary">Catálogo</h1>
          <p className="text-muted m-0">
            Encuentra el paquete túristico que se adapte a tus necesidades.
          </p>
        </div>
      </Stack>

      <Accordion defaultActiveKey="1">
        <Accordion.Item eventKey="0">
          <Accordion.Header className="text-primary">
            Filtros de Búsqueda
          </Accordion.Header>
          <Accordion.Body>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="filterName">
                  <Form.Label className="small fw-bold">
                    Nombre del Paquete
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej: Torres del Paine"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="filterDestiny">
                  <Form.Label className="small fw-bold">Destino</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej: Antofagasta"
                    value={destiny}
                    onChange={(e) => setDestiny(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-2 mb-3">
              <Col md={4}>
                <FloatingLabel label="Categoría">
                  <Form.Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Todas</option>
                    <option value="LOW_COST">Económico</option>
                    <option value="STANDARD">Estándar</option>
                    <option value="PREMIUM">Premium</option>
                  </Form.Select>
                </FloatingLabel>
              </Col>
              <Col md={4}>
                <FloatingLabel label="Temporada">
                  <Form.Select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                  >
                    <option value="">Todas</option>
                    <option value="WINTER">Invierno</option>
                    <option value="FALL">Otoño</option>
                    <option value="SPRING">Primavera</option>
                    <option value="SUMMER">Verano</option>
                  </Form.Select>
                </FloatingLabel>
              </Col>
              <Col md={4}>
                <FloatingLabel label="Tipo de viaje">
                  <Form.Select
                    value={tripType}
                    onChange={(e) => setTripType(e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="ADVENTURE">Aventura</option>
                    <option value="RELAXATION">Ralajación</option>
                    <option value="CULTURAL">Cultural</option>
                    <option value="BUSINESS">Negocio</option>
                    <option value="FAMILY">Familiar</option>
                  </Form.Select>
                </FloatingLabel>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Label className="small fw-bold">
                  Rango de Precio: $0 - ${maxPrice.toLocaleString()}
                </Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Range
                    min={0}
                    max={1000000}
                    step={10000}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                  />
                </div>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="startDate">
                  <Form.Label className="small fw-bold">
                    Fecha Inicio
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
                  <Form.Label className="small fw-bold">Fecha Fin</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="align-items-center">
              <Col>
                {keycloak.hasRealmRole("ADMIN") && (
                  <Form.Check
                    type="switch"
                    id="available-switch"
                    label="Solo disponibles"
                    checked={onlyAvailable}
                    onChange={(e) => setOnlyAvailable(e.target.checked)}
                  />
                )}
              </Col>
              <Col xs={5} className="d-flex justify-content-end">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleReset}
                  className="mx-3"
                >
                  Limpiar
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={getTourPackages}
                >
                  Aplicar Filtros
                </Button>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Container className="py-5">
        {tourPackages.length <= 0 && (
          <div className="text-center p-5 border rounded bg-light">
            <p className="text-muted mb-0">
              No hay paquetes túristicos registrados.
            </p>
          </div>
        )}
        <Row xs={1} md={2} lg={3} className="g-4">
          {tourPackages.map((tour) => (
            <Col key={tour.id} className="d-flex align-items-stretch">
              <Card
                className="shadow-sm h-100 transition-card overflow-hidden"
                style={{ width: "30rem" }}
              >
                <div className="position-relative">
                  <Card.Img
                    variant="top"
                    src="https://placehold.co/200x150?text=img"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="position-absolute top-0 end-0 m-3">
                    <span className="badge bg-white text-dark shadow-sm py-2 px-3 fw-bold">
                      {formatCurrency(tour.price)} CLP
                    </span>
                  </div>
                </div>

                <Card.Body className="d-flex flex-column p-4">
                  <div className="mb-2">
                    <small className="text-primary fw-bold text-uppercase ls-1">
                      {tour.destiny}
                    </small>
                    <Card.Title className="fs-4 fw-bold mt-1 mb-2">
                      {tour.name}
                    </Card.Title>
                  </div>

                  <Card.Text className="text-muted mb-4 small flex-grow-1">
                    {tour.description?.length > 100
                      ? `${tour.description.substring(0, 100)}...`
                      : tour.description}
                  </Card.Text>

                  <div className="d-flex flex-wrap gap-3 mb-4 py-3 border-top border-bottom">
                    <div className="d-flex align-items-center">
                      <span className="fw-medium">{tour.duration}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="fw-medium text-primary">
                        {tour.initialSpots} cupos iniciales
                      </span>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <Button
                      variant="link"
                      className="p-0 text-secondary fw-semibold small"
                      onClick={() => handleShow(tour)}
                    >
                      Ver más detalles
                    </Button>
                    <Button
                      variant="primary"
                      className="px-4 shadow-sm fw-bold"
                      disabled={tour?.tourPackageState !== "AVAILABLE"}
                      onClick={() => handleReservation(tour.id)}
                    >
                      Reservar
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Modal
          fullscreen
          centered
          show={show}
          onHide={handleClose}
        >
          {tour && (
            <>
              <Modal.Header closeButton className="bg-light border-0 py-3">
                <div>
                  <Modal.Title className="fw-bold fs-3 mb-0 text-dark">
                    {tour.name}
                    <strong className="fs-3 fw-bold text-primary">
                      {" "}
                      ({tour.destiny})
                    </strong>
                  </Modal.Title>
                  <Badge
                    className={`fw-semibold ${getCategoryColor(tour.category)}`}
                  >
                    {getCategoryWord(tour.category)}
                  </Badge>
                </div>
              </Modal.Header>

              <Modal.Body className="p-4">
                <Row className="g-4">
                  <Col md={7}>
                    <Stack>
                      <p className="text-uppercase text-primary fw-bold small mb-2">
                        Descripción del viaje
                      </p>
                      <p className="text-muted small leading-relaxed">
                        {tour.description}
                      </p>
                    </Stack>

                    <Stack className="mb-4">
                      <Row>
                        <Col>
                          <p className="text-uppercase text-primary fw-bold small mb-2">Duración</p>
                          <p className="fw-bold small mb-0">{tour.duration}</p>
                        </Col>
                        <Col>
                          <p className="text-uppercase text-primary fw-bold small mb-2">Temporada</p>
                          <p className="fw-bold small mb-0">{getSeasonWord(tour.season)}</p>
                        </Col>
                        <Col>
                          <p className="text-uppercase text-primary fw-bold small mb-2">Tipo de viaje</p>
                          <p className="fw-bold small mb-0">{getTripTypeWord(tour.tripType)}</p>
                        </Col>
                      </Row>
                    </Stack>

                    <Stack className="mb-4">
                      <p className="text-uppercase text-primary fw-bold small mb-2">
                        Servicios Incluidos
                      </p>
                      <ListGroup>
                        {tour?.services.map((s, index) => (
                          <ListGroupItem className="small fw-bold" key={index}>{s}</ListGroupItem>
                        ))}
                      </ListGroup>
                    </Stack>
                  </Col>

                  <Col md={5} className="border-start ps-md-4">
                    <div className="mb-4">
                      <h6 className="text-uppercase text-primary fw-bold small mb-2">
                        Cupos
                      </h6>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small fw-medium">
                          {tour.remainingSpots} cupos restantes
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h6 className="text-uppercase text-primary fw-bold small mb-2">
                        Periodo del Paquete
                      </h6>
                      <p className="small mb-1 text-muted">
                        Del <strong>{tour.startDate}</strong> al{" "}
                        <strong>{tour.endDate}</strong>
                      </p>
                    </div>

                    <Stack className="mb-4">
                      <p className="text-uppercase text-primary fw-bold small mb-2">
                        Precio por persona
                      </p>
                      <p className="fs-3 fw-bold text-primary">
                        {formatCurrency(tour.price)} CLP
                      </p>
                      <Button
                        variant="primary"
                        className="w-100 py-2 fw-bold shadow-sm"
                        disabled={tour?.tourPackageState !== "AVAILABLE"}
                        onClick={() => handleReservation(tour.id)}
                      >
                        Reservar Ahora
                      </Button>
                    </Stack>

                    <Stack>
                      <div className="small text-muted">
                        <p className="mb-1">
                          <strong>Condiciones:</strong>{" "}
                        </p>
                        <ol>
                          {tour.conditions.map((condition, index) => (
                            <li key={index}>{condition}</li>
                          ))}
                        </ol>
                        <p className="mb-0">
                          <strong>Restricciones:</strong>{" "}
                        </p>
                        <ol>
                          {tour.restrictions.map((restriction, index) => (
                            <li key={index}>{restriction}</li>
                          ))}
                        </ol>
                      </div>
                    </Stack>
                  </Col>
                </Row>
              </Modal.Body>
            </>
          )}
        </Modal>
      </Container>
    </Container>
  );
}

export default TourPackagesView;