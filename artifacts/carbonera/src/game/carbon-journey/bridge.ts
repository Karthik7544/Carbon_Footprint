import type { JourneyChoice, JourneyResult, JourneyZone } from "@/lib/journey";

export interface ChoiceRequestPayload {
  zoneIndex: number;
  zone: JourneyZone;
  choices: JourneyChoice[];
}

export interface JourneyBridge {
  onChoiceRequest?: (payload: ChoiceRequestPayload) => void;
  onHealthChange?: (health: number, impactLabel: string) => void;
  onZoneEnter?: (zoneIndex: number, title: string) => void;
  onComplete?: (result: JourneyResult) => void;
  resolveChoice?: (choiceId: string) => void;
}

export function createJourneyBridge(): JourneyBridge {
  return {};
}
