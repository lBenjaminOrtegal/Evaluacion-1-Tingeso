import React from "react";
import NavbarComponent from "./components/NavbarComponent";
import FooterComponent from "./components/FooterComponent";
import { Route, Routes, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TourPackagesAdminPage from "./pages/TourPackagesAdminPage";
import LoginPage from "./pages/LoginPage";
import AddEditTourPackageAdminPage from "./pages/AddEditTourPackageAdminPage";
import TourPackagesViewPage from "./pages/TourPackagesViewPage";
import { useKeycloak } from "@react-keycloak/web";
import type { PrivateRouteProps } from "./interfaces/privateRouteProps.interface";
import { Alert, Button, Container, Spinner } from "react-bootstrap";
import ReservationsViewPage from "./pages/ReservationsViewPage";
import ReservationCreationPage from "./pages/ReservationCreationPage";
import ReservationsAdminPage from "./pages/ReservationsAdminPage";
import PaymentPage from "./pages/PaymentPage";

function App() {
  const { keycloak, initialized } = useKeycloak();

  const navigate = useNavigate();

  if (!initialized) {
    return (
      <Container className="py-5 text-center align-items-center">
        <Spinner animation="border" variant="primary" />
        <h5 className="fw-medium text-secondary">Cargando...</h5>
        <p className="text-muted small">Por favor, espera un momento.</p>
      </Container>
    );
  }

  const isLoggedIn = keycloak.authenticated;

  const roles: string[] =
    (keycloak.tokenParsed as any)?.realm_access?.roles || [];

  const PrivateRoute = ({
    element,
    rolesAllowed,
  }: PrivateRouteProps): React.JSX.Element | null => {
    if (!isLoggedIn) {
      keycloak.login();
      return null;
    }

    if (rolesAllowed && !rolesAllowed.some((r) => roles.includes(r))) {
      return (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "80vh" }}
        >
          <Alert
            variant="white"
            className="border-0 p-5 text-center"
            style={{ maxWidth: "500px" }}
          >
            <div className="mb-3">
              <i
                className="bi bi-lock-fill text-primary"
                style={{ fontSize: "3rem" }}
              ></i>
            </div>

            <Alert.Heading className="fw-bold text-danger fs-3">
              Acceso Restringido
            </Alert.Heading>

            <p className="text-muted mt-3">
              Lo sentimos, tu cuenta actual no tiene las atribuciones necesarias
              para visualizar este contenido. Asegúrate de haber iniciado sesión
              con el rol adecuado.
            </p>

            <hr className="my-4" />

            <div className="d-grid gap-2">
              <Button
                onClick={() => navigate("/")}
                variant="primary"
                className="fw-medium py-2"
              >
                Volver al inicio
              </Button>

              <Button
                onClick={() => keycloak.logout()}
                variant="link"
                className="text-decoration-none text-muted"
              >
                Cerrar sesión e ingresar con otra cuenta
              </Button>
            </div>
          </Alert>
        </div>
      );
    }

    return element;
  };

  return (
    <div>
      <NavbarComponent />
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/tour-packages-admin"
          element={
            <PrivateRoute
              element={<TourPackagesAdminPage />}
              rolesAllowed={["ADMIN"]}
            />
          }
        />

        <Route
          path="/tour-packages-admin/add"
          element={
            <PrivateRoute
              element={<AddEditTourPackageAdminPage />}
              rolesAllowed={["ADMIN"]}
            />
          }
        />

        <Route
          path="/tour-packages-admin/edit/:id"
          element={
            <PrivateRoute
              element={<AddEditTourPackageAdminPage />}
              rolesAllowed={["ADMIN"]}
            />
          }
        />

        <Route path="/tour-packages" element={<TourPackagesViewPage />} />

        <Route path="/reservations" element={<ReservationsViewPage />} />

        <Route
          path="/tour-packages/reservation/:id"
          element={
            <PrivateRoute
              element={<ReservationCreationPage />}
              rolesAllowed={["USER", "ADMIN"]}
            />
          }
        />

        <Route
          path="/reservations-admin"
          element={
            <PrivateRoute
              element={<ReservationsAdminPage />}
              rolesAllowed={["ADMIN"]}
            />
          }
        />

        <Route
          path="/reservations/payment/:id"
          element={
            <PrivateRoute
              element={<PaymentPage />}
              rolesAllowed={["USER", "ADMIN"]}
            />
          }
        />
      </Routes>
      {/* <FooterComponent /> */}
    </div>
  );
}

export default App;
