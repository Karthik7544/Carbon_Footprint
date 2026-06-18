import { INDIA_AVG, type FootprintResult } from "@/lib/emissions";

export interface JourneyChoice {
  id: string;
  label: string;
  impact: string;
  delta: number;
}

export interface JourneyZone {
  id: string;
  title: string;
  subtitle: string;
  hint?: string;
  choices: JourneyChoice[];
}

export interface JourneyResult {
  environmentHealth: number;
  choices: { zoneId: string; choiceId: string; label: string; delta: number }[];
  airQuality: string;
  cityCondition: string;
  impactSummary: string;
  collectiveMessage: string;
}

export function seedEnvironmentHealth(result: FootprintResult): number {
  const avgScore =
    (result.dietScore + result.transportScore + result.energyScore + result.shoppingScore) / 4;
  const footprintRatio = result.totalCO2 / INDIA_AVG;
  const fromScores = 62 - avgScore * 0.35;
  const fromFootprint = 58 - (footprintRatio - 1) * 18;
  return Math.round(Math.max(28, Math.min(72, (fromScores + fromFootprint) / 2)));
}

export function clampHealth(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function getAirQuality(health: number): string {
  if (health >= 75) return "Excellent";
  if (health >= 55) return "Good";
  if (health >= 35) return "Moderate";
  if (health >= 15) return "Poor";
  return "Hazardous";
}

export function getCityCondition(health: number): string {
  if (health >= 75) return "Thriving & green";
  if (health >= 55) return "Stable & livable";
  if (health >= 35) return "Under strain";
  if (health >= 15) return "Polluted & stressed";
  return "Severely degraded";
}

export function getImpactSummary(health: number): string {
  if (health >= 70) {
    return "You made several low-carbon choices today.";
  }
  if (health >= 45) {
    return "Your daily habits have a mixed environmental impact.";
  }
  return "Your daily habits create a higher environmental impact than average.";
}

export function getCollectiveMessage(health: number): string {
  const base =
    "If everyone made choices similar to yours, this is the kind of environment we would create.";
  if (health >= 70) {
    return `${base} Cleaner skies, greener streets, and healthier cities would follow.`;
  }
  if (health >= 45) {
    return `${base} Our cities would face growing pressure, but thoughtful shifts could still turn things around.`;
  }
  return `${base} More smog, fewer trees, and strained resources would become the norm.`;
}

export function getCurrentImpactLabel(delta: number): string {
  if (delta >= 8) return "Strong positive impact";
  if (delta >= 3) return "Low carbon impact";
  if (delta >= -2) return "Neutral impact";
  if (delta >= -8) return "Moderate emissions";
  return "High carbon impact";
}

export function buildJourneyResult(
  environmentHealth: number,
  choices: JourneyResult["choices"],
): JourneyResult {
  const health = clampHealth(environmentHealth);
  return {
    environmentHealth: health,
    choices,
    airQuality: getAirQuality(health),
    cityCondition: getCityCondition(health),
    impactSummary: getImpactSummary(health),
    collectiveMessage: getCollectiveMessage(health),
  };
}
