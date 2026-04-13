import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";

function NavbarComponent() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary border-bottom p-3">
      <Container>
        <Navbar.Brand as={Link} to="/" className="text-primary fs-medium">
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

            <Nav.Link as={Link} to="/reservations">
              Mis reservas
            </Nav.Link>
          </Nav>

          <Nav>
            <Button
              as={Link as any}
              to="/login"
              className="btn-primary fw-medium"
            >
              Iniciar Sesión
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;
