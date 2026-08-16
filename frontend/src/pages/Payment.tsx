import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import reservationService from "../services/reservation.service";
import {
  Button,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Spinner,
  Stack,
} from "react-bootstrap";
import type { Reservation } from "../interfaces/reservation.interface";
import type { TourPackage } from "../interfaces/tourPackage.interface";
import tourPackageService from "../services/tourPackage.service";
import transactionService from "../services/transaction.service";
import type { Transaction } from "../interfaces/transaction.interface";
import formatCurrency from "../utils/formatUtils";
import {
  getPaymentMethodWord,
  getTransactionStateWord,
} from "../utils/colorUtils";
import { ErrorResponseModal } from "../components/ErrorResponseModal";

function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [apiError, setApiError] = useState<unknown>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [reservation, setReservation] = useState<Reservation>();
  const [tourPackage, setTourPackage] = useState<TourPackage>();
  const [creditCard, setCreditCard] = useState<string>("");
  const [cvv, setCvv] = useState<string>("");
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [createdTransaction, setCreatedTransaction] = useState<Transaction>();

  const getData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const reservationResponse = await reservationService.getById(Number(id));
      const reservationData: Reservation = reservationResponse.data;
      setReservation(reservationData);

      const tourPackageResponse = await tourPackageService.getById(
        reservationData.tourPackageId,
      );
      setTourPackage(tourPackageResponse.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setApiError(error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    getData();
  }, []);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!reservation) return;

    if (creditCard.length !== 16) {
      alert("La tarjeta debe tener 16 dígitos.");
      return;
    }

    if (cvv.length < 3) {
      alert("El CVV no es válido.");
      return;
    }

    if (expirationDate.length !== 5) {
      alert("El formato de fecha debe ser MM/AA.");
      return;
    }

    var newTransaction: Partial<Transaction> = {
      amount: reservation.price,
      reservationId: reservation.id,
      paymentMethod: "CREDIT_CARD",
    };

    try {
      setLoading(true);
      const response = await transactionService.successfulTransaction();
      const isSuccess = response.data;
      console.log(isSuccess);

      if (isSuccess === true) {
        const response = await transactionService.create(
          newTransaction as Transaction,
        );
        const transactionData = response.data;
        setCreatedTransaction(transactionData);
        setShow(true);
      } else {
        console.log("pago rechazado");
        alert("El pago fue rechazado.");
      }
    } catch (error) {
      console.error("Error procesando la transacción:", error);
      setApiError(error);
      setShowError(true);
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

  if (reservation?.reservationState !== "PENDING") {
    return (
      <Stack gap={3} className="mb-4 py-4 align-items-center text-center">
        <div>
          <h1 className="fs-3 fw-bold text-danger">Acción no disponible</h1>
          <p className="text-muted m-0">
            El pago de la reserva número #{reservation?.id} ya se ha realizado o
            no está disponible.
          </p>
          <Button
            variant="link"
            className="ms-auto fw-bold text-decoration-none"
            onClick={() => navigate("/reservations")}
          >
            Haz click aquí para regresar a tus reservas.
          </Button>
        </div>
      </Stack>
    );
  }

  return (
    <Container className="py-4">
      <ErrorResponseModal
        show={showError}
        onClose={() => setShowError(false)}
        error={apiError}
      />
      <Modal show={show} onHide={() => navigate("/reservations")}>
        <Modal.Header closeButton className="bg-light border-0 py-3">
          <Modal.Title className="fw-bold text-center">
            Transacción{" "}
            {getTransactionStateWord(String(createdTransaction?.state))}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Stack>
            <p className="fw-medium text-muted">
              ID de la transacción:{" "}
              <span className="fw-semibold text-dark">
                #{createdTransaction?.id}
              </span>
            </p>
            <p className="fw-medium text-muted">
              Monto de la transacción:{" "}
              <span className="fw-semibold text-dark">
                {formatCurrency(Number(createdTransaction?.amount))} CLP
              </span>
            </p>
            <p className="fw-medium text-muted">
              Método de pago:{" "}
              <span className="fw-semibold text-dark">
                {getPaymentMethodWord(
                  String(createdTransaction?.paymentMethod),
                )}
              </span>
            </p>
            <p className="fw-medium text-muted">
              Fecha de la transacción:{" "}
              <span className="fw-semibold text-dark">
                {createdTransaction?.date.substring(0, 10) +
                  " (" +
                  createdTransaction?.date.substring(11, 19) +
                  ")"}
              </span>
            </p>
            <p className="fw-medium text-muted">
              Reserva asociada:{" "}
              <span className="fw-semibold text-dark">
                #{createdTransaction?.reservationId}
              </span>
            </p>
          </Stack>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="fw-bold"
            variant="primary"
            onClick={() => navigate("/reservations")}
          >
            Aceptar
          </Button>
        </Modal.Footer>
      </Modal>
      <Stack
        direction="horizontal"
        gap={3}
        className="mb-4 pb-3 border-bottom align-items-center"
      >
        <div>
          <h1 className="fs-3 fw-bold text-primary">Pago</h1>
          <p className="text-muted m-0">
            Seleccione su método de pago e ingrese la información respectiva
            para completar la transacción.
          </p>
        </div>
        <Button
          variant="outline-primary"
          className="ms-auto fw-bold"
          onClick={() => navigate(-1)}
        >
          Regresar
        </Button>
      </Stack>
      <Row>
        <Col className="border-end">
          <Stack gap={3} className="p-3">
            <h2 className="fs-5 fw-bold text-center mb-2">
              Resumen de la reserva
            </h2>

            <Stack gap={3}>
              <div className="border-bottom pb-3">
                <small className="text-muted fw-bold">Paquete Turístico</small>
                <p className="fs-6 fw-bold mb-1">{tourPackage?.name}</p>
                <p className="fs-6 text-muted mb-0">
                  Del <strong>{tourPackage?.startDate}</strong> al{" "}
                  <strong>{tourPackage?.endDate}</strong>
                </p>
              </div>

              <div className="border-bottom pb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted fw-medium">ID de la reserva</span>
                  <span className="fw-bold text-dark">#{reservation.id}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted fw-medium">
                    Cantidad de pasajeros
                  </span>
                  <span className="fw-bold text-dark">
                    {reservation.passengersAmount}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted fw-medium">
                    Precio por persona
                  </span>
                  <span className="fw-semibold text-dark">
                    {formatCurrency(Number(tourPackage?.price))} CLP
                  </span>
                </div>
              </div>

              <Stack
                direction="horizontal"
                className="justify-content-between align-items-center"
              >
                <div>
                  <p className="mb-0 fw-bold h5">Total a pagar</p>
                  <small className="text-muted fw-medium">
                    Incluye descuentos y tasas
                  </small>
                </div>
                <span className="fs-3 fw-bold text-success">
                  {formatCurrency(reservation.price)} CLP
                </span>
              </Stack>
            </Stack>
          </Stack>
        </Col>
        <Col>
          <Stack gap={3} className="p-3">
            <h2 className="fs-5 fw-bold text-center mb-2">Método de pago</h2>
            <Form onSubmit={handleSubmit}>
              <div>
                <Form.Check
                  type="radio"
                  label="Tarjeta de Crédito / Débito"
                  checked={true}
                  className="p-3 m-3 border rounded"
                  onChange={() => null}
                />

                <Stack gap={3} className="px-3 pb-3">
                  <Form.Group>
                    <Form.Label className="small fw-bold">
                      Número de tarjeta
                    </Form.Label>
                    <Form.Control
                      value={creditCard}
                      placeholder="0000 0000 0000 0000"
                      maxLength={16}
                      onChange={(e) =>
                        setCreditCard(e.target.value.replace(/\D/g, ""))
                      }
                      required
                    />
                  </Form.Group>
                  <Row>
                    <Col xs={7}>
                      <Form.Group>
                        <Form.Label className="small fw-bold">
                          Fecha de vencimiento
                        </Form.Label>
                        <Form.Control
                          value={expirationDate}
                          placeholder="MM/AA"
                          maxLength={5}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "");
                            if (val.length > 2)
                              val =
                                val.substring(0, 2) + "/" + val.substring(2, 4);
                            setExpirationDate(val);
                          }}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={5}>
                      <Form.Group>
                        <Form.Label className="small fw-bold">CVV</Form.Label>
                        <Form.Control
                          value={cvv}
                          type="password"
                          inputMode="numeric"
                          placeholder="123"
                          maxLength={3}
                          onChange={(e) =>
                            setCvv(e.target.value.replace(/\D/g, ""))
                          }
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Col>
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100 fw-bold fs-5"
                    >
                      Confirmar Pago
                    </Button>
                  </Col>
                </Stack>
              </div>
            </Form>
          </Stack>
        </Col>
      </Row>
    </Container>
  );
}

export default Payment;