import { useState } from "react";
import { Container } from "react-bootstrap";
import FilterSideBarComponent from "../components/FilterSideBarComponent";
import TourPackageCardComponent from "../components/TourPackageCardComponent";

function TourPackagesViewPage() {
  const [filters, setFilters] = useState({});

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <Container>
      <FilterSideBarComponent
        onFilterChange={handleFilterChange}
      ></FilterSideBarComponent>
      <hr></hr>
      <TourPackageCardComponent
        activeFilters={filters}
      ></TourPackageCardComponent>
    </Container>
  );
}

export default TourPackagesViewPage;
