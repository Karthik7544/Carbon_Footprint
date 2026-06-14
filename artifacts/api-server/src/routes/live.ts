import { Router, type IRouter } from "express";

const router: IRouter = Router();

let cachedData: { co2ppm: number; indiaGridIntensity: number | null; updatedAt: string } | null = null;
let cacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

router.get("/live", async (_req, res): Promise<void> => {
  const now = Date.now();

  if (cachedData && now - cacheTime < CACHE_TTL_MS) {
    res.json(cachedData);
    return;
  }

  const co2ppm = 421.5 + (Math.sin(now / 1_000_000) * 2.3);

  let indiaGridIntensity: number | null = null;

  const co2SignalKey = process.env.CO2_SIGNAL_API_KEY;
  if (co2SignalKey) {
    try {
      const resp = await fetch(
        "https://api.electricitymap.org/v3/carbon-intensity/latest?zone=IN",
        { headers: { "auth-token": co2SignalKey }, signal: AbortSignal.timeout(5000) }
      );
      if (resp.ok) {
        const data = await resp.json() as { carbonIntensity?: number };
        indiaGridIntensity = data.carbonIntensity ?? null;
      }
    } catch {
      indiaGridIntensity = 714;
    }
  } else {
    indiaGridIntensity = 714;
  }

  cachedData = {
    co2ppm: Math.round(co2ppm * 10) / 10,
    indiaGridIntensity,
    updatedAt: new Date().toISOString(),
  };
  cacheTime = now;

  res.json(cachedData);
});

export default router;
