import { Container, Stack } from "react-bootstrap";

function Home() {
  return (
    <Container>
      <Stack className="py-3 border-bottom fw-bold fs-3 text-primary align-items-center justify-content-center text-center">
        <p>¡Bienvenido a TravelAgency!</p>
        <p className="fw-medium text-muted fs-5">
          Comercialización de paquetes turísticos nacionales e internacionales
        </p>
      </Stack>
    </Container>
  );
}

export default Home;
