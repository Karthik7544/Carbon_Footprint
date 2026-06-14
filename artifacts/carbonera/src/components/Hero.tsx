import { useEffect, useRef } from "react";
import heroNaturePath from "@assets/hero-nature_1781463701892.png";
import heroPollutionPath from "@assets/hero-pollution_1781463701893.png";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const stateRef = useRef({
    currentX: -999,
    currentY: -999,
    targetX: -999,
    targetY: -999,
    velocityX: 0,
    velocityY: 0,
    bubbleScaleX: 1,
    bubbleScaleY: 1,
    bubbleRotate: 0,
    bubbleOpacity: 0,
    baseRadius: 132,
    isActive: false,
    frame: null as number | null,
  });

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const state = stateRef.current;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lerp = (start: number, end: number, amount: number) => start + (end - start) * amount;

    const setSpotlight = (x: number, y: number) => {
      hero.style.setProperty("--hero-x", `${x}px`);
      hero.style.setProperty("--hero-y", `${y}px`);
    };

    const setBubble = () => {
      hero.style.setProperty("--hero-mask-x", `${(state.baseRadius * state.bubbleScaleX).toFixed(2)}px`);
      hero.style.setProperty("--hero-mask-y", `${(state.baseRadius * state.bubbleScaleY).toFixed(2)}px`);
      hero.style.setProperty("--hero-bubble-scale-x", state.bubbleScaleX.toFixed(3));
      hero.style.setProperty("--hero-bubble-scale-y", state.bubbleScaleY.toFixed(3));
      hero.style.setProperty("--hero-bubble-rotate", `${state.bubbleRotate.toFixed(2)}deg`);
      hero.style.setProperty("--hero-bubble-opacity", state.bubbleOpacity.toFixed(3));
    };

    const updateBaseRadius = () => {
      const viewportWidth = window.innerWidth;
      state.baseRadius = Math.min(Math.max(viewportWidth * 0.15, 118), 150);
    };

    const updateTargetFromEvent = (event: PointerEvent) => {
      const bounds = hero.getBoundingClientRect();
      state.targetX = event.clientX - bounds.left;
      state.targetY = event.clientY - bounds.top;

      if (!state.isActive) {
        state.currentX = state.targetX;
        state.currentY = state.targetY;
        setSpotlight(state.currentX, state.currentY);
        state.isActive = true;
      }
    };

    const animate = () => {
      const smoothing = prefersReducedMotion.matches ? 1 : 0.095;
      const nextX = lerp(state.currentX, state.targetX, smoothing);
      const nextY = lerp(state.currentY, state.targetY, smoothing);

      state.velocityX = nextX - state.currentX;
      state.velocityY = nextY - state.currentY;
      state.currentX = nextX;
      state.currentY = nextY;

      const speed = Math.min(Math.hypot(state.velocityX, state.velocityY), 24);
      const stretch = prefersReducedMotion.matches ? 0 : speed / 260;
      const wobble = prefersReducedMotion.matches ? 0 : Math.sin(Date.now() * 0.006) * 0.018;
      const targetScaleX = 1 + stretch + wobble;
      const targetScaleY = 1 - stretch * 0.52 - wobble * 0.62;
      const targetRotate = state.velocityX === 0 && state.velocityY === 0
        ? 0
        : Math.atan2(state.velocityY, state.velocityX) * (180 / Math.PI);

      state.bubbleScaleX = lerp(state.bubbleScaleX, targetScaleX, 0.16);
      state.bubbleScaleY = lerp(state.bubbleScaleY, targetScaleY, 0.16);
      state.bubbleRotate = lerp(state.bubbleRotate, targetRotate, 0.08);
      state.bubbleOpacity = lerp(state.bubbleOpacity, state.isActive ? 1 : 0, 0.12);

      setSpotlight(state.currentX, state.currentY);
      setBubble();
      state.frame = window.requestAnimationFrame(animate);
    };

    const hideSpotlight = () => {
      state.isActive = false;
    };

    hero.addEventListener("pointerenter", updateTargetFromEvent as any, { passive: true });
    hero.addEventListener("pointermove", updateTargetFromEvent as any, { passive: true });
    hero.addEventListener("pointerleave", hideSpotlight, { passive: true });
    hero.addEventListener("pointercancel", hideSpotlight, { passive: true });
    window.addEventListener("resize", updateBaseRadius, { passive: true });

    updateBaseRadius();
    
    if (state.frame === null) {
      state.frame = window.requestAnimationFrame(animate);
    }

    return () => {
      hero.removeEventListener("pointerenter", updateTargetFromEvent as any);
      hero.removeEventListener("pointermove", updateTargetFromEvent as any);
      hero.removeEventListener("pointerleave", hideSpotlight);
      hero.removeEventListener("pointercancel", hideSpotlight);
      window.removeEventListener("resize", updateBaseRadius);
      if (state.frame !== null) {
        window.cancelAnimationFrame(state.frame);
      }
    };
  }, []);

  const scrollToQuiz = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('quiz')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={heroRef}
      className="hero-reveal"
      data-spotlight-hero
      aria-labelledby="hero-title"
    >
      <div className="hero-reveal__media" aria-hidden="true">
        <div 
          className="hero-reveal__image hero-reveal__image--future"
          style={{ backgroundImage: `url(${heroNaturePath})` }}
        />
        <div 
          className="hero-reveal__image hero-reveal__image--present"
          style={{ 
            backgroundImage: `linear-gradient(rgba(2, 6, 10, 0.16), rgba(2, 6, 10, 0.2)), url(${heroPollutionPath})` 
          }}
        />
        <div className="hero-reveal__bubble" />
        <div className="hero-reveal__atmosphere" />
      </div>

      <div className="hero-reveal__content">
        <p className="hero-reveal__eyebrow">Awareness starts with seeing clearly</p>
        <h1 className="hero-reveal__title" id="hero-title">CARBON</h1>
        <p className="hero-reveal__subtitle">Footprint</p>
        <button className="hero-reveal__cta" onClick={scrollToQuiz} aria-label="Play the carbon footprint game">
          Play Game
        </button>
      </div>
    </section>
  );
}
