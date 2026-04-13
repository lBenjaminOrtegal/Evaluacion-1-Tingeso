import React from "react";
import NavbarComponent from "./components/NavbarComponent";
import FooterComponent from "./components/FooterComponent";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TourPackagesAdminPage from "./pages/TourPackagesAdminPage";
import LoginPage from "./pages/LoginPage";
import AddEditTourPackageAdminPage from "./pages/AddEditTourPackageAdminPage";
import TourPackageCardComponent from "./components/TourPackageCardComponent";

function App() {
  return (
    <div>
      <NavbarComponent />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/tour-packages-admin" element={<TourPackagesAdminPage />}/>
        <Route path="/tour-packages-admin/add" element={<AddEditTourPackageAdminPage />} />
        <Route path="/tour-packages-admin/edit/:id" element={<AddEditTourPackageAdminPage />} />

        <Route path="/tour-packages" element={<TourPackageCardComponent />} />
      </Routes>
      {/* <FooterComponent /> */}
    </div>
  );
}

export default App;
