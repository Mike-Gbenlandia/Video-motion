import { SpringConfig } from '../types';

export const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));
export const clamp = (x: number, min: number, max: number): number => Math.min(max, Math.max(min, x));
export const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;

export const smooth = (x: number): number => {
  const k = clamp01(x);
  return k * k * (3 - 2 * k);
};

export const band = (x: number, a: number, b: number): number => {
  if (b === a) return x >= a ? 1 : 0;
  return smooth((x - a) / (b - a));
};

// Analytical Cubic Bezier solver
export function solveCubicBezier(p1x: number, p1y: number, p2x: number, p2y: number) {
  return function (t: number): number {
    if (t <= 0) return 0;
    if (t >= 1) return 1;

    // Newton-Raphson approximation for parameter u such that X(u) = t
    let u = t;
    for (let i = 0; i < 8; i++) {
      const u2 = u * u;
      const u3 = u2 * u;
      const oneMinusU = 1 - u;
      const oneMinusU2 = oneMinusU * oneMinusU;

      // X(u) = 3*(1-u)^2*u*p1x + 3*(1-u)*u^2*p2x + u^3
      const currentX = 3 * oneMinusU2 * u * p1x + 3 * oneMinusU * u2 * p2x + u3;
      const diff = currentX - t;
      if (Math.abs(diff) < 1e-5) break;

      // dX/du
      const dX = 3 * oneMinusU2 * p1x + 6 * oneMinusU * u * (p2x - p1x) + 3 * u2 * (1 - p2x);
      if (Math.abs(dX) < 1e-6) break;
      u -= diff / dX;
      u = clamp01(u);
    }

    // Now compute Y(u)
    const oneMinusU = 1 - u;
    return (
      3 * oneMinusU * oneMinusU * u * p1y +
      3 * oneMinusU * u * u * p2y +
      u * u * u
    );
  };
}

// Preset Bezier Easing functions based on Claude-Motion / Remotion doctrine
export const easeOut = solveCubicBezier(0.16, 1, 0.3, 1);
export const easeIn = solveCubicBezier(0.6, 0, 0.9, 0.35);
export const easeInOut = solveCubicBezier(0.65, 0, 0.35, 1);
export const overshoot = solveCubicBezier(0.55, 0, 0.2, 1.12);
export const linear = (x: number) => clamp01(x);

export const prog = (
  t: number,
  t0: number,
  t1: number,
  ease: (x: number) => number = easeInOut
): number => {
  if (t1 <= t0) return t >= t1 ? 1 : 0;
  return ease(clamp01((t - t0) / (t1 - t0)));
};

// Analytical Spring Physics Solver (Damped Harmonic Oscillator)
// Returns 0 -> 1 normalized progress with physical bounce/settle
export function springProgress(
  elapsedSec: number,
  config: SpringConfig = { damping: 14, stiffness: 140, mass: 0.8 }
): number {
  if (elapsedSec <= 0) return 0;

  const { damping, stiffness, mass } = config;
  const m = Math.max(0.01, mass);
  const k = Math.max(1, stiffness);
  const c = Math.max(0.1, damping);

  // Angular natural frequency
  const w0 = Math.sqrt(k / m);
  // Damping ratio
  const zeta = c / (2 * Math.sqrt(m * k));

  if (zeta < 1) {
    // Underdamped (oscillates and settles)
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    const envelope = Math.exp(-zeta * w0 * elapsedSec);
    const cosTerm = Math.cos(wd * elapsedSec);
    const sinTerm = Math.sin(wd * elapsedSec);
    const coeff = (zeta * w0) / wd;
    return 1 - envelope * (cosTerm + coeff * sinTerm);
  } else if (zeta === 1) {
    // Critically damped
    const envelope = Math.exp(-w0 * elapsedSec);
    return 1 - envelope * (1 + w0 * elapsedSec);
  } else {
    // Overdamped
    const r1 = -w0 * (zeta - Math.sqrt(zeta * zeta - 1));
    const r2 = -w0 * (zeta + Math.sqrt(zeta * zeta - 1));
    return 1 - ((r2 * Math.exp(r1 * elapsedSec) - r1 * Math.exp(r2 * elapsedSec)) / (r2 - r1));
  }
}

// Spring helper relative to frame & fps
export const sp = (
  frame: number,
  startSec: number,
  config: Partial<SpringConfig> = {},
  fps: number = 60
): number => {
  const elapsed = (frame - startSec * fps) / fps;
  if (elapsed <= 0) return 0;
  return springProgress(elapsed, {
    damping: config.damping ?? 14,
    stiffness: config.stiffness ?? 140,
    mass: config.mass ?? 0.8,
  });
};

// Deterministic Pseudo-random
export const rand = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Formats seconds into MM:SS:FF or SS:ms
export const formatTimecode = (seconds: number, fps: number = 60): string => {
  const totalFrames = Math.floor(seconds * fps);
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const frames = totalFrames % fps;
  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
};
