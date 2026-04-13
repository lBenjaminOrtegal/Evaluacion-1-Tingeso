import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Modal,
  Row,
} from "react-bootstrap";
import type { TourPackage } from "../interfaces/tourPackage.interface";
import tourPackageService from "../services/tourPackage.service";
import { Link } from "react-router-dom";

function TourPackageCardComponent() {
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);
  const [show, setShow] = useState(false);
  const [tour, settour] = useState<TourPackage | null>(null);

  const getTourPackages = async () => {
    try {
      const response = await tourPackageService.getAll();
      setTourPackages(response.data);
    } catch (error) {
      console.error("Error cargando paquetes:", error);
    }
  };

  useEffect(() => {
    getTourPackages();
  }, []);

  const handleClose = () => {
    setShow(false);
    settour(null);
  };

  const handleShow = (tour: TourPackage) => {
    settour(tour);
    setShow(true);
  };

  return (
    <Container className="py-5">
      <Row xs={1} md={2} lg={3} className="g-4">
        {tourPackages.map((tour) => (
          <Col key={tour.id} className="d-flex align-items-stretch">
            <Card className="border-0 shadow-sm h-100 transition-card overflow-hidden">
              <div className="position-relative">
                <Card.Img
                  variant="top"
                  src="src/assets/fortnite.jpg"
                  style={{ height: "220px", objectFit: "cover" }}
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

                <div className="d-flex flex-wrap gap-3 mb-4 py-3 border-top border-bottom border-light">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-clock text-secondary me-2"></i>
                    <span className="fw-medium">{tour.duration}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-people text-secondary me-2"></i>
                    <span
                      className={`fw-medium ${tour.spots < 5 ? "text-danger" : ""}`}
                    >
                      {tour.spots} cupos
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
                    as={Link as any}
                    to={`/tour-packages/reservation/${tour.id}`}
                    variant="primary"
                    className="px-4 shadow-sm fw-bold"
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
                <Modal.Title className="fw-bold fs-3 mb-0">
                  {tour.name}
                </Modal.Title>
                <small className="text-secondary fw-semibold">
                  <i className="bi bi-geo-alt-fill me-1 text-primary"></i>
                  {tour.destiny} —{" "}
                  <span className="text-uppercase">{tour.category}</span>
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
                        <p className="fw-bold mb-0">
                          <i className="bi bi-clock me-2 text-primary"></i>
                          {tour.duration}
                        </p>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="p-3 border rounded-3 bg-light-subtle">
                        <h6 className="small text-muted mb-1">Temporada</h6>
                        <p className="fw-bold mb-0">
                          <i className="bi bi-cloud-sun me-2 text-primary"></i>
                          {tour.season}
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
                          <li className="small">
                            <i className="bi bi-check2-circle text-success me-2"></i>
                            {service}
                          </li>
                        </Col>
                      ))}
                    </ul>
                  </section>
                </Col>

                <Col md={5} className="border-start ps-md-4">
                  <div className="mb-4">
                    <h6 className="text-uppercase text-primary fw-bold small mb-2">
                      Estado y Cupos
                    </h6>
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className={`badge ${tour.tourPackageState === "AVAILABLE" ? "bg-success" : "bg-warning text-dark"}`}
                      >
                        {tour.tourPackageState}
                      </span>
                      <span className="text-muted small fw-medium">
                        {tour.spots} cupos restantes
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="text-uppercase text-primary fw-bold small mb-2">
                      Fechas del Paquete
                    </h6>
                    <p className="small mb-1 text-muted">
                      Del <strong>{tour.startDate}</strong> al{" "}
                      <strong>{tour.endDate}</strong>
                    </p>

                    <div className="mt-3">
                      <p className="small fw-bold mb-1">
                        Otras fechas disponibles:
                      </p>
                      <div className="d-flex flex-wrap gap-1">
                        {tour.availableDates.map((date, i) => (
                          <span
                            key={i}
                            className="badge border text-dark fw-normal fs-6 bg-white"
                          >
                            {date}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-25 mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-secondary">Precio por persona</span>
                      <span className="fs-3 fw-bold text-primary">
                        ${tour.price}
                      </span>
                    </div>
                    <Button
                      as={Link as any}
                      to={`/tour-packages/reservation/${tour.id}`}
                      variant="primary"
                      className="w-100 py-2 fw-bold shadow-sm"
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
                        {tour.conditions.join(", ")}
                      </p>
                      <p className="mb-0">
                        <strong>Restricciones:</strong>{" "}
                        {tour.restrictions.join(", ")}
                      </p>
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
