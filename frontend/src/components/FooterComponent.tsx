import React from 'react'
import { Container, Nav, Navbar } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function FooterComponent() {
  return (
    <Navbar className="bg-light border-top">
      <Container>
        <Navbar.Text>©TravelAgency 2026</Navbar.Text>
          <Nav>
            <Nav.Link as={Link} to='/privacy' className='text-decoration-underline text-dark'>Privacidad</Nav.Link>
            <Nav.Link as={Link} to='/terms-conditions' className='text-decoration-underline text-dark'>Términos y Condiciones</Nav.Link>
            <Nav.Link as={Link} to='/faq' className='text-decoration-underline text-dark'>FAQ</Nav.Link>          
          </Nav>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text as={Link} to="/contact-us">Contáctanos</Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default FooterComponent