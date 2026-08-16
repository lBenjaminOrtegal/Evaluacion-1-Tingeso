import React from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import { Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import TourPackagesAdmin from "./pages/TourPackagesAdmin";
import TourPackageCreationEdition from "./pages/TourPackagesCreationEdition";
import TourPackagesView from "./pages/TourPackagesView";
import { useKeycloak } from "@react-keycloak/web";
import type { PrivateRouteProps } from "./interfaces/privateRouteProps.interface";
import { Alert, Button, Container, Spinner } from "react-bootstrap";
import ReservationsView from "./pages/ReservationsView";
import ReservationCreationEdition from "./pages/ReservationCreationEdition";
import ReservationsAdmin from "./pages/ReservationsAdmin";
import Payment from "./pages/Payment";
import ReportsSales from "./pages/ReportsBySales.tsx";
import Profile from "./pages/Profile";
import Discounts from "./pages/Discounts";
import ReportsByDate from "./pages/ReportsByDate.tsx";

const PrivateRoute = ({
  element,
  rolesAllowed,
}: PrivateRouteProps): React.JSX.Element | null => {
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();

  const isLoggedIn = keycloak.authenticated;
  const roles: string[] =
    (keycloak.tokenParsed as any)?.realm_access?.roles || [];

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

function App() {
  const { initialized } = useKeycloak();

  if (!initialized) {
    return (
      <Container className="py-5 text-center align-items-center">
        <Spinner animation="border" variant="primary" />
        <h5 className="fw-medium text-secondary">Cargando...</h5>
        <p className="text-muted small">Por favor, espera un momento.</p>
      </Container>
    );
  }

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/tour-packages-admin"
          element={
            <PrivateRoute
              element={<TourPackagesAdmin />}
              rolesAllowed={["ADMIN"]}
            />
          }
        />

        <Route
          path="/tour-packages-admin/add"
          element={
            <PrivateRoute
              element={<TourPackageCreationEdition />}
              rolesAllowed={["ADMIN"]}
            />
          }
        />

        <Route
          path="/tour-packages-admin/edit/:id"
          element={
            <PrivateRoute
              element={<TourPackageCreationEdition />}
              rolesAllowed={["ADMIN"]}
            />
          }
        />

        <Route path="/tour-packages" element={<TourPackagesView />} />

        <Route path="/reservations" element={<ReservationsView />} />

        <Route
          path="/tour-packages/reservation/:id"
          element={
            <PrivateRoute
              element={<ReservationCreationEdition />}
              rolesAllowed={["USER", "ADMIN"]}
            />
          }
        />

        <Route
          path="/tour-packages/reservation/:id/:reservationId"
          element={
            <PrivateRoute
              element={<ReservationCreationEdition />}
              rolesAllowed={["ADMIN"]}
            />
          }
        />

        <Route
          path="/reservations-admin"
          element={
            <PrivateRoute
              element={<ReservationsAdmin />}
              rolesAllowed={["ADMIN"]}
            />
          }
        />

        <Route
          path="/reservations/payment/:id"
          element={
            <PrivateRoute
              element={<Payment />}
              rolesAllowed={["USER", "ADMIN"]}
            />
          }
        />

        <Route
          path="/reports/date"
          element={
            <PrivateRoute
              element={<ReportsByDate />}
              rolesAllowed={["ADMIN"]}
            />
          }
        />

        <Route
          path="/reports/sales"
          element={
            <PrivateRoute element={<ReportsSales />} rolesAllowed={["ADMIN"]} />
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute
              element={<Profile />}
              rolesAllowed={["USER", "ADMIN"]}
            />
          }
        />

        <Route
          path="/tour-packages-admin/discounts"
          element={
            <PrivateRoute element={<Discounts />} rolesAllowed={["ADMIN"]} />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
