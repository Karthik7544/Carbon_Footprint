import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateSubmission } from "@workspace/api-client-react";
import { calculateFootprint, type FootprintResult } from "@/lib/emissions";

interface QuizProps {
  onComplete: (result: FootprintResult & { city: string }) => void;
}

const DIET_OPTIONS = [
  { key: "vegan", label: "Vegan", desc: "No animal products" },
  { key: "vegetarian", label: "Vegetarian", desc: "No meat, some dairy/eggs" },
  { key: "occasional", label: "Occasional meat", desc: "Meat a few times a week" },
  { key: "regular", label: "Regular meat-eater", desc: "Meat most days" },
  { key: "beef_heavy", label: "Beef-heavy diet", desc: "Red meat daily" },
];

const TRANSPORT_OPTIONS = [
  { key: "walking", label: "Walking / Running", desc: "Zero emissions" },
  { key: "cycling", label: "Cycling", desc: "Zero emissions" },
  { key: "metro", label: "Metro / Train", desc: "0.03 kg/km" },
  { key: "bus", label: "Bus", desc: "0.04 kg/km" },
  { key: "auto", label: "Auto / Rickshaw", desc: "0.09 kg/km" },
  { key: "cng_car", label: "CNG Car", desc: "0.12 kg/km" },
  { key: "petrol_car", label: "Petrol Car", desc: "0.17 kg/km" },
  { key: "diesel_car", label: "Diesel Car", desc: "0.19 kg/km" },
];

const ENERGY_OPTIONS = [
  { key: "solar", label: "Solar / Renewables", desc: "0.04 kg CO₂/kWh" },
  { key: "mixed", label: "Mixed grid", desc: "0.40 kg CO₂/kWh" },
  { key: "india_grid", label: "Standard Indian grid", desc: "0.71 kg CO₂/kWh" },
];

const FLIGHT_OPTIONS = [
  { key: "0", label: "None", desc: "No flights last year" },
  { key: "5", label: "1–2 short trips", desc: "~5 hrs total" },
  { key: "15", label: "3–5 domestic flights", desc: "~15 hrs total" },
  { key: "30", label: "6–10 flights", desc: "~30 hrs total" },
  { key: "60", label: "Frequent flyer", desc: "60+ hrs/year" },
];

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export default function Quiz({ onComplete }: QuizProps) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [city, setCity] = useState("");
  const [diet, setDiet] = useState("");
  const [transport, setTransport] = useState("");
  const [energy, setEnergy] = useState("");
  const [flightHours, setFlightHours] = useState("0");

  const createSubmission = useCreateSubmission();

  const steps = ["Your City", "Your Diet", "Your Transport", "Your Energy", "Your Flights"];
  const progress = ((step) / steps.length) * 100;

  const next = () => { setDir(1); setStep(s => s + 1); };
  const prev = () => { setDir(-1); setStep(s => s - 1); };

  const handleSubmit = async () => {
    const result = calculateFootprint(diet, transport, energy, parseFloat(flightHours));
    createSubmission.mutate({
      data: {
        city,
        totalCO2: result.totalCO2,
        dietScore: result.dietScore,
        transportScore: result.transportScore,
        energyScore: result.energyScore,
        shoppingScore: result.shoppingScore,
      }
    });
    onComplete({ ...result, city });
  };

  const canAdvance = [
    city.trim().length > 0,
    diet !== "",
    transport !== "",
    energy !== "",
    flightHours !== "",
  ][step];

  return (
    <section
      id="quiz"
      className="min-h-screen flex flex-col items-center justify-center py-24 px-6"
      style={{ background: "linear-gradient(180deg, #07100f 0%, #0d1f18 100%)" }}
    >
      <div className="max-w-xl w-full">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-400/60 mb-3 font-medium">
            Step {step + 1} of {steps.length}
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            {steps[step]}
          </h2>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #22c55e, #10b981)" }}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {step === 0 && (
              <div>
                <p className="text-white/60 text-sm mb-6 text-center">Which city do you live in?</p>
                <input
                  data-testid="input-city"
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Mumbai, Delhi, Bangalore..."
                  className="w-full px-5 py-4 rounded-xl text-white text-lg font-medium outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(34,197,94,0.3)",
                    caretColor: "#22c55e",
                  }}
                  onKeyDown={e => e.key === "Enter" && city.trim() && next()}
                  autoFocus
                />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                <p className="text-white/60 text-sm mb-6 text-center">What best describes your diet?</p>
                {DIET_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    data-testid={`diet-${opt.key}`}
                    onClick={() => setDiet(opt.key)}
                    className="w-full flex items-center justify-between px-5 py-4 rounded-xl text-left transition-all"
                    style={{
                      background: diet === opt.key ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${diet === opt.key ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    <div>
                      <div className="text-white font-semibold">{opt.label}</div>
                      <div className="text-white/40 text-xs mt-0.5">{opt.desc}</div>
                    </div>
                    {diet === opt.key && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#22c55e" }}>
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="#07100f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-2">
                <p className="text-white/60 text-sm mb-6 text-center">How do you typically get around?</p>
                {TRANSPORT_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    data-testid={`transport-${opt.key}`}
                    onClick={() => setTransport(opt.key)}
                    className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-left transition-all"
                    style={{
                      background: transport === opt.key ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${transport === opt.key ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    <div>
                      <div className="text-white font-semibold text-sm">{opt.label}</div>
                      <div className="text-white/40 text-xs">{opt.desc}</div>
                    </div>
                    {transport === opt.key && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#22c55e" }}>
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="#07100f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <p className="text-white/60 text-sm mb-6 text-center">What powers your home?</p>
                {ENERGY_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    data-testid={`energy-${opt.key}`}
                    onClick={() => setEnergy(opt.key)}
                    className="w-full flex items-center justify-between px-5 py-4 rounded-xl text-left transition-all"
                    style={{
                      background: energy === opt.key ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${energy === opt.key ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    <div>
                      <div className="text-white font-semibold">{opt.label}</div>
                      <div className="text-white/40 text-xs mt-0.5">{opt.desc}</div>
                    </div>
                    {energy === opt.key && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#22c55e" }}>
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="#07100f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3">
                <p className="text-white/60 text-sm mb-6 text-center">How much did you fly last year?</p>
                {FLIGHT_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    data-testid={`flight-${opt.key}`}
                    onClick={() => setFlightHours(opt.key)}
                    className="w-full flex items-center justify-between px-5 py-4 rounded-xl text-left transition-all"
                    style={{
                      background: flightHours === opt.key ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${flightHours === opt.key ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    <div>
                      <div className="text-white font-semibold">{opt.label}</div>
                      <div className="text-white/40 text-xs mt-0.5">{opt.desc}</div>
                    </div>
                    {flightHours === opt.key && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#22c55e" }}>
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="#07100f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              data-testid="button-prev"
              onClick={prev}
              className="px-6 py-3.5 rounded-xl text-white/60 font-medium transition-all hover:text-white"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Back
            </button>
          )}
          <button
            data-testid="button-next"
            onClick={step === steps.length - 1 ? handleSubmit : next}
            disabled={!canAdvance || createSubmission.isPending}
            className="flex-1 py-3.5 rounded-xl font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canAdvance ? "linear-gradient(135deg, #22c55e, #10b981)" : "rgba(255,255,255,0.06)",
              color: canAdvance ? "#07100f" : "rgba(255,255,255,0.3)",
            }}
          >
            {step === steps.length - 1
              ? (createSubmission.isPending ? "Calculating..." : "Calculate my footprint")
              : "Continue"}
          </button>
        </div>
      </div>
    </section>
  );
}
