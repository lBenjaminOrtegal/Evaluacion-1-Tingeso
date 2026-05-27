import { useEffect, useState } from "react";
import {
  Button,
  Container,
  Form,
  InputGroup,
  Modal,
  Spinner,
  Stack,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import type { Discount } from "../interfaces/discount.interface";
import discountService from "../services/discount.service";

function DiscountsPage() {
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [combinableDiscounts, setCombinableDiscounts] =
    useState<boolean>(false);
  const [maxDiscountLimit, setMaxDiscountLimit] = useState<number>(25);
  const [minPassengers, setMinPassengers] = useState<number>(1);
  const [discountPassengers, setDiscountPassengers] = useState<number>(0);
  const [minReservations, setMinReservations] = useState<number>(1);
  const [discountReservations, setDiscountReservations] = useState<number>(0);
  const [daysWindow, setDaysWindow] = useState<number>(0);
  const [minReservationsMultiplePackages, setMinReservationsMultiplePackages] =
    useState<number>(1);
  const [discountMultiplePackages, setDiscountMultiplePackages] =
    useState<number>(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const discount: Discount = {
      combinableDiscounts: combinableDiscounts,
      maxDiscountLimit: maxDiscountLimit / 100,
      minPassengers: minPassengers,
      discountPassengers: discountPassengers / 100,
      minReservations: minReservations,
      discountReservations: discountReservations / 100,
      daysWindow: daysWindow,
      minReservationsMultiplePackages: minReservationsMultiplePackages,
      discountMultiplePackages: discountMultiplePackages / 100,
    };

    try {
      setLoading(true);
      await discountService.update(discount);
      setShow(true);
    } catch (error) {
      console.error("No se pudieron realizar los cambios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setData();
  }, []);

  const setData = async () => {
    try {
      setLoading(true);
      const response = await discountService.getDiscounts();
      const discount = response.data;

      setCombinableDiscounts(discount.combinableDiscounts);
      setMaxDiscountLimit(Math.round(discount.maxDiscountLimit * 100));
      setMinPassengers(discount.minPassengers);
      setDiscountPassengers(Math.round(discount.discountPassengers * 100));
      setMinReservations(discount.minReservations);
      setDiscountReservations(Math.round(discount.discountReservations * 100));
      setDaysWindow(discount.daysWindow);
      setMinReservationsMultiplePackages(
        discount.minReservationsMultiplePackages,
      );
      setDiscountMultiplePackages(
        Math.round(discount.discountMultiplePackages * 100),
      );
    } catch (error) {
      console.error("Error al cargar los descuentos", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center align-items-center">
        <Spinner animation="border" variant="primary" />
        <h5 className="fw-medium text-secondary">Cargando...</h5>
        <p className="text-muted small">Por favor, espera un momento.</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Stack
        direction="horizontal"
        gap={3}
        className="mb-4 pb-3 border-bottom align-items-center justify-content-between"
      >
        <div>
          <h1 className="fs-3 fw-bold text-primary">Descuentos</h1>
          <p className="text-muted m-0">
            Gestión de descuentos aplicados a paquetes turísticos.
          </p>
        </div>
        <Button
          variant="outline-danger"
          className="ms-auto fw-bold"
          onClick={() => navigate(-1)}
        >
          Cancelar
        </Button>
      </Stack>

      <Stack>
        <Form onSubmit={handleSubmit}>
          <div>
            <p className="fw-semibold text-primary fs-6">
              Configuración global
            </p>

            <Form.Check
              className="mb-3 fw-medium small"
              type="switch"
              id="custom-switch"
              label="Descuentos acumulables"
              checked={combinableDiscounts}
              onChange={(e) => setCombinableDiscounts(e.target.checked)}
              required
            />

            <Form.Label className="fw-medium small">
              Límite de descuento máximo
            </Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                id="max-discount"
                type="number"
                min={0}
                max={100}
                value={maxDiscountLimit}
                onChange={(e) => setMaxDiscountLimit(Number(e.target.value))}
                onFocus={(e) => e.target.select()} // Se añade selección automática
                required
              />
              <InputGroup.Text id="basic-addon3">%</InputGroup.Text>
            </InputGroup>
          </div>

          <div>
            <p className="fw-semibold text-primary fs-6">
              Por Cantidad de Pasajeros
            </p>

            <Form.Label className="fw-medium small">
              Mínimo de pasajeros
            </Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                id="min-passengers"
                type="number"
                min={1}
                max={100}
                value={minPassengers}
                onChange={(e) => setMinPassengers(Number(e.target.value))}
                onFocus={(e) => e.target.select()} // Se añade selección automática
                required
              />
              <InputGroup.Text id="basic-addon3">pasajeros</InputGroup.Text>
            </InputGroup>

            <Form.Label className="fw-medium small">
              Cantidad de descuento
            </Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                id="discount-passengers"
                type="number"
                min={0}
                max={100}
                value={discountPassengers}
                onChange={(e) => setDiscountPassengers(Number(e.target.value))}
                onFocus={(e) => e.target.select()} // Se añade selección automática
                required
              />
              <InputGroup.Text id="basic-addon3">%</InputGroup.Text>
            </InputGroup>
          </div>

          <div>
            <p className="fw-semibold text-primary fs-6">
              Por Historial de Reservas
            </p>

            <Form.Label className="fw-medium small">
              Mínimo de reservas
            </Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                id="min-reservations"
                type="number"
                min={1}
                max={100}
                value={minReservations}
                onChange={(e) => setMinReservations(Number(e.target.value))}
                onFocus={(e) => e.target.select()} // Se añade selección automática
                required
              />
              <InputGroup.Text id="basic-addon3">reservas</InputGroup.Text>
            </InputGroup>

            <Form.Label className="fw-medium small">
              Cantidad de descuento
            </Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                id="discount-reservations"
                type="number"
                min={0}
                max={100}
                value={discountReservations}
                onChange={(e) =>
                  setDiscountReservations(Number(e.target.value))
                }
                onFocus={(e) => e.target.select()} // Se añade selección automática
                required
              />
              <InputGroup.Text id="basic-addon3">%</InputGroup.Text>
            </InputGroup>
          </div>

          <div>
            <p className="fw-semibold text-primary fs-6">
              Por Compra de Múltiples Paquetes
            </p>
            <Form.Label className="fw-medium small">
              Intervalo de tiempo (días)
            </Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                id="days-window"
                type="number"
                min={0}
                value={daysWindow}
                onChange={(e) => setDaysWindow(Number(e.target.value))}
                onFocus={(e) => e.target.select()} // Se añade selección automática
                required
              />
              <InputGroup.Text id="basic-addon3">días</InputGroup.Text>
            </InputGroup>

            <Form.Label className="fw-medium small">
              Mínimo de paquetes
            </Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                id="multiple-packages"
                type="number"
                min={1}
                max={100}
                value={minReservationsMultiplePackages}
                onChange={(e) =>
                  setMinReservationsMultiplePackages(Number(e.target.value))
                }
                onFocus={(e) => e.target.select()} // Se añade selección automática
                required
              />
              <InputGroup.Text id="basic-addon3">paquetes</InputGroup.Text>
            </InputGroup>

            <Form.Label className="fw-medium small">
              Cantidad de descuento
            </Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                id="discount-multiple"
                type="number"
                min={0}
                max={100}
                value={discountMultiplePackages}
                onChange={(e) =>
                  setDiscountMultiplePackages(Number(e.target.value))
                }
                onFocus={(e) => e.target.select()} // Se añade selección automática
                required
              />
              <InputGroup.Text id="basic-addon3">%</InputGroup.Text>
            </InputGroup>
          </div>

          <Button
            type="submit"
            className="my-3 w-100 fw-semibold"
            variant="primary"
          >
            Confirmar cambios
          </Button>
        </Form>
      </Stack>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cambios realizados</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Se han actualizado correctamente los descuentos a los paquetes.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => navigate("/tour-packages-admin")}
          >
            Aceptar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default DiscountsPage;
