export const FOOD_FACTORS: Record<string, number> = {
  vegan: 0.9,
  vegetarian: 1.4,
  occasional: 2.1,
  regular: 3.3,
  beef_heavy: 6.0,
};

export const TRANSPORT_FACTORS: Record<string, number> = {
  walking: 0.0,
  cycling: 0.0,
  metro: 0.03,
  bus: 0.04,
  auto: 0.09,
  cng_car: 0.12,
  petrol_car: 0.17,
  diesel_car: 0.19,
};

export const ENERGY_FACTORS: Record<string, number> = {
  solar: 0.04,
  mixed: 0.40,
  india_grid: 0.71,
};

export const FLIGHT_FACTOR = 0.13;
export const INDIA_AVG = 1900;
export const GLOBAL_AVG = 4800;
export const PARIS_TARGET = 2000;

export interface FootprintResult {
  totalCO2: number;
  dietCO2: number;
  transportCO2: number;
  energyCO2: number;
  shoppingCO2: number;
  dietScore: number;
  transportScore: number;
  energyScore: number;
  shoppingScore: number;
  topCategory: string;
}

export function calculateFootprint(
  diet: string,
  transport: string,
  energyType: string,
  flightHours: number,
): FootprintResult {
  const dietCO2 = (FOOD_FACTORS[diet] ?? 2.1) * 365;
  const transportCO2 = (TRANSPORT_FACTORS[transport] ?? 0.09) * 20 * 365;
  const energyCO2 = (ENERGY_FACTORS[energyType] ?? 0.71) * 250 * 12;
  const shoppingCO2 = flightHours * 800 * FLIGHT_FACTOR;
  const totalCO2 = dietCO2 + transportCO2 + energyCO2 + shoppingCO2;

  const toScore = (v: number) => Math.min(100, Math.round((v / totalCO2) * 100));

  const scores = {
    diet: toScore(dietCO2),
    transport: toScore(transportCO2),
    energy: toScore(energyCO2),
    shopping: toScore(shoppingCO2),
  };

  const topCategory = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];

  return {
    totalCO2,
    dietCO2,
    transportCO2,
    energyCO2,
    shoppingCO2,
    dietScore: scores.diet,
    transportScore: scores.transport,
    energyScore: scores.energy,
    shoppingScore: scores.shopping,
    topCategory,
  };
}

export function getLevel(totalCO2: number): { label: string; color: string } {
  if (totalCO2 < 1000) return { label: "Carbon Hero", color: "#22c55e" };
  if (totalCO2 < PARIS_TARGET) return { label: "Climate Aware", color: "#86efac" };
  if (totalCO2 < INDIA_AVG) return { label: "Below Average", color: "#fbbf24" };
  if (totalCO2 < GLOBAL_AVG) return { label: "Above Average", color: "#f97316" };
  return { label: "High Impact", color: "#ef4444" };
}
