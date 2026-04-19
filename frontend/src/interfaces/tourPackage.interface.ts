export interface TourPackage {
  id: number;
  name: string;
  destiny: string;
  description: string;
  startDate: string;
  endDate: string;
  duration: string;
  price: number;
  services: string[];
  conditions: string[];
  restrictions: string[];
  remainingSpots: number;
  initialSpots: number;
  tripType: string;
  season: string;
  category: string;
  tourPackageState: string;
}
