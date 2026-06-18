import { motion } from "framer-motion";
import { type LeaderboardEntry, useGetLeaderboard } from "@workspace/api-client-react";
import { INDIA_AVG, PARIS_TARGET, getLevel } from "@/lib/emissions";

export default function Leaderboard() {
  const { data: entries, isLoading } = useGetLeaderboard();
  const leaderboardEntries = Array.isArray(entries) ? entries : [];

  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center py-24 px-6"
      style={{ background: "linear-gradient(180deg, #07100f 0%, #0a1a14 100%)" }}
    >
      <div className="max-w-xl w-full">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-400/60 mb-4 font-medium">City leaderboard</p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            Who's leading<br />
            <span className="text-emerald-400">the green race?</span>
          </h2>
          <p className="text-white/40 text-sm">Cities ranked by average carbon footprint per person</p>
        </div>

        <div className="mb-6 flex items-center gap-4 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex-1 text-center">
            <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Paris Target</div>
            <div className="text-emerald-400 font-black text-lg">{PARIS_TARGET.toLocaleString()} kg</div>
          </div>
          <div className="w-px h-10" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="flex-1 text-center">
            <div className="text-xs text-white/40 uppercase tracking-widest mb-1">India Average</div>
            <div className="text-yellow-400 font-black text-lg">{INDIA_AVG.toLocaleString()} kg</div>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        )}

        {!isLoading && leaderboardEntries.length === 0 && (
          <div className="text-center py-16">
            <div className="text-white/20 text-5xl mb-4">~</div>
            <p className="text-white/40 text-sm">Be the first from your city to take the quiz.</p>
          </div>
        )}

        {!isLoading && leaderboardEntries.length > 0 && (
          <div className="space-y-2">
            {leaderboardEntries.map((entry: LeaderboardEntry, i: number) => {
              const level = getLevel(entry.avgCO2);
              const pct = Math.min((entry.avgCO2 / 6000) * 100, 100);
              return (
                <motion.div
                  key={entry.city}
                  data-testid={`leaderboard-entry-${i}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="p-4 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                      style={{
                        background: i === 0 ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)",
                        color: i === 0 ? "#22c55e" : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-white font-semibold text-sm truncate">{entry.city}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-mono font-bold" style={{ color: level.color }}>
                            {Math.round(entry.avgCO2).toLocaleString()} kg
                          </span>
                          <span className="text-xs text-white/25">{entry.count}p</span>
                        </div>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: level.color, opacity: 0.7 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <p className="text-white/30 text-xs leading-relaxed">
            Data from CarbonEra quiz submissions. Each entry represents one person's lifestyle-based carbon footprint estimate.
          </p>
        </div>
      </div>
    </section>
  );
}
