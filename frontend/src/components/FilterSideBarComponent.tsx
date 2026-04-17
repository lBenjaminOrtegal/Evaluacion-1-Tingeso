import { useKeycloak } from "@react-keycloak/web";
import React, { useState } from "react";
import {
  Col,
  Container,
  FloatingLabel,
  Form,
  Row,
  Button,
} from "react-bootstrap";

function FilterSideBarComponent({
  onFilterChange,
}: {
  onFilterChange: (f: any) => void;
}) {
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [category, setCategory] = useState<string>("");
  const [season, setSeason] = useState<string>("");
  const [tripType, setTripType] = useState<string>("");
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(true);
  const [packageName, setPackageName] = useState<string>("");
  const [destiny, setDestiny] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  React.useEffect(() => {
    onFilterChange({
      packageName,
      destiny,
      category,
      season,
      maxPrice,
      onlyAvailable,
      startDate,
      endDate,
      tripType,
    });
  }, [
    packageName,
    destiny,
    category,
    season,
    maxPrice,
    onlyAvailable,
    startDate,
    endDate,
    tripType,
  ]);

  const handleReset = () => {
    setMaxPrice(1000000);
    setCategory("");
    setSeason("");
    setTripType("");
    setOnlyAvailable(true);
    setPackageName("");
    setDestiny("");
    setStartDate("");
    setEndDate("");
  };

  const { keycloak } = useKeycloak();

  return (
    <Container className="py-4">
      <h5 className="mb-4 fw-bold fs-3 text-primary">Filtros de Búsqueda</h5>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group controlId="filterName">
            <Form.Label className="small fw-bold">
              Nombre del Paquete
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Torres del Paine"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="filterDestiny">
            <Form.Label className="small fw-bold">Destino</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Antofagasta"
              value={destiny}
              onChange={(e) => setDestiny(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="g-2 mb-3">
        <Col md={4}>
          <FloatingLabel label="Categoría">
            <Form.Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="LOW_COST">Económico</option>
              <option value="STANDARD">Estándar</option>
              <option value="PREMIUM">Premium</option>
            </Form.Select>
          </FloatingLabel>
        </Col>
        <Col md={4}>
          <FloatingLabel label="Temporada">
            <Form.Select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="WINTER">Invierno</option>
              <option value="FALL">Otoño</option>
              <option value="SPRING">Primavera</option>
              <option value="SUMMER">Verano</option>
            </Form.Select>
          </FloatingLabel>
        </Col>
        <Col md={4}>
          <FloatingLabel label="Tipo de viaje">
            <Form.Select
              value={tripType}
              onChange={(e) => setTripType(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="ADVENTURE">Aventura</option>
              <option value="RELAXATION">Ralajación</option>
              <option value="CULTURAL">Cultural</option>
              <option value="BUSINESS">Negocio</option>
              <option value="FAMILY">Familiar</option>
            </Form.Select>
          </FloatingLabel>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Form.Label className="small fw-bold">
            Rango de Precio: $0 - ${maxPrice.toLocaleString()}
          </Form.Label>
          <div className="d-flex align-items-center gap-2">
            <Form.Range
              min={0}
              max={1000000}
              step={10000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
          </div>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group controlId="startDate">
            <Form.Label className="small fw-bold">Fecha Inicio</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="endDate">
            <Form.Label className="small fw-bold">Fecha Fin</Form.Label>
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="align-items-center">
        <Col>
          {keycloak.hasRealmRole("ADMIN") && (
            <Form.Check
              type="switch"
              id="available-switch"
              label="Solo disponibles"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
            />
          )}
        </Col>
        <Col xs={5} className="d-flex justify-content-end">
          <Button variant="outline-secondary" size="sm" onClick={handleReset}>
            Limpiar
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default FilterSideBarComponent;
