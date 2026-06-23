import React from "react";
import { Modal, Button } from "react-bootstrap";

interface ErrorResponseModalProps {
  show: boolean;
  onClose: () => void;
  error: unknown;
  defaultMessage?: string;
}

export const ErrorResponseModal: React.FC<ErrorResponseModalProps> = ({
  show,
  onClose,
  error,
  defaultMessage = "Ocurrió un problema inesperado al intentar procesar la solicitud. Por favor, inténtalo de nuevo más tarde.",
}) => {
  const getErrorMessage = (): string => {
    if (!error) return defaultMessage;
    const err = error as any;
    if (err.response && err.response.data) {
      return (
        err.response.data.message ||
        err.response.data.error ||
        "Error interno en el servidor."
      );
    } else if (err.request) {
      return "No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.";
    } else {
      return err.message || defaultMessage;
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton className="bg-danger text-white border-0 py-3">
        <Modal.Title>Error del Sistema</Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-4">{getErrorMessage()}</Modal.Body>
      <Modal.Footer>
        <Button className="fw-bold" variant="secondary" onClick={onClose}>
          Aceptar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
