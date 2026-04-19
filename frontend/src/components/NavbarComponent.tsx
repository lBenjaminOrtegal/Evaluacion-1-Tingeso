import { useKeycloak } from "@react-keycloak/web";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";

function NavbarComponent() {
  const { keycloak } = useKeycloak();

  return (
    <Navbar expand="lg" className="bg-body-tertiary border-bottom p-3">
      <Container>
        <Navbar.Brand as={Link} to="/" className="text-primary fw-bold">
          TravelAgency
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Inicio
            </Nav.Link>

            <Nav.Link as={Link} to="/about-us">
              Acerca de nosotros
            </Nav.Link>

            <Nav.Link as={Link} to="/tour-packages">
              Paquetes túristicos
            </Nav.Link>

            {keycloak.hasRealmRole("ADMIN") && (
              <Nav.Link as={Link} to="/tour-packages-admin">
                Administrar paquetes
              </Nav.Link>
            )}

            <Nav.Link as={Link} to="/reservations">
              Reservas
            </Nav.Link>

            {keycloak.hasRealmRole("ADMIN") && (
              <Nav.Link as={Link} to="/reservations-admin">
                Administrar reservas
              </Nav.Link>
            )}
          </Nav>

          <Nav>
            {keycloak.authenticated ? (
              <Button onClick={() => keycloak.logout()} 
              variant="outline-danger"
              className="fw-semibold"
              >
                Cerrar Sesión
              </Button>
            ) : (
              <Button
                onClick={() => keycloak.login()}
                className="fw-semibold"
              >
                Iniciar Sesión
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;
