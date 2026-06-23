import {
  Button,
  Card,
  Col,
  Container,
  Row,
  Spinner,
  Stack,
} from "react-bootstrap";
import keycloak from "../services/keycloak";
import { useEffect, useState } from "react";
import type { Reservation } from "../interfaces/reservation.interface";
import reservationService from "../services/reservation.service";
import { ErrorResponseModal } from "../components/ErrorResponseModal";

function ProfilePage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [apiError, setApiError] = useState<unknown>(null);

  const getreservations = async () => {
    try {
      setLoading(true);
      const response = await reservationService.getByEmail(
        keycloak.tokenParsed?.email,
      );
      setReservations(response.data);
    } catch (error) {
      console.error("Error cargando reservas:", error);
      setApiError(error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getreservations();
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
          <h1 className="fs-3 fw-bold text-primary">
            {keycloak.tokenParsed?.given_name}{" "}
            {keycloak.tokenParsed?.family_name}
          </h1>
          <p className="text-muted m-0">
            Gestiona tu perfil, ya sea tu nombre o tu correo electrónico.
          </p>
        </div>
      </Stack>

      <Card>
        <Card.Header className="fw-bold">Tu información</Card.Header>
        <Card.Body>
          <Row>
            <Col>
              <p className="text-muted mb-0 fw-semibold">Nombre:</p>
              <p className="fs-5 fw-medium">
                {keycloak.tokenParsed?.given_name}
              </p>
            </Col>
            <Col>
              <p className="text-muted mb-0 fw-semibold">Apellido:</p>
              <p className="fs-5 fw-medium">
                {keycloak.tokenParsed?.family_name || ""}
              </p>
            </Col>
            <Col>
              <p className="text-muted mb-0 fw-semibold">Correo:</p>
              <p className="fs-5 fw-medium">
                {keycloak.tokenParsed?.email || "benjamin@gmail.com"}
              </p>
            </Col>
            <Col>
              <p className="text-muted mb-0 fw-semibold">
                Cantidad de reservas:
              </p>
              <p className="fs-5 fw-medium">{reservations.length}</p>
            </Col>
          </Row>
        </Card.Body>
        <Card.Footer className="bg-white border-top-0 pb-3">
          <Button
            variant="primary"
            onClick={() => keycloak.accountManagement()}
            className="w-100 fw-semibold"
          >
            Cambiar tu información
          </Button>
        </Card.Footer>
      </Card>
    </Container>
  );
}

export default ProfilePage;
