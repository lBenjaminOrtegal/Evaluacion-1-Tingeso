import React, { useEffect, useState } from "react";
import { Button, Table, Stack, Container, Modal, Badge, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import tourPackageService from "../services/tourPackage.service";
import type { TourPackage } from "../interfaces/tourPackage.interface";

function TourPackagesAdminPage() {
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);

  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const getTourPackages = async () => {
    try {
      setLoading(true);
      const response = await tourPackageService.getAll();
      setTourPackages(response.data);
    } catch (error) {
      console.error("Error cargando paquetes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (idToDelete === null) return;
    try {
      setLoading(true);
      await tourPackageService.deleteById(idToDelete);
      setIdToDelete(null);
      await getTourPackages();
    } catch (error) {
      console.error("No se pudo eliminar el paquete:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTourPackages();
  }, []);

  const getStateColor = (state: string) => {
    const variants: Record<string, string> = {
      AVAILABLE: "bg-success",
      SOLD_OUT: "bg-danger",
      NOT_AVAILABLE: "bg-secondary",
      CANCELED: "bg-warning",
    };
    return variants[state] || "bg-light";
  };

  const getCategoryColor = (category: string) => {
    const variants: Record<string, string> = {
      LOW_COST: "bg-success",
      STANDARD: "bg-primary",
      PREMIUM: "bg-dark",
    };
    return variants[category] || "bg-light";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount);
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
        className="mb-4 pb-3 border-bottom align-items-center"
      >
        <div>
          <h1 className="fs-3 fw-bold text-primary">Paquetes Turísticos</h1>
          <p className="text-muted m-0">
            Publicación y gestión de paquetes turísticos.
          </p>
        </div>
        <Button
          as={Link as any}
          to="/tour-packages-admin/add"
          variant="success"
          className="ms-auto"
        >
          Agregar paquete
        </Button>
      </Stack>

      <Table bordered hover responsive className="align-middle">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Destino</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Precio</th>
            <th className="text-center">Cupos</th>
            <th className="text-center">Estado</th>
            <th className="text-center">Categoría</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tourPackages.length <= 0 && (
            <tr>
              <td colSpan={7} className="text-center py-4">
                No hay paquetes túristicos registrados.
              </td>
            </tr>
          )}

          {tourPackages.map((tour) => (
            <tr key={tour.id}>
              <td className="text-muted">#{tour.id}</td>
              <td className="fw-medium">{tour.name}</td>
              <td className="text-muted">{tour.destiny}</td>
              <td>{tour.startDate}</td>
              <td>{tour.endDate}</td>
              <td className="fw-bold text-success">
                {formatCurrency(tour.price)}
              </td>
              <td className="text-center">{tour.remainingSpots}</td>
              <td className="text-center">
                <Badge
                  className={`fw-semibold ${getStateColor(tour.tourPackageState)}`}
                >
                  {tour.tourPackageState}
                </Badge>
              </td>
              <td className="text-center">
                <Badge
                  className={`fw-semibold ${getCategoryColor(tour.category)}`}
                >
                  {tour.category}
                </Badge>
              </td>
              <td>
                <Stack
                  className="justify-content-center"
                  direction="horizontal"
                  gap={2}
                >
                  <Button
                    as={Link as any}
                    to={`/tour-packages-admin/edit/${tour.id}`}
                    className="fw-semibold w-50"
                    variant="primary"
                    size="sm"
                  >
                    Editar
                  </Button>
                  <Button
                    className="fw-semibold w-50"
                    variant="danger"
                    size="sm"
                    onClick={() => setIdToDelete(tour.id)}
                  >
                    Eliminar
                  </Button>
                </Stack>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={idToDelete !== null} onHide={() => setIdToDelete(null)}>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-center">Eliminar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar el paquete con ID:{" "}
          <strong>#{idToDelete}</strong>? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="fw-bold btn-secondary"
            onClick={() => setIdToDelete(null)}
          >
            Cancelar
          </Button>
          <Button className="fw-bold btn-danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default TourPackagesAdminPage;
