import React from "react";
import { Button, Container, Form, Card, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

function LoginPage() {
  return (
    <Container className="d-flex align-items-center justify-content-center">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card className="border-0 p-4">
            <Card.Body>
              <div className="text-center mb-4">
                <h1 className="fs-3 fw-bold text-primary">Inicia sesión</h1>
                <p className="text-muted small">
                  Reserva los mejores paquetes turísticos con nosotros.
                </p>
              </div>

              <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label className="fw-semibold">Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="ejemplo@correo.com"
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label className="fw-semibold">Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Tu contraseña"
                    className="py-2"
                  />
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Form.Check
                    type="checkbox"
                    label="Recuérdame"
                    className="small text-muted"
                  />
                  <Link to="/forgot" className="small text-decoration-none">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2 fw-bold shadow-sm"
                >
                  Ingresar
                </Button>
              </Form>

              <div className="text-center mt-4">
                <p className="small text-muted">
                  ¿No tienes cuenta?{" "}
                  <Link to="/register" className="fw-bold text-decoration-none">
                    Regístrate
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginPage;
