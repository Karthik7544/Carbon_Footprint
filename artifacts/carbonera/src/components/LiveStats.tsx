import { useEffect, useState } from "react";
import { useGetLiveData } from "@workspace/api-client-react";

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1800;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span className="tabular-nums">
      {displayed.toFixed(suffix === " ppm" ? 1 : 0)}{suffix}
    </span>
  );
}

export default function LiveStats() {
  const { data } = useGetLiveData();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(id);
  }, []);

  const co2ppm = data?.co2ppm ?? 421.5;
  const gridIntensity = data?.indiaGridIntensity ?? 714;

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center py-24 px-6 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a1a14 0%, #07100f 100%)" }}
    >
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: "#22c55e",
              animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl w-full text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-400/60 mb-4 font-medium">
          Right now, on Earth
        </p>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-16 leading-tight">
          The atmosphere has never<br />
          <span className="text-emerald-400">held this much carbon.</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div
            className="relative rounded-2xl p-8 border overflow-hidden"
            style={{ background: "rgba(34,197,94,0.05)", borderColor: "rgba(34,197,94,0.2)" }}
          >
            <div
              className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full"
              style={{ background: "#22c55e", boxShadow: pulse ? "0 0 12px #22c55e" : "none", transition: "box-shadow 0.5s" }}
            />
            <p className="text-emerald-400/60 text-xs uppercase tracking-widest mb-3 font-medium">Global CO₂ concentration</p>
            <div className="text-white font-black mb-1" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
              <AnimatedNumber value={co2ppm} suffix=" ppm" />
            </div>
            <p className="text-white/40 text-sm">parts per million — highest in 3 million years</p>
            <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${((co2ppm - 280) / (500 - 280)) * 100}%`, background: "linear-gradient(90deg, #22c55e, #f97316)" }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/25 mt-1">
              <span>280 pre-industrial</span>
              <span>500 danger threshold</span>
            </div>
          </div>

          <div
            className="relative rounded-2xl p-8 border overflow-hidden"
            style={{ background: "rgba(249,115,22,0.05)", borderColor: "rgba(249,115,22,0.2)" }}
          >
            <div
              className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full"
              style={{ background: "#f97316", boxShadow: pulse ? "0 0 12px #f97316" : "none", transition: "box-shadow 0.5s" }}
            />
            <p className="text-orange-400/60 text-xs uppercase tracking-widest mb-3 font-medium">India electricity grid</p>
            <div className="text-white font-black mb-1" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
              <AnimatedNumber value={gridIntensity} suffix=" g" />
            </div>
            <p className="text-white/40 text-sm">gCO₂/kWh — coal still powers 70% of India's grid</p>
            <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.min((gridIntensity / 900) * 100, 100)}%`, background: "linear-gradient(90deg, #fbbf24, #ef4444)" }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/25 mt-1">
              <span>0g (renewables)</span>
              <span>900g (coal-only)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { value: "8.1B", label: "tonnes CO₂ emitted this year" },
            { value: "+1.2°C", label: "above pre-industrial average" },
            { value: "7yrs", label: "remaining carbon budget at 1.5°C" },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="text-2xl font-black text-emerald-400 mb-1">{stat.value}</div>
              <div className="text-xs text-white/40 leading-snug">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
