import { Router, type IRouter } from "express";
import { GenerateStoryBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/story", async (req, res): Promise<void> => {
  const parsed = GenerateStoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { city, totalCO2, dietScore, transportScore, energyScore, topCategory } = parsed.data;

  const indiaAvg = 1900;
  const globalAvg = 4800;
  const parisTarget = 2000;
  const diff = totalCO2 - indiaAvg;
  const aboveParis = totalCO2 > parisTarget;

  const categoryDescriptions: Record<string, string> = {
    diet: "food and diet choices",
    transport: "transportation and daily commuting",
    energy: "home energy consumption",
    shopping: "consumer purchases and shopping",
  };

  const topDesc = categoryDescriptions[topCategory.toLowerCase()] ?? topCategory;

  const kgSavings = Math.round(totalCO2 * 0.22);
  const treesNeeded = Math.round(totalCO2 / 21);

  const story = [
    `Every year, your choices in ${city} release ${Math.round(totalCO2).toLocaleString()} kg of CO₂ into the atmosphere — ${diff > 0 ? `${Math.round(diff).toLocaleString()} kg above` : `${Math.round(Math.abs(diff)).toLocaleString()} kg below`} the Indian average. If everyone in ${city} lived exactly like you, the city's per-capita emissions would ${diff > 0 ? "exceed" : "fall below"} national baselines. By 2050, a city of 10 million living at your footprint would pump an extra ${Math.round((diff * 10_000_000) / 1_000_000).toLocaleString()} thousand tonnes of CO₂ annually — enough to ${diff > 0 ? "accelerate" : "reduce"} regional temperature rise by a measurable fraction.`,

    `Your single biggest lever is ${topDesc}, which drives ${Math.round(Math.max(dietScore, transportScore, energyScore))}% of your total footprint. Optimising this one category alone could save you roughly ${kgSavings.toLocaleString()} kg CO₂ per year — the equivalent of ${Math.round(kgSavings / 170)} return flights from Delhi to Mumbai. That shift alone would bring you ${aboveParis ? "closer to" : "well within"} the Paris Agreement's 2000 kg per-person target.`,

    `Here is something most people don't know about ${topDesc}: the carbon embedded in your everyday choices compounds invisibly. A single shift — ${topCategory.toLowerCase() === "diet" ? "replacing two meat meals per week with plant-based ones" : topCategory.toLowerCase() === "transport" ? "switching one car trip per day to public transit" : topCategory.toLowerCase() === "energy" ? "switching to a green energy tariff" : "buying fewer but higher-quality items"} — would require planting ${Math.round(kgSavings / 21)} fewer trees to offset. You would need ${treesNeeded.toLocaleString()} trees just to absorb your current annual output. The forest to offset India's total emissions would cover an area twice the size of Rajasthan.`,
  ].join("\n\n");

  res.json({ story });
});

export default router;
