import type { JourneyZone } from "@/lib/journey";

export const JOURNEY_ZONES: JourneyZone[] = [
  {
    id: "transport",
    title: "Transportation",
    subtitle: "How do you get around today?",
    choices: [
      { id: "bicycle", label: "Bicycle", impact: "~0 kg CO₂/km", delta: 10 },
      { id: "bus", label: "Public Bus", impact: "~0.04 kg CO₂/km", delta: 6 },
      { id: "metro", label: "Metro", impact: "~0.03 kg CO₂/km", delta: 8 },
      { id: "car", label: "Personal Car", impact: "~0.17 kg CO₂/km", delta: -12 },
    ],
  },
  {
    id: "food",
    title: "Food",
    subtitle: "What's on your plate today?",
    choices: [
      { id: "local", label: "Local seasonal food", impact: "Low food miles", delta: 9 },
      { id: "plant", label: "Plant-based meal", impact: "~0.9 kg CO₂/day", delta: 8 },
      { id: "fast", label: "Fast food", impact: "High packaging & transport", delta: -8 },
      { id: "high", label: "High-emission meal", impact: "~3+ kg CO₂/meal", delta: -12 },
    ],
  },
  {
    id: "shopping",
    title: "Shopping",
    subtitle: "You need something new. What do you choose?",
    choices: [
      { id: "repair", label: "Repair existing item", impact: "Near-zero new emissions", delta: 10 },
      { id: "secondhand", label: "Buy second-hand", impact: "Extends product life", delta: 7 },
      { id: "new", label: "Buy new item", impact: "Manufacturing footprint", delta: -6 },
      { id: "fast_fashion", label: "Fast-fashion purchase", impact: "High waste & emissions", delta: -14 },
    ],
  },
  {
    id: "digital",
    title: "Digital Life",
    subtitle: "Your online habits matter too.",
    hint: "Streaming, cloud storage, and always-on devices run on data centers that consume vast amounts of electricity.",
    choices: [
      { id: "delete_cloud", label: "Delete unused cloud storage", impact: "Less server demand", delta: 8 },
      { id: "stream_ok", label: "Stream responsibly", impact: "Moderate data use", delta: 4 },
      { id: "cloud_bloat", label: "Keep excessive cloud backups", impact: "24/7 server load", delta: -7 },
      { id: "heavy_digital", label: "Heavy unnecessary digital consumption", impact: "High energy demand", delta: -10 },
    ],
  },
  {
    id: "energy",
    title: "Home Energy",
    subtitle: "How does your home use power?",
    choices: [
      { id: "led", label: "LED lighting", impact: "~80% less energy", delta: 7 },
      { id: "efficient", label: "Energy-efficient appliances", impact: "Lower grid draw", delta: 8 },
      { id: "solar", label: "Solar energy", impact: "Clean power source", delta: 12 },
      { id: "wasteful", label: "Wasteful energy usage", impact: "High grid emissions", delta: -15 },
    ],
  },
];

export const ZONE_WIDTH = 720;
export const WORLD_WIDTH = JOURNEY_ZONES.length * ZONE_WIDTH;
export const WORLD_HEIGHT = 520;
