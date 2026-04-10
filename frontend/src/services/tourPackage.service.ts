import httpClient from "../http-common"

interface TourPackage {
  id: number;
  name: string;
  destiny: string;
  description: string;
  startDate: Date;
  endDate: Date;
  availableDates: string[];
  duration: string;
  price: number;
  services: string[];
  conditions: string;
  restrictions: string;
  spots: number;
  typeOfTrip: string;
  season: string;
  category: string;
  tourPackageState: "AVAILABLE" | "SOLD_OUT" | "NOT_AVAILABLE" | "CANCELED";
}

const getAll = () => {
    return httpClient.get('/api/tour-packages')
}

const getById = (id:number) => {
    return httpClient.get(`/api/tour-packages/${id}`)
}

const getByCategory = (category:string) => {
    return httpClient.get(`/api/tour-packages/category/${category}`)
}

const getByDestiny = (destiny:string) => {
    return httpClient.get(`/api/tour-packages/destiny/${destiny}`)
}

const getBySeason = (season:string) => {
    return httpClient.get(`/api/tour-packages/season/${season}`)
}

const getBySpots = (spots:number) => {
    return httpClient.get(`/api/tour-packages/spots/${spots}`)
}

const getByAvailableSpots = () => {
    return httpClient.get('/api/tour-packages/spots/0')
}

const getByTypeOfTrips = (typeOfTrip:string) => {
    return httpClient.get(`/api/tour-packages/type-of-trip/${typeOfTrip}`)
}

const getByState = (state:string) => {
    return httpClient.get(`/api/tour-packages/state/${state}`)
}

const create = (data:TourPackage) => {
    return httpClient.post('/api/tour-packages', data)
}

const update = (data:TourPackage) => {
    return httpClient.put('/api/tour-packages', data)
}

const deleteById = (id:number) => {
    return httpClient.delete(`/api/tour-packages/${id}`)
}

export default {
    getAll,
    getById,
    getByCategory,
    getByDestiny,
    getBySeason,
    getBySpots,
    getByAvailableSpots,
    getByTypeOfTrips,
    getByState,
    create,
    update,
    deleteById,
}