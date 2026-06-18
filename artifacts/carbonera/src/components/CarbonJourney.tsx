import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type FootprintResult } from "@/lib/emissions";
import {
  seedEnvironmentHealth,
  type JourneyResult,
  type JourneyZone,
  type JourneyChoice,
} from "@/lib/journey";
import { createJourneyBridge, type ChoiceRequestPayload } from "@/game/carbon-journey/bridge";
import { createCarbonJourneyGame } from "@/game/carbon-journey/createGame";
import type Phaser from "phaser";

interface Props {
  result: FootprintResult & { city: string };
  onComplete: (journeyResult: JourneyResult) => void;
}

type Phase = "intro" | "playing" | "final";

function CityPreview({ health }: { health: number }) {
  const sky =
    health >= 75
      ? "linear-gradient(180deg, #7ec8e3 0%, #a7f3d0 100%)"
      : health >= 55
        ? "linear-gradient(180deg, #6ba3c7 0%, #86efac 100%)"
        : health >= 35
          ? "linear-gradient(180deg, #8a9aab 0%, #a8a29e 100%)"
          : health >= 15
            ? "linear-gradient(180deg, #6b7280 0%, #78716c 100%)"
            : "linear-gradient(180deg, #4b5563 0%, #57534e 100%)";

  const treeCount = health >= 70 ? 5 : health >= 45 ? 3 : health >= 25 ? 2 : 1;
  const smogOpacity = health >= 70 ? 0 : health >= 45 ? 0.2 : health >= 25 ? 0.45 : 0.7;

  return (
    <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-white/10">
      <div className="absolute inset-0" style={{ background: sky }} />
      {smogOpacity > 0 && (
        <div
          className="absolute inset-0"
          style={{ background: "rgba(100,100,100,0.5)", opacity: smogOpacity }}
        />
      )}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-emerald-800/80" />
      <div className="absolute bottom-4 left-0 right-0 flex justify-around px-4">
        {Array.from({ length: treeCount }).map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-500" />
            <div className="w-2 h-5 bg-amber-800 rounded-sm -mt-1" />
          </div>
        ))}
        <div className="flex gap-2 items-end">
          <div className="w-10 h-14 bg-slate-500 rounded-t-sm" />
          <div className="w-8 h-10 bg-slate-600 rounded-t-sm" />
        </div>
      </div>
      {health >= 55 && (
        <div className="absolute top-6 right-8 text-slate-700 text-lg">⌒ ⌒</div>
      )}
    </div>
  );
}

export default function CarbonJourney({ result, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [health, setHealth] = useState(() => seedEnvironmentHealth(result));
  const [impactLabel, setImpactLabel] = useState("Starting conditions");
  const [currentZone, setCurrentZone] = useState("");
  const [choicePanel, setChoicePanel] = useState<ChoiceRequestPayload | null>(null);
  const [journeyResult, setJourneyResult] = useState<JourneyResult | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const bridgeRef = useRef(createJourneyBridge());
  const pendingStartRef = useRef(false);

  const destroyGame = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }
  }, []);

  const initGame = useCallback(() => {
    if (!containerRef.current || gameRef.current) return;

    const bridge = bridgeRef.current;
    const initial = seedEnvironmentHealth(result);

    bridge.onChoiceRequest = (payload) => setChoicePanel(payload);
    bridge.onHealthChange = (h, label) => {
      setHealth(h);
      setImpactLabel(label);
    };
    bridge.onZoneEnter = (_index, title) => setCurrentZone(title);
    bridge.onComplete = (jr) => {
      destroyGame();
      setJourneyResult(jr);
      setChoicePanel(null);
      setPhase("final");
    };
    bridge.resolveChoice = undefined;

    gameRef.current = createCarbonJourneyGame({
      parent: containerRef.current,
      bridge,
      initialHealth: initial,
      city: result.city,
    });

    setHealth(initial);
    setImpactLabel("Starting conditions");
  }, [destroyGame, result]);

  const startGame = () => {
    pendingStartRef.current = true;
    setPhase("playing");
  };

  useEffect(() => {
    if (phase === "playing" && pendingStartRef.current) {
      pendingStartRef.current = false;
      initGame();
    }
  }, [phase, initGame]);

  useEffect(() => () => destroyGame(), [destroyGame]);

  const handleChoice = (choice: JourneyChoice) => {
    bridgeRef.current.resolveChoice?.(choice.id);
    setChoicePanel(null);
  };

  return (
    <section
      id="carbon-journey"
      className="min-h-screen flex flex-col items-center justify-center py-16 px-4 md:px-6"
      style={{ background: "linear-gradient(180deg, #07100f 0%, #0d1f18 100%)" }}
    >
      <div className="max-w-4xl w-full">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="text-center"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-400/60 mb-4 font-medium">
                Carbon Journey
              </p>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                Walk through a day<br />
                <span className="text-emerald-400">in {result.city}</span>
              </h2>
              <p className="text-white/45 text-sm md:text-base max-w-lg mx-auto mb-8 leading-relaxed">
                Explore five everyday zones — transport, food, shopping, digital life, and home energy.
                Each choice shapes the environment around you. Takes about 2–5 minutes.
              </p>
              <button
                data-testid="button-start-journey"
                onClick={startGame}
                className="px-10 py-4 rounded-xl font-bold text-base transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #22c55e, #10b981)", color: "#07100f" }}
              >
                Begin your journey
              </button>
            </motion.div>
          )}

          {phase === "playing" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 px-1">
                <div>
                  <p className="text-xs uppercase tracking-widest text-emerald-400/60 font-medium">
                    {currentZone || "Carbon Journey"}
                  </p>
                  <p className="text-white/40 text-xs mt-1">Arrow keys or WASD to move</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 md:min-w-[180px]">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/50">Environmental Health</span>
                      <span className="text-emerald-400 font-bold">{health}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-white/10">
                      <motion.div
                        className="h-full rounded-full"
                        animate={{ width: `${health}%` }}
                        transition={{ duration: 0.6 }}
                        style={{
                          background:
                            health >= 55
                              ? "linear-gradient(90deg, #22c55e, #86efac)"
                              : health >= 30
                                ? "linear-gradient(90deg, #fbbf24, #f97316)"
                                : "linear-gradient(90deg, #ef4444, #dc2626)",
                        }}
                      />
                    </div>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-[10px] uppercase tracking-wider text-white/40">Current Impact</p>
                    <p className="text-xs text-white/70 font-medium max-w-[140px]">{impactLabel}</p>
                  </div>
                </div>
              </div>

              <div
                ref={containerRef}
                className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                style={{ height: 520, background: "#07100f" }}
              />
            </motion.div>
          )}

          {phase === "final" && journeyResult && (
            <motion.div
              key="final"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-400/60 mb-4 font-medium">
                Your city, your choices
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
                The world you shaped
              </h2>

              <div className="mb-8">
                <CityPreview health={journeyResult.environmentHealth} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
                <StatCard label="Environmental Health" value={`${journeyResult.environmentHealth} / 100`} />
                <StatCard label="Air Quality" value={journeyResult.airQuality} />
                <StatCard label="City Condition" value={journeyResult.cityCondition} />
              </div>

              <div
                className="p-6 rounded-2xl mb-4 text-left"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Carbon Impact Summary</p>
                <p className="text-white/85 text-base leading-relaxed">{journeyResult.impactSummary}</p>
              </div>

              <div
                className="p-6 rounded-2xl mb-8 text-left"
                style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}
              >
                <p className="text-emerald-400/80 text-sm leading-relaxed italic">
                  {journeyResult.collectiveMessage}
                </p>
              </div>

              <button
                data-testid="button-journey-continue"
                onClick={() => onComplete(journeyResult)}
                className="w-full max-w-md mx-auto py-4 rounded-xl font-bold text-base transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #22c55e, #10b981)", color: "#07100f" }}
              >
                See my footprint results
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {choicePanel && (
        <ChoiceOverlay zone={choicePanel.zone} onSelect={handleChoice} />
      )}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white font-bold text-lg">{value}</p>
    </div>
  );
}

function ChoiceOverlay({
  zone,
  onSelect,
}: {
  zone: JourneyZone;
  onSelect: (choice: JourneyChoice) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(7,16,15,0.75)" }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-lg rounded-2xl p-6 md:p-8"
        style={{ background: "#0d1f18", border: "1px solid rgba(34,197,94,0.2)" }}
      >
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-400/60 mb-2">{zone.title}</p>
        <h3 className="text-xl md:text-2xl font-black text-white mb-2">{zone.subtitle}</h3>
        {zone.hint && (
          <p className="text-white/45 text-sm mb-5 leading-relaxed border-l-2 border-emerald-500/40 pl-3">
            {zone.hint}
          </p>
        )}
        <div className="space-y-2">
          {zone.choices.map((choice) => (
            <button
              key={choice.id}
              data-testid={`journey-choice-${choice.id}`}
              onClick={() => onSelect(choice)}
              className="w-full text-left p-4 rounded-xl transition-all hover:-translate-y-0.5 hover:border-emerald-500/40"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex justify-between items-center gap-3">
                <span className="text-white font-semibold">{choice.label}</span>
                <span className="text-emerald-400/70 text-xs font-mono shrink-0">{choice.impact}</span>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
