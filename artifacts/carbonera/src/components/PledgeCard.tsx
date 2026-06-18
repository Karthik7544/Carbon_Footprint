import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import {
  type PledgeStat,
  useCreatePledge,
  useGetPledgeStats,
  getGetPledgeStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getLevel, type FootprintResult } from "@/lib/emissions";

interface Props {
  result: FootprintResult & { city: string };
  onContinue: () => void;
}

const PLEDGES = [
  { key: "plant_based", label: "Try plant-based meals twice a week", saving: "~350 kg CO₂/year" },
  { key: "public_transit", label: "Switch one car trip a day to transit", saving: "~250 kg CO₂/year" },
  { key: "green_energy", label: "Switch to a green energy provider", saving: "~500 kg CO₂/year" },
  { key: "no_flights", label: "Skip one flight this year", saving: "~800 kg CO₂/year" },
];

export default function PledgeCard({ result, onContinue }: Props) {
  const [selected, setSelected] = useState("");
  const [pledgeDone, setPledgeDone] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const createPledge = useCreatePledge();
  const { data: stats } = useGetPledgeStats();
  const pledgeStats = Array.isArray(stats) ? stats : [];
  const level = getLevel(result.totalCO2);

  const handlePledge = () => {
    if (!selected) return;
    createPledge.mutate(
      { data: { city: result.city, pledgeType: selected } },
      {
        onSuccess: () => {
          setPledgeDone(true);
          queryClient.invalidateQueries({ queryKey: getGetPledgeStatsQueryKey() });
        },
      }
    );
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true });
      const a = document.createElement("a");
      a.download = "my-carbon-card.png";
      a.href = dataUrl;
      a.click();
    } catch {
      /* silently ignore */
    }
  };

  const pledgeLabel = PLEDGES.find(p => p.key === selected)?.label ?? "";

  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center py-24 px-6"
      style={{ background: "linear-gradient(180deg, #0a1a14 0%, #07100f 100%)" }}
    >
      <div className="max-w-xl w-full">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-400/60 mb-4 font-medium">Make your pledge</p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
            One change.<br />
            <span className="text-emerald-400">Real impact.</span>
          </h2>
        </div>

        {!pledgeDone ? (
          <>
            <div className="space-y-3 mb-6">
              {PLEDGES.map(pledge => {
                const count = pledgeStats.find((s: PledgeStat) => s.pledgeType === pledge.key)?.count ?? 0;
                return (
                  <button
                    key={pledge.key}
                    data-testid={`pledge-${pledge.key}`}
                    onClick={() => setSelected(pledge.key)}
                    className="w-full px-5 py-4 rounded-xl text-left transition-all"
                    style={{
                      background: selected === pledge.key ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${selected === pledge.key ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-white font-semibold text-sm">{pledge.label}</div>
                        <div className="text-emerald-400/70 text-xs mt-1">{pledge.saving}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {selected === pledge.key && (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#22c55e" }}>
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4l3 3 5-6" stroke="#07100f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                        {count > 0 && (
                          <div className="text-xs text-white/25 mt-1">{count} pledged</div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              data-testid="button-make-pledge"
              onClick={handlePledge}
              disabled={!selected || createPledge.isPending}
              className="w-full py-4 rounded-xl font-bold text-base transition-all disabled:opacity-40"
              style={{ background: selected ? "linear-gradient(135deg, #22c55e, #10b981)" : "rgba(255,255,255,0.06)", color: selected ? "#07100f" : "rgba(255,255,255,0.3)" }}
            >
              {createPledge.isPending ? "Saving pledge..." : "Make my pledge"}
            </button>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>
                Pledge saved
              </div>
              <p className="text-white/50 text-sm">Download and share your Carbon Card</p>
            </div>

            <div
              ref={cardRef}
              className="w-full rounded-2xl p-7 mb-6 select-none"
              style={{
                background: "linear-gradient(135deg, #0a1f16 0%, #07100f 50%, #0d1a2a 100%)",
                border: "1px solid rgba(34,197,94,0.2)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold">CarbonEra</p>
                  <p className="text-white/30 text-xs mt-0.5">Carbon Footprint Card</p>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: `${level.color}20`, color: level.color }}
                >
                  {level.label}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-white font-black mb-1" style={{ fontSize: "3rem", lineHeight: 1 }}>
                  {(result.totalCO2 / 1000).toFixed(1)}t
                </div>
                <p className="text-white/40 text-sm">CO₂ per year</p>
              </div>

              <div className="flex items-center justify-between text-xs text-white/40 mb-5">
                <span>{result.city}</span>
                <span>{new Date().getFullYear()}</span>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <p className="text-white/30 text-xs mb-1">My pledge</p>
                <p className="text-white text-sm font-medium leading-snug">{pledgeLabel}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                data-testid="button-download-card"
                onClick={handleDownload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #22c55e, #10b981)", color: "#07100f" }}
              >
                Download card
              </button>
              <button
                data-testid="button-view-leaderboard"
                onClick={onContinue}
                className="flex-1 py-3.5 rounded-xl font-medium text-sm transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
              >
                See leaderboard
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
