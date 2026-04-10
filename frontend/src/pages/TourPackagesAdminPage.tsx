import React, { useEffect, useState } from "react";
import { Button, Table, Stack, Container, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import tourPackageService from "../services/tourPackage.service";
import type { TourPackage } from "../interfaces/tourPackage.interface";

function TourPackagesAdminPage() {
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);

  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const getTourPackages = async () => {
    try {
      const response = await tourPackageService.getAll();
      setTourPackages(response.data);
    } catch (error) {
      console.error("Error cargando paquetes:", error);
    }
  };

  const handleDelete = async (id: number) => {
    await tourPackageService.deleteById(id);
    setIdToDelete(null);
    getTourPackages();
  };

  useEffect(() => {
    getTourPackages();
  }, []);

  const getStateColor = (state: string) => {
    const variants: Record<string, string> = {
      AVAILABLE: "text-success",
      SOLD_OUT: "text-danger",
      NOT_AVAILABLE: "text-muted",
      CANCELED: "text-warning",
    };
    return variants[state] || "text-dark";
  };

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

      <Table bordered hover responsive className="align-middle text-center">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Destino</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Precio</th>
            <th>Cupos</th>
            <th>Estado</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tourPackages.map((tour) => (
            <tr key={tour.id}>
              <td>{tour.id}</td>
              <td className="fw-bold">{tour.name}</td>
              <td className="text-muted">{tour.destiny}</td>
              <td>{new Date(tour.startDate).toLocaleDateString()}</td>
              <td>{new Date(tour.endDate).toLocaleDateString()}</td>
              <td>{tour.price.toLocaleString()}</td>
              <td>{tour.spots}</td>
              <td
                className={`fw-semibold ${getStateColor(tour.tourPackageState)}`}
              >
                {tour.tourPackageState}
              </td>
              <td>{tour.category}</td>
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
        <Modal.Body>¿Seguro que quieres eliminar el paquete ID: {idToDelete}?</Modal.Body>
        <Modal.Footer>
          <Button className="fw-bold btn-secondary" onClick={() => setIdToDelete(null)}>
            Cancelar
          </Button>
          <Button className="fw-bold btn-danger" onClick={() => handleDelete(idToDelete!)}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default TourPackagesAdminPage;
