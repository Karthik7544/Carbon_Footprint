import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { INDIA_AVG, GLOBAL_AVG, PARIS_TARGET, getLevel, type FootprintResult } from "@/lib/emissions";

interface Props {
  result: FootprintResult & { city: string };
  onContinue: () => void;
}

function CountUp({ target, duration = 1600 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setVal(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <>{val.toLocaleString()}</>;
}

function CompareBar({ label, value, max, color, isYou }: { label: string; value: number; max: number; color: string; isYou?: boolean }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className={`text-sm font-medium ${isYou ? "text-white" : "text-white/50"}`}>{label}</span>
        <span className={`text-sm font-mono font-bold ${isYou ? "text-white" : "text-white/40"}`}>
          {Math.round(value).toLocaleString()} kg
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          style={{ background: color, opacity: isYou ? 1 : 0.5 }}
        />
      </div>
    </div>
  );
}

function XPBar({ label, score, color }: { label: string; score: number; color: string }) {
  const levelLabel = score < 20 ? "Eco Hero" : score < 40 ? "Climate Aware" : score < 60 ? "Average" : score < 80 ? "High Impact" : "Critical";
  return (
    <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-white/70 text-sm font-medium">{label}</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>
          {levelLabel}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden mb-1" style={{ background: "rgba(255,255,255,0.07)" }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          style={{ background: color }}
        />
      </div>
      <div className="text-right text-xs text-white/30">{score} XP</div>
    </div>
  );
}

export default function FootprintResult({ result, onContinue }: Props) {
  const level = getLevel(result.totalCO2);
  const max = Math.max(result.totalCO2, GLOBAL_AVG) * 1.1;

  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center py-24 px-6"
      style={{ background: "linear-gradient(180deg, #0d1f18 0%, #07100f 100%)" }}
    >
      <div className="max-w-xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-400/60 mb-4 font-medium">
            {result.city} · {new Date().getFullYear()}
          </p>
          <div className="font-black text-white mb-2 leading-none" style={{ fontSize: "clamp(3.5rem, 12vw, 7rem)" }}>
            <CountUp target={result.totalCO2} />
          </div>
          <p className="text-white/50 text-lg mb-4">kg CO₂ per year</p>
          <span
            className="inline-block px-4 py-1.5 rounded-full text-sm font-bold"
            style={{ background: `${level.color}20`, color: level.color, border: `1px solid ${level.color}40` }}
          >
            {level.label}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-8 p-6 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p className="text-white/50 text-xs uppercase tracking-widest mb-4 font-medium">How you compare</p>
          <CompareBar label="You" value={result.totalCO2} max={max} color={level.color} isYou />
          <CompareBar label="India average" value={INDIA_AVG} max={max} color="#fbbf24" />
          <CompareBar label="Paris target" value={PARIS_TARGET} max={max} color="#22c55e" />
          <CompareBar label="Global average" value={GLOBAL_AVG} max={max} color="#ef4444" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mb-8"
        >
          <p className="text-white/50 text-xs uppercase tracking-widest mb-4 font-medium">Impact by category</p>
          <div className="grid grid-cols-2 gap-3">
            <XPBar label="Diet" score={result.dietScore} color="#22c55e" />
            <XPBar label="Transport" score={result.transportScore} color="#3b82f6" />
            <XPBar label="Energy" score={result.energyScore} color="#f97316" />
            <XPBar label="Shopping / Flights" score={result.shoppingScore} color="#a855f7" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {[
            { label: "vs India avg", value: result.totalCO2 - INDIA_AVG, suffix: "kg" },
            { label: "trees to offset", value: Math.round(result.totalCO2 / 21), suffix: "" },
            { label: "km in a car", value: Math.round(result.totalCO2 / 0.17), suffix: "" },
          ].map(stat => (
            <div key={stat.label} className="text-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="font-black text-lg text-white">
                {stat.value > 0 ? "+" : ""}{stat.value.toLocaleString()}{stat.suffix}
              </div>
              <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.button
          data-testid="button-continue-to-story"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
          onClick={onContinue}
          className="w-full py-4 rounded-xl font-bold text-base transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #22c55e, #10b981)", color: "#07100f" }}
        >
          Get my AI climate story
        </motion.button>
      </div>
    </section>
  );
}
