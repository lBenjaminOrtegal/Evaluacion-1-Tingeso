import { useKeycloak } from "@react-keycloak/web";
import { Button, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
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
            <Nav.Link as={Link} to="/" className="fw-medium">
              Inicio
            </Nav.Link>

            <Nav.Link as={Link} to="/tour-packages" className="fw-medium">
              Paquetes túristicos
            </Nav.Link>

            {keycloak.hasRealmRole("ADMIN") && (
              <Nav.Link
                as={Link}
                to="/tour-packages-admin"
                className="fw-medium"
              >
                Administrar paquetes
              </Nav.Link>
            )}

            <Nav.Link as={Link} to="/reservations" className="fw-medium">
              Reservas
            </Nav.Link>

            {keycloak.hasRealmRole("ADMIN") && (
              <Nav.Link
                as={Link}
                to="/reservations-admin"
                className="fw-medium"
              >
                Administrar reservas
              </Nav.Link>
            )}

            {keycloak.hasRealmRole("ADMIN") && (
              <NavDropdown
                title="Reportes"
                id="reportsDropdown"
                className="fw-medium"
              >
                <NavDropdown.Item as={Link} to="/reports/date">
                  Fecha
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/reports/sales">
                  Ventas
                </NavDropdown.Item>
              </NavDropdown>
            )}

            {keycloak.authenticated && (
              <Nav.Link as={Link} to="/profile" className="fw-medium">
                Perfil
              </Nav.Link>
            )}
          </Nav>

          <Nav>
            {keycloak.authenticated ? (
              <Button
                onClick={() => keycloak.logout()}
                variant="outline-danger"
                className="fw-medium"
              >
                Cerrar Sesión
              </Button>
            ) : (
              <Button onClick={() => keycloak.login()} className="fw-semibold">
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
