import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MILESTONES = [
  { year: 1750, event: "Industrial Revolution begins", co2: 280, detail: "Coal-powered steam engines transform manufacturing. Atmospheric CO₂ sits at pre-industrial equilibrium." },
  { year: 1850, event: "Railways reshape the world", co2: 288, detail: "Steam locomotives carry coal across continents. The age of fossil fuels accelerates." },
  { year: 1900, event: "Oil becomes the lifeblood of industry", co2: 296, detail: "Automobiles arrive. Petroleum supplants coal as the dominant fuel. Emissions begin climbing sharply." },
  { year: 1950, event: "Post-war industrial boom", co2: 311, detail: "Mass production, plastics, and suburban sprawl. Humanity burns more carbon than at any point in history." },
  { year: 1970, event: "First Earth Day — a warning unheeded", co2: 325, detail: "Scientists raise alarms. Governments create environmental agencies. Emissions continue to rise." },
  { year: 1990, event: "IPCC issues first climate assessment", co2: 354, detail: "The scientific consensus is clear. International negotiations begin. The world debates while the atmosphere warms." },
  { year: 2000, event: "Kyoto Protocol enters force", co2: 369, detail: "The first binding emissions treaty. Major emitters opt out or fail to meet targets." },
  { year: 2015, event: "Paris Agreement — 1.5°C target", co2: 400, detail: "196 nations pledge to limit warming. CO₂ crosses 400ppm for the first time in 3 million years." },
  { year: 2024, event: "The hottest year ever recorded", co2: 422, detail: "Every month breaks temperature records. The window to act narrows. This is where you enter the story." },
];

export default function HistoryScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  const co2Ref = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
        },
      });

      tl.to(yearRef.current, {
        innerText: 2024,
        snap: { innerText: 1 },
        ease: "none",
        duration: 1,
      }, 0);

      tl.to(co2Ref.current, {
        innerText: 422,
        snap: { innerText: 0.1 },
        ease: "none",
        duration: 1,
      }, 0);

      tl.to(barRef.current, {
        scaleX: 1,
        ease: "none",
        duration: 1,
      }, 0);

      gsap.utils.toArray<HTMLElement>(".milestone-event").forEach((el: HTMLElement, i: number) => {
        gsap.fromTo(el,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative" style={{ height: `${MILESTONES.length * 60}vh` }}>
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen flex items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(180deg, #07100f 0%, #0a1a14 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 48px, rgba(34,197,94,0.3) 49px)", backgroundSize: "100% 49px" }}
          />
        </div>

        <div className="relative z-10 text-center px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-400/60 mb-4 font-medium">CO₂ in the atmosphere</p>
          <div className="flex items-end justify-center gap-3 mb-2">
            <div
              ref={yearRef}
              className="font-black text-white leading-none"
              style={{ fontSize: "clamp(3rem, 12vw, 9rem)", fontVariantNumeric: "tabular-nums" }}
            >
              1750
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-8">
            <div
              ref={co2Ref}
              className="font-bold text-emerald-400 tabular-nums"
              style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)" }}
            >
              280
            </div>
            <span className="text-emerald-400/60 text-sm font-medium">ppm</span>
          </div>

          <div className="w-64 mx-auto h-1 bg-white/10 rounded-full overflow-hidden mb-12">
            <div
              ref={barRef}
              className="h-full rounded-full origin-left"
              style={{ background: "linear-gradient(90deg, #22c55e, #f97316, #ef4444)", transform: "scaleX(0)" }}
            />
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none" style={{ top: "100vh" }}>
        {MILESTONES.map((m, i) => (
          <div
            key={m.year}
            className="milestone-event absolute left-1/2 -translate-x-1/2 w-full max-w-xl px-6"
            style={{ top: `${(i / MILESTONES.length) * 100}%` }}
          >
            <div className="border border-emerald-900/60 rounded-2xl p-6 backdrop-blur-sm"
              style={{ background: "rgba(7,16,15,0.7)" }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-emerald-400 font-black text-2xl tabular-nums">{m.year}</span>
                <span className="h-px flex-1 bg-emerald-900/60" />
                <span className="text-emerald-400/60 text-sm font-mono">{m.co2} ppm</span>
              </div>
              <p className="text-white font-bold text-lg mb-2">{m.event}</p>
              <p className="text-white/50 text-sm leading-relaxed">{m.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
