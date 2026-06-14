const initSpotlightHero = () => {
  const hero = document.querySelector("[data-spotlight-hero]");

  if (!hero) {
    return;
  }

  const state = {
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
    frame: null,
  };

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const lerp = (start, end, amount) => start + (end - start) * amount;

  const setSpotlight = (x, y) => {
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

  const updateTargetFromEvent = (event) => {
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

  const start = () => {
    if (state.frame === null) {
      state.frame = window.requestAnimationFrame(animate);
    }
  };

  const hideSpotlight = () => {
    state.isActive = false;
  };

  hero.addEventListener("pointerenter", updateTargetFromEvent, { passive: true });
  hero.addEventListener("pointermove", updateTargetFromEvent, { passive: true });
  hero.addEventListener("pointerleave", hideSpotlight, { passive: true });
  hero.addEventListener("pointercancel", hideSpotlight, { passive: true });
  window.addEventListener("resize", updateBaseRadius, { passive: true });

  updateBaseRadius();
  start();
};

document.addEventListener("DOMContentLoaded", initSpotlightHero);
