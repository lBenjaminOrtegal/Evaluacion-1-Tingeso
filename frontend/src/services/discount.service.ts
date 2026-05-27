import httpClient from "../http-common";
import type { Discount } from "../interfaces/discount.interface";

const getDiscounts = () => {
  return httpClient.get("/api/discounts");
};

const update = (data: Discount) => {
  return httpClient.put("/api/discounts", data);
};

export default {
  getDiscounts,
  update,
};
