import React, { useState, useEffect, useRef } from 'react';
import { solveCubicBezier, springProgress } from '../lib/motionMath';
import { Play, Sparkles, Activity } from 'lucide-react';

export const EasingGraphEditor: React.FC = () => {
  const [curveType, setCurveType] = useState<'bezier' | 'spring'>('bezier');
  const [selectedPreset, setSelectedPreset] = useState<'easeOut' | 'easeIn' | 'easeInOut' | 'overshoot'>('easeOut');
  
  // Spring params
  const [damping, setDamping] = useState(14);
  const [stiffness, setStiffness] = useState(140);
  const [mass, setMass] = useState(0.8);

  // Bezier control handles
  const [bezierPoints, setBezierPoints] = useState<[number, number, number, number]>([0.16, 1.0, 0.3, 1.0]);

  // Test animation state
  const [animProgress, setAnimProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Apply Bezier Presets
  const applyPreset = (preset: 'easeOut' | 'easeIn' | 'easeInOut' | 'overshoot') => {
    setSelectedPreset(preset);
    setCurveType('bezier');
    switch (preset) {
      case 'easeOut':
        setBezierPoints([0.16, 1.0, 0.3, 1.0]);
        break;
      case 'easeIn':
        setBezierPoints([0.6, 0.0, 0.9, 0.35]);
        break;
      case 'easeInOut':
        setBezierPoints([0.65, 0.0, 0.35, 1.0]);
        break;
      case 'overshoot':
        setBezierPoints([0.55, 0.0, 0.2, 1.12]);
        break;
    }
  };

  // Draw the mathematical curve onto the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const pad = 24;
    const innerW = w - pad * 2;
    const innerH = h - pad * 2;

    ctx.clearRect(0, 0, w, h);

    // Draw grid
    ctx.strokeStyle = '#262633';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 4; i++) {
      const x = pad + (innerW / 4) * i;
      const y = pad + (innerH / 4) * i;
      ctx.moveTo(x, pad);
      ctx.lineTo(x, h - pad);
      ctx.moveTo(pad, y);
      ctx.lineTo(w - pad, y);
    }
    ctx.stroke();

    // Baseline reference (start y=0 at bottom, end y=1 at top)
    const baselineY = h - pad;
    const targetY = pad;

    // Draw diagonal linear guide
    ctx.strokeStyle = '#374151';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pad, baselineY);
    ctx.lineTo(w - pad, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot Curve
    ctx.lineWidth = 3;
    ctx.strokeStyle = curveType === 'bezier' ? '#3B82F6' : '#10B981';
    ctx.beginPath();

    const steps = 120;
    const bezierFn = solveCubicBezier(...bezierPoints);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      let val = 0;

      if (curveType === 'bezier') {
        val = bezierFn(t);
      } else {
        // Spring plotted over 1 second
        val = springProgress(t * 1.2, { damping, stiffness, mass });
      }

      const x = pad + t * innerW;
      const y = baselineY - val * innerH;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw handles if Bezier
    if (curveType === 'bezier') {
      const [p1x, p1y, p2x, p2y] = bezierPoints;
      const h1x = pad + p1x * innerW;
      const h1y = baselineY - p1y * innerH;
      const h2x = pad + p2x * innerW;
      const h2y = baselineY - p2y * innerH;

      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 1.5;

      // Handle 1 line
      ctx.beginPath();
      ctx.moveTo(pad, baselineY);
      ctx.lineTo(h1x, h1y);
      ctx.stroke();

      // Handle 2 line
      ctx.beginPath();
      ctx.moveTo(w - pad, targetY);
      ctx.lineTo(h2x, h2y);
      ctx.stroke();

      // Handle endpoints
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(h1x, h1y, 4.5, 0, Math.PI * 2);
      ctx.arc(h2x, h2y, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [curveType, bezierPoints, damping, stiffness, mass]);

  // Run physical preview animation
  const triggerTestAnimation = () => {
    setIsAnimating(true);
    setAnimProgress(0);
    const startTime = performance.now();
    const durationMs = 1200;

    const bezierFn = solveCubicBezier(...bezierPoints);

    const step = (now: number) => {
      const elapsedSec = (now - startTime) / 1000;
      const normalizedTime = Math.min(1, (now - startTime) / durationMs);

      let val = 0;
      if (curveType === 'bezier') {
        val = bezierFn(normalizedTime);
      } else {
        val = springProgress(elapsedSec, { damping, stiffness, mass });
      }

      setAnimProgress(val);

      if (normalizedTime < 1 || (curveType === 'spring' && elapsedSec < 1.4)) {
        requestAnimationFrame(step);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(step);
  };

  return (
    <div className="flex flex-col h-full bg-[#14141b] border-l border-neutral-800 p-4 space-y-4 text-xs font-sans select-none overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-neutral-200 uppercase tracking-wide text-[11px]">
            Motion Taste & Easing Graph
          </span>
        </div>
        <div className="flex bg-neutral-900 rounded p-0.5 border border-neutral-800">
          <button
            onClick={() => setCurveType('bezier')}
            className={`px-2 py-1 rounded text-[10px] font-medium transition ${
              curveType === 'bezier' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Bézier
          </button>
          <button
            onClick={() => setCurveType('spring')}
            className={`px-2 py-1 rounded text-[10px] font-medium transition ${
              curveType === 'spring' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Spring Physics
          </button>
        </div>
      </div>

      {/* Interactive Canvas Graph */}
      <div className="relative bg-[#0d0d12] rounded-lg border border-neutral-800 p-2 flex flex-col items-center">
        <canvas
          ref={canvasRef}
          width={280}
          height={160}
          className="rounded w-full max-w-[280px] h-[160px]"
        />
        <div className="w-full flex justify-between text-[10px] font-mono text-neutral-400 mt-1 px-1">
          <span>T=0.0s (Start)</span>
          <span>T=1.0s (End)</span>
        </div>
      </div>

      {/* Preset Curve Selector */}
      {curveType === 'bezier' ? (
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase text-neutral-400">
            Remotion / Claude Motion Presets
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'easeOut', label: 'easeOut (Entrances)', desc: '(0.16, 1, 0.3, 1)' },
              { id: 'easeIn', label: 'easeIn (Fast Exits)', desc: '(0.6, 0, 0.9, 0.35)' },
              { id: 'easeInOut', label: 'easeInOut (Morphs)', desc: '(0.65, 0, 0.35, 1)' },
              { id: 'overshoot', label: 'Overshoot (Land)', desc: '(0.55, 0, 0.2, 1.12)' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id as any)}
                className={`p-2 rounded text-left border transition ${
                  selectedPreset === p.id
                    ? 'border-blue-500 bg-blue-500/15 text-blue-200'
                    : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                <div className="font-semibold text-[11px] text-white">{p.label}</div>
                <div className="font-mono text-[9px] text-neutral-400">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Spring Physics Sliders */
        <div className="space-y-3 bg-[#111116] p-3 rounded-lg border border-neutral-800">
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-neutral-400">DAMPING: {damping}</span>
            <span className="text-emerald-400">
              {damping < 10 ? 'Bouncy' : damping > 18 ? 'Heavy' : 'Snappy'}
            </span>
          </div>
          <input
            type="range"
            min="6"
            max="30"
            value={damping}
            onChange={(e) => setDamping(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />

          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-neutral-400">STIFFNESS: {stiffness}</span>
          </div>
          <input
            type="range"
            min="50"
            max="350"
            value={stiffness}
            onChange={(e) => setStiffness(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />

          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-neutral-400">MASS: {mass.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="2.0"
            step="0.1"
            value={mass}
            onChange={(e) => setMass(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>
      )}

      {/* Live Physical Test Drive */}
      <div className="space-y-2 pt-1 border-t border-neutral-800">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-neutral-400 uppercase">
            LIVE MOTION PREVIEW
          </span>
          <button
            onClick={triggerTestAnimation}
            disabled={isAnimating}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-[11px] transition shadow"
          >
            <Play className="w-3 h-3 text-emerald-400" />
            <span>Test Move</span>
          </button>
        </div>

        {/* Visual Track Demo */}
        <div className="relative h-12 bg-[#0c0d12] rounded border border-neutral-800 p-2 flex items-center overflow-hidden">
          <div className="absolute left-2 text-[9px] font-mono text-neutral-400">0%</div>
          <div className="absolute right-2 text-[9px] font-mono text-neutral-400">100%</div>
          <div
            className="w-7 h-7 rounded-lg shadow-md flex items-center justify-center font-bold text-[10px] text-white"
            style={{
              backgroundColor: curveType === 'bezier' ? '#3B82F6' : '#10B981',
              transform: `translateX(${animProgress * 210}px) scale(${1 + Math.sin(animProgress * Math.PI) * 0.15})`,
              boxShadow: `0 0 15px ${curveType === 'bezier' ? '#3B82F6' : '#10B981'}88`,
            }}
          >
            ●
          </div>
        </div>
      </div>
    </div>
  );
};
