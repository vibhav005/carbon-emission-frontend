// types/carbon.ts
export type TransportMode = "car" | "bus" | "train" | "plane";

export interface CarbonEntry {
  distance: number;
  mode: TransportMode;
  carbonFootprint: string | number;
  recommendation: string;
  date: string;
}

export interface CalculateResponse {
  carbonFootprint: string;
}

export interface RecommendationResponse {
  recommendation: string;
}

export interface CarbonStore {
  history: CarbonEntry[];
  addEntry: (entry: Omit<CarbonEntry, "date"> & { date?: string }) => void;
  removeEntry: (index: number) => void;
  clearHistory: () => void;
}

export interface ModeStats {
  [key: string]: {
    count: number;
    totalEmissions: number;
    totalDistance: number;
  };
}

export interface ChartDataPoint {
  name: string;
  emissions: string | number;
  distance?: number;
  count?: number;
  mode?: TransportMode;
}
