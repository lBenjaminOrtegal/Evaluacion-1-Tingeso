export interface TourPackage {
  id: number;
  name: string;
  destiny: string;
  description: string;
  startDate: string;
  endDate: string;
  availableDates: string[];
  duration: string;
  price: number;
  services: string[];
  conditions: string[];
  restrictions: string[];
  spots: number;
  tripType: string;
  season: string;
  category: string;
  tourPackageState: string;
}
