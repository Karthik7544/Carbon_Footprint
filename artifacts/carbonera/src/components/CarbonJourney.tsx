import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type FootprintResult } from "@/lib/emissions";
import {
  buildJourneyResult,
  clampHealth,
  getCurrentImpactLabel,
  seedEnvironmentHealth,
  type JourneyResult,
  type JourneyZone,
  type JourneyChoice,
} from "@/lib/journey";
import { JOURNEY_ZONES, WORLD_HEIGHT, WORLD_WIDTH, ZONE_WIDTH } from "@/game/carbon-journey/data/zones";

interface Props {
  result: FootprintResult & { city: string };
  onComplete: (journeyResult: JourneyResult) => void;
}

type Phase = "intro" | "playing" | "final";

interface ChoiceRequestPayload {
  zoneIndex: number;
  zone: JourneyZone;
  choices: JourneyChoice[];
}

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
        <div className="absolute top-6 right-8 text-slate-700 text-lg">^^ ^^</div>
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
  const [choiceHistory, setChoiceHistory] = useState<JourneyResult["choices"]>([]);

  const startGame = () => {
    const initial = seedEnvironmentHealth(result);
    setHealth(initial);
    setImpactLabel("Starting conditions");
    setCurrentZone("");
    setChoicePanel(null);
    setJourneyResult(null);
    setChoiceHistory([]);
    setPhase("playing");
  };

  const handleChoice = (choice: JourneyChoice) => {
    if (!choicePanel) return;

    const nextHealth = clampHealth(health + choice.delta);
    const nextChoices = [
      ...choiceHistory,
      {
        zoneId: choicePanel.zone.id,
        choiceId: choice.id,
        label: choice.label,
        delta: choice.delta,
      },
    ];

    setHealth(nextHealth);
    setImpactLabel(getCurrentImpactLabel(choice.delta));
    setChoiceHistory(nextChoices);
    setChoicePanel(null);

    if (nextChoices.length >= JOURNEY_ZONES.length) {
      const finalResult = buildJourneyResult(nextHealth, nextChoices);
      window.setTimeout(() => {
        setJourneyResult(finalResult);
        setPhase("final");
      }, 400);
    }
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
                Explore five everyday zones: transport, food, shopping, digital life, and home energy.
                Each choice shapes the environment around you. Takes about 2-5 minutes.
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
                  <p className="text-white/40 text-xs mt-1">Arrow keys or WASD to move. Press E near a marker.</p>
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

              <JourneyPlayfield
                health={health}
                completedCount={choiceHistory.length}
                choiceOpen={choicePanel !== null}
                onZoneEnter={setCurrentZone}
                onChoiceRequest={setChoicePanel}
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

function JourneyPlayfield({
  health,
  completedCount,
  choiceOpen,
  onZoneEnter,
  onChoiceRequest,
}: {
  health: number;
  completedCount: number;
  choiceOpen: boolean;
  onZoneEnter: (title: string) => void;
  onChoiceRequest: (payload: ChoiceRequestPayload) => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const keysRef = useRef(new Set<string>());
  const playerRef = useRef({ x: 120, y: 380 });
  const requestedZoneRef = useRef<number | null>(null);
  const [player, setPlayer] = useState(playerRef.current);
  const [viewportWidth, setViewportWidth] = useState(960);
  const [hint, setHint] = useState("Move to the green marker");

  useEffect(() => {
    viewportRef.current?.focus();

    const updateWidth = () => {
      setViewportWidth(viewportRef.current?.clientWidth ?? 960);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", "e"].includes(key)) {
        event.preventDefault();
        keysRef.current.add(key);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysRef.current.delete(event.key.toLowerCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    let animationFrame = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!choiceOpen) {
        const keys = keysRef.current;
        const speed = 210;
        let vx = 0;
        let vy = 0;

        if (keys.has("arrowleft") || keys.has("a")) vx -= speed;
        if (keys.has("arrowright") || keys.has("d")) vx += speed;
        if (keys.has("arrowup") || keys.has("w")) vy -= speed;
        if (keys.has("arrowdown") || keys.has("s")) vy += speed;

        if (vx !== 0 && vy !== 0) {
          vx *= 0.707;
          vy *= 0.707;
        }

        const next = {
          x: Math.max(35, Math.min(WORLD_WIDTH - 35, playerRef.current.x + vx * dt)),
          y: Math.max(285, Math.min(WORLD_HEIGHT - 45, playerRef.current.y + vy * dt)),
        };

        playerRef.current = next;
        setPlayer(next);

        const zoneIndex = Math.max(0, Math.min(JOURNEY_ZONES.length - 1, Math.floor(next.x / ZONE_WIDTH)));
        onZoneEnter(JOURNEY_ZONES[zoneIndex].title);

        const targetZoneIndex = completedCount;
        if (targetZoneIndex < JOURNEY_ZONES.length) {
          const markerX = targetZoneIndex * ZONE_WIDTH + ZONE_WIDTH / 2;
          const markerY = 380;
          const dist = Math.hypot(next.x - markerX, next.y - markerY);

          if (dist < 95) {
            setHint(`Press E to choose: ${JOURNEY_ZONES[targetZoneIndex].title}`);

            if (
              keys.has("e") &&
              requestedZoneRef.current !== targetZoneIndex
            ) {
              requestedZoneRef.current = targetZoneIndex;
              onChoiceRequest({
                zoneIndex: targetZoneIndex,
                zone: JOURNEY_ZONES[targetZoneIndex],
                choices: JOURNEY_ZONES[targetZoneIndex].choices,
              });
            }
          } else {
            requestedZoneRef.current = null;
            setHint("Move to the green marker");
          }
        }
      }

      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [choiceOpen, completedCount, onChoiceRequest, onZoneEnter]);

  const cameraX = Math.max(0, Math.min(WORLD_WIDTH - viewportWidth, player.x - viewportWidth / 2));
  const smogOpacity = health >= 70 ? 0.04 : health >= 45 ? 0.12 : health >= 25 ? 0.22 : 0.34;
  const sky =
    health >= 75
      ? "linear-gradient(180deg, #7ec8e3, #a7f3d0)"
      : health >= 55
        ? "linear-gradient(180deg, #6ba3c7, #86efac)"
        : health >= 35
          ? "linear-gradient(180deg, #8a9aab, #a8a29e)"
          : "linear-gradient(180deg, #4b5563, #57534e)";

  return (
    <div
      ref={viewportRef}
      tabIndex={0}
      className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl outline-none"
      style={{ height: WORLD_HEIGHT, background: "#07100f" }}
      onMouseDown={() => viewportRef.current?.focus()}
    >
      <div
        className="absolute top-3 left-3 z-30 rounded-lg px-3 py-2 text-xs text-emerald-100"
        style={{ background: "rgba(7,16,15,0.82)", border: "1px solid rgba(34,197,94,0.25)" }}
      >
        {hint}
      </div>

      <div
        className="absolute inset-y-0 left-0"
        style={{
          width: WORLD_WIDTH,
          transform: `translateX(${-cameraX}px)`,
          transition: "transform 60ms linear",
        }}
      >
        <div className="absolute left-0 top-0" style={{ width: WORLD_WIDTH, height: 300, background: sky }} />
        <div
          className="absolute left-0 top-0"
          style={{ width: WORLD_WIDTH, height: 300, background: "#5b6670", opacity: smogOpacity }}
        />
        <div
          className="absolute left-0 bottom-0"
          style={{
            width: WORLD_WIDTH,
            height: 120,
            background: health >= 55 ? "#316b42" : health >= 35 ? "#4a6b3a" : "#5a4a3a",
          }}
        />

        {JOURNEY_ZONES.map((zone, index) => (
          <div key={zone.id}>
            <div
              className="absolute rounded-md border text-center text-xs font-bold text-emerald-200"
              style={{
                left: index * ZONE_WIDTH + ZONE_WIDTH / 2 - 90,
                top: 230,
                width: 180,
                padding: "9px 8px",
                background: "rgba(13,31,24,0.9)",
                borderColor: "rgba(34,197,94,0.45)",
              }}
            >
              {zone.title}
            </div>

            <CityDecorations baseX={index * ZONE_WIDTH + 360} health={health} />

            {index >= completedCount && (
              <div
                className="absolute rounded-full"
                style={{
                  left: index * ZONE_WIDTH + ZONE_WIDTH / 2 - 20,
                  top: 360,
                  width: 40,
                  height: 40,
                  border: "3px solid #22c55e",
                  boxShadow: "0 0 24px rgba(34,197,94,0.6)",
                  background: index === completedCount ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.04)",
                  opacity: index === completedCount ? 1 : 0.45,
                }}
              />
            )}
          </div>
        ))}

        <div
          className="absolute"
          style={{
            left: player.x - 15,
            top: player.y - 36,
            width: 30,
            height: 42,
            filter: "drop-shadow(0 7px 8px rgba(0,0,0,0.35))",
          }}
        >
          <div className="absolute left-1 top-0 h-8 w-7 rounded-t-full bg-sky-400 border-2 border-yellow-300" />
          <div className="absolute left-0 top-18 h-18 w-8 rounded-md bg-slate-500" style={{ top: 18, height: 18 }} />
          <div className="absolute left-1 bottom-0 h-2 w-2 bg-slate-900" />
          <div className="absolute right-1 bottom-0 h-2 w-2 bg-slate-900" />
        </div>
      </div>
    </div>
  );
}

function CityDecorations({ baseX, health }: { baseX: number; health: number }) {
  const treeAlpha = health >= 70 ? 1 : health >= 45 ? 0.75 : health >= 25 ? 0.45 : 0.2;
  const birdAlpha = health >= 55 ? 1 : health >= 30 ? 0.5 : 0;
  const trafficAlpha = health >= 60 ? 0.25 : health >= 35 ? 0.55 : 0.85;

  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={`tree-${i}`}
          className="absolute"
          style={{ left: baseX - 235 + i * 130, top: 360, opacity: treeAlpha }}
        >
          <div className="h-10 w-10 rounded-full bg-emerald-500" />
          <div className="mx-auto -mt-1 h-9 w-3 rounded-sm bg-amber-900" />
        </div>
      ))}

      {[0, 1].map((i) => (
        <div
          key={`building-${i}`}
          className="absolute"
          style={{ left: baseX - 120 + i * 200, top: 285 }}
        >
          <div className="h-24 w-16 rounded-t-sm bg-slate-600" />
          <div className="absolute left-3 top-5 h-4 w-3 bg-yellow-200/70" />
          <div className="absolute right-3 top-11 h-4 w-3 bg-yellow-200/40" />
        </div>
      ))}

      <div
        className="absolute h-5 w-10 rounded-md bg-red-500"
        style={{ left: baseX - 40, top: 426, opacity: trafficAlpha }}
      >
        <div className="absolute left-2 top-4 h-2 w-2 rounded-full bg-slate-950" />
        <div className="absolute right-2 top-4 h-2 w-2 rounded-full bg-slate-950" />
      </div>

      <div
        className="absolute text-slate-700 text-lg"
        style={{ left: baseX + 100, top: 90, opacity: birdAlpha }}
      >
        ^^
      </div>
    </>
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
