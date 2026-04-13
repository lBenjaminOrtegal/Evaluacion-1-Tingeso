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
  const [typeOfTransport, setTypeOfTransport] = useState<string>("");
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
      typeOfTransport,
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
    typeOfTransport,
  ]);

  const handleReset = () => {
    setMaxPrice(1000000);
    setCategory("");
    setSeason("");
    setTypeOfTransport("");
    setOnlyAvailable(true);
    setPackageName("");
    setDestiny("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <Container className="p-3">
      <h5 className="mb-4">Filtros de Búsqueda</h5>

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
              <option value="Aventura">Aventura</option>
              <option value="Relajación">Relajación</option>
              <option value="Cultural">Cultural</option>
              <option value="Familiar">Familiar</option>
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
              <option value="Invierno">Invierno</option>
              <option value="Otoño">Otoño</option>
              <option value="Primavera">Primavera</option>
              <option value="Verano">Verano</option>
            </Form.Select>
          </FloatingLabel>
        </Col>
        <Col md={4}>
          <FloatingLabel label="Transporte">
            <Form.Select
              value={typeOfTransport}
              onChange={(e) => setTypeOfTransport(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Aéreo">Aéreo</option>
              <option value="Terrestre">Terrestre</option>
              <option value="Marítimo">Marítimo</option>
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
        <Col xs={7}>
          <Form.Check
            type="switch"
            id="available-switch"
            label="Solo disponibles"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
          />
        </Col>
        <Col xs={5} className="text-end justify-content-between">
          <Button variant="outline-secondary" size="sm" onClick={handleReset}>
            Limpiar
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default FilterSideBarComponent;
