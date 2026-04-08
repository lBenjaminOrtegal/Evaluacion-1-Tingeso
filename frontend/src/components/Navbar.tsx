import { Button } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function NavbarComponent() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home" className='text-primary fs-medium'>TravelAgency</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home">Acerca de nosotros</Nav.Link>
            <NavDropdown title="Paquetes túristicos" id="basic-nav-dropdown">
              <NavDropdown.Item href="#tour-packages/national">Nacionales</NavDropdown.Item>
              <NavDropdown.Item href="#tour-packages/international">Internacionales</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#tour-packages">
                Todo el catálogo
              </NavDropdown.Item>
            </NavDropdown>
            <Button href='#login' className='btn-primary'>Iniciar Sesión</Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;