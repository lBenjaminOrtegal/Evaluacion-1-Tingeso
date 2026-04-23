import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";
import type { TourPackage } from "../interfaces/tourPackage.interface";
import tourPackageService from "../services/tourPackage.service";
import { useNavigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";

function TourPackageCardComponent({ activeFilters }: { activeFilters: any }) {
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);
  const { keycloak } = useKeycloak();
  const [show, setShow] = useState(false);
  const [tour, setTour] = useState<TourPackage | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const filteredPackages = tourPackages.filter((pkg) => {
    const matchName = pkg.name
      .toLowerCase()
      .includes(activeFilters.packageName.toLowerCase());
    const matchDestiny = pkg.destiny
      .toLowerCase()
      .includes(activeFilters.destiny.toLowerCase());

    const matchCategory =
      activeFilters.category === "" || pkg.category === activeFilters.category;
    const matchSeason =
      activeFilters.season === "" || pkg.season === activeFilters.season;
    const matchTripType =
      activeFilters.tripType === "" || pkg.tripType === activeFilters.tripType;

    const matchPrice = pkg.price <= activeFilters.maxPrice;

    const filterStart = activeFilters.startDate
      ? new Date(activeFilters.startDate)
      : null;
    const filterEnd = activeFilters.endDate
      ? new Date(activeFilters.endDate)
      : null;

    if (filterStart) filterStart.setHours(0, 0, 0, 0);
    if (filterEnd) filterEnd.setHours(0, 0, 0, 0);

    const pkgStart = new Date(pkg.startDate);
    const pkgEnd = new Date(pkg.endDate);
    pkgStart.setHours(0, 0, 0, 0);
    pkgEnd.setHours(0, 0, 0, 0);

    const matchDate =
      (!filterStart || pkgStart >= filterStart) &&
      (!filterEnd || pkgEnd <= filterEnd);

    const matchAvailables = activeFilters.onlyAvailable
      ? pkg.tourPackageState === "AVAILABLE"
      : true;

    return (
      matchName &&
      matchDestiny &&
      matchPrice &&
      matchCategory &&
      matchSeason &&
      matchTripType &&
      matchAvailables &&
      matchDate
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount);
  };

  const getTourPackages = async () => {
    try {
      setLoading(true);
      const response = await tourPackageService.getAll();
      setTourPackages(response.data);
    } catch (error) {
      console.error("Error cargando paquetes:", error);
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
    <Container className="py-5">
      {tourPackages.length <= 0 && (
        <div className="text-center p-5 border rounded bg-light">
          <p className="text-muted mb-0">
            No hay paquetes túristicos registrados.
          </p>
        </div>
      )}
      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredPackages.map((tour) => (
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
                    ${tour.price}
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
                  {tour.description.length > 100
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
        size="lg"
        centered
        show={show}
        onHide={handleClose}
        contentClassName="shadow-lg border-0"
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
                <small className="text-secondary fw-semibold">
                  <span className="text-uppercase">
                    Categoría: {tour.category}
                  </span>
                </small>
              </div>
            </Modal.Header>

            <Modal.Body className="px-4 py-4">
              <Row className="g-4">
                <Col md={7}>
                  <section className="mb-4">
                    <h6 className="text-uppercase text-primary fw-bold small mb-2">
                      Descripción del viaje
                    </h6>
                    <p className="text-muted leading-relaxed">
                      {tour.description}
                    </p>
                  </section>

                  <Row className="g-3 mb-4">
                    <Col xs={6}>
                      <div className="p-3 border rounded-3 bg-light-subtle">
                        <h6 className="small text-muted mb-1">Duración</h6>
                        <p className="fw-bold mb-0">{tour.duration}</p>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="p-3 border rounded-3 bg-light-subtle">
                        <h6 className="small text-muted mb-1">Temporada</h6>
                        <p className="fw-bold mb-0">{tour.season}</p>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="p-3 border rounded-3 bg-light-subtle">
                        <h6 className="small text-muted mb-1">Tipo de viaje</h6>
                        <p className="fw-bold mb-0">{tour.tripType}</p>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="p-3 border rounded-3 bg-light-subtle">
                        <h6 className="small text-muted mb-1">Estado</h6>
                        <p
                          className={`fw-bold mb-0 ${tour.tourPackageState === "AVAILABLE" ? "text-success" : "text-secondary"}`}
                        >
                          {tour.tourPackageState}
                        </p>
                      </div>
                    </Col>
                  </Row>

                  <section className="mb-4">
                    <h6 className="text-uppercase text-primary fw-bold small mb-2">
                      Servicios incluidos
                    </h6>
                    <ul className="list-unstyled row g-2">
                      {tour.services.map((service, index) => (
                        <Col sm={6} key={index}>
                          <li className="small fw-bold">{service}</li>
                        </Col>
                      ))}
                    </ul>
                  </section>
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

                  <div className="p-3 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-25 mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-secondary">Precio por persona</span>
                      <span className="fs-3 fw-bold text-primary">
                        {formatCurrency(tour.price)}
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      className="w-100 py-2 fw-bold shadow-sm"
                      disabled={tour?.tourPackageState !== "AVAILABLE"}
                      onClick={() => handleReservation(tour.id)}
                    >
                      Reservar Ahora
                    </Button>
                  </div>

                  <section>
                    <h6 className="text-uppercase text-danger fw-bold small mb-2">
                      Importante
                    </h6>
                    <div
                      className="small text-muted overflow-auto"
                      style={{ maxHeight: "100px" }}
                    >
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
                  </section>
                </Col>
              </Row>
            </Modal.Body>
          </>
        )}
      </Modal>
    </Container>
  );
}

export default TourPackageCardComponent;
