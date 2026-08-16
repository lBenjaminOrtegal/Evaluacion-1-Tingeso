import httpClient from "../http-common";
import type {TourPackage} from "../interfaces/tourPackage.interface";
import type {TourPackageFilters} from "../interfaces/tourPackageFilters.interface.ts";

const getAll = () => {
    return httpClient.get("/api/tour-packages");
};

const getById = (id: number) => {
    return httpClient.get(`/api/tour-packages/${id}`);
};

const getByCustomFilters = (filters: TourPackageFilters) => {
    const cleanParams = Object.fromEntries(
        Object.entries(filters).filter(
            ([_, value]) => value !== "" && value !== undefined && value !== null
        )
    );
    return httpClient.get(`/api/tour-packages/filters`, {
        params: cleanParams,
    });
}

const create = (data: TourPackage) => {
    return httpClient.post("/api/tour-packages", data);
};

const update = (data: TourPackage) => {
    return httpClient.put("/api/tour-packages", data);
};

const deleteById = (id: number) => {
    return httpClient.delete(`/api/tour-packages/${id}`);
};

export default {
    getAll,
    getById,
    getByCustomFilters,
    create,
    update,
    deleteById,
};
