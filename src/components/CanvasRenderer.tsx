import React, { useMemo } from 'react';
import { MotionProject, AspectRatio } from '../types';
import { sp, prog, band, clamp01, lerp, easeOut, easeIn, easeInOut, overshoot } from '../lib/motionMath';
import { ThreeCanvas } from './ThreeCanvas';
import { WallBuildersScene } from './wallbuilders/WallBuildersScene';

interface CanvasRendererProps {
  project: MotionProject;
  time: number; // in seconds
  isPlaying: boolean;
  aspectRatio: AspectRatio;
  showSafeAreas?: boolean;
  showGrid?: boolean;
  zoom?: number; // 1 = 100%
  canvasRef?: React.RefObject<HTMLDivElement | null>;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  project,
  time,
  isPlaying,
  aspectRatio,
  showSafeAreas = false,
  showGrid = false,
  zoom = 1,
  canvasRef,
}) => {
  const fps = project.fps || 60;
  const frame = Math.floor(time * fps);

  // Active scene lookup
  const currentScene = useMemo(() => {
    return (
      project.scenes.find((s) => time >= s.startTime && time < s.endTime) ||
      project.scenes[project.scenes.length - 1]
    );
  }, [project.scenes, time]);

  // Aspect ratio dimensions for canvas container
  const aspectStyles = useMemo(() => {
    switch (aspectRatio) {
      case '16:9':
        return { width: '880px', height: '495px', ratio: '16/9' };
      case '9:16':
        return { width: '380px', height: '675px', ratio: '9/16' };
      case '1:1':
        return { width: '560px', height: '560px', ratio: '1/1' };
      case '4:5':
        return { width: '450px', height: '562px', ratio: '4/5' };
      default:
        return { width: '800px', height: '450px', ratio: '16/9' };
    }
  }, [aspectRatio]);

  // Calculate Claude Effort slider position
  const effortValue = useMemo(() => {
    if (project.id !== 'claude-effort') return 0;
    // Step 1: 5.0s -> Low (0.25)
    // Step 2: 5.9s -> Med (0.50)
    // Step 3: 6.8s -> High (0.75)
    // Step 4: 7.7s -> Max (1.00)
    const s2Steps = [5.0, 5.9, 6.8, 7.7];
    const notching = s2Steps.reduce((acc, stepTime) => {
      return acc + 0.25 * sp(frame, stepTime, { damping: 12, stiffness: 190, mass: 0.75 }, fps);
    }, 0);

    const rewind = sp(frame, 8.5, { damping: 20, stiffness: 240, mass: 0.6 }, fps);
    const climb = prog(time, 10.3, 11.2, overshoot);
    return clamp01(notching * (1 - rewind) + 0.85 * climb);
  }, [project.id, frame, time, fps]);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 bg-[#0a0a0d] overflow-hidden select-none">
      {/* Zoom Transform Wrapper */}
      <div
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        className="transition-transform duration-75 relative flex items-center justify-center shadow-2xl rounded-lg"
      >
        {/* Main Canvas Viewport */}
        <div
          ref={canvasRef}
          id="motion-canvas-viewport"
          style={{
            width: aspectStyles.width,
            height: aspectStyles.height,
            backgroundColor: project.palette.bg,
            color: project.palette.text,
          }}
          className="relative overflow-hidden rounded-lg border border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] font-sans"
        >
          {/* Subtle Dynamic Dot Matrix Background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-15"
            style={{
              backgroundImage: `radial-gradient(${project.palette.text} 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
              backgroundPosition: `${(time * 8) % 24}px ${(time * 8) % 24}px`,
            }}
          />

          {/* Vignette Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
            }}
          />

          {/* ------------------------------------------------------------- */}
          {/* TEMPLATE: WALL BUILDERS 3 DAYS TO GO (ELEVATION) */}
          {/* ------------------------------------------------------------- */}
          {project.id === 'wallbuilders-3days' && (
            <WallBuildersScene time={time} fps={fps} />
          )}

          {/* ------------------------------------------------------------- */}
          {/* TEMPLATE 1: CLAUDE AI EFFORT ENGINE SCENES */}
          {/* ------------------------------------------------------------- */}
          {project.id === 'claude-effort' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              {/* Dynamic Aura Glow linked to effort */}
              <div
                className="absolute w-[450px] h-[450px] rounded-full pointer-events-none blur-[90px] transition-opacity duration-300"
                style={{
                  backgroundColor: project.palette.accent,
                  opacity: 0.08 + effortValue * 0.28,
                  transform: `scale(${0.8 + effortValue * 0.6})`,
                }}
              />

              {/* Scene 1: Prompt & Thought (0s - 3.8s) */}
              {time < 3.8 && (
                <div
                  className="flex flex-col items-center justify-center text-center space-y-6 max-w-md w-full"
                  style={{
                    opacity: time > 3.2 ? 1 - prog(time, 3.2, 3.7, easeIn) : 1,
                    transform: `translateY(${time > 3.2 ? prog(time, 3.2, 3.7, easeIn) * -30 : 0}px)`,
                  }}
                >
                  {/* Category Pill */}
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase border"
                    style={{
                      borderColor: 'rgba(240,238,230,0.15)',
                      backgroundColor: 'rgba(31,30,28,0.7)',
                      color: project.palette.muted,
                      opacity: sp(frame, 0.1, { damping: 14, stiffness: 140 }, fps),
                      transform: `translateY(${(1 - sp(frame, 0.1, { damping: 14 }, fps)) * 15}px)`,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: project.palette.accent }} />
                    {currentScene?.subline || 'CLAUDE REASONING MODEL'}
                  </div>

                  {/* Headline with Mask Reveal */}
                  <h1
                    className="text-3xl md:text-4xl font-serif tracking-tight leading-snug"
                    style={{
                      opacity: sp(frame, 0.35, { damping: 15 }, fps),
                      transform: `translateY(${(1 - sp(frame, 0.35, { damping: 15 }, fps)) * 20}px)`,
                    }}
                  >
                    Same prompt.{' '}
                    <span className="italic font-normal" style={{ color: project.palette.accent }}>
                      Completely different
                    </span>{' '}
                    thinking.
                  </h1>

                  {/* Prompt Mockup Bar */}
                  <div
                    className="w-full max-w-sm rounded-xl p-3 border shadow-lg flex items-center gap-3 backdrop-blur-md"
                    style={{
                      borderColor: 'rgba(240,238,230,0.15)',
                      backgroundColor: project.palette.panel,
                      opacity: sp(frame, 1.4, { damping: 14 }, fps),
                      transform: `scale(${0.9 + 0.1 * sp(frame, 1.4, { damping: 14 }, fps)})`,
                    }}
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.palette.accent }} />
                    <div className="font-mono text-xs text-left overflow-hidden whitespace-nowrap text-neutral-300 flex-1">
                      {time >= 2.0 ? (
                        <>
                          {'redesign the /config architecture'.slice(0, Math.floor((time - 2.0) * 22))}
                          <span className="inline-block w-1.5 h-3 bg-neutral-200 ml-1 animate-pulse align-middle" />
                        </>
                      ) : (
                        <span className="text-neutral-500">Ask Claude anything...</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Scene 2: Effort Notching Slider (3.8s - 8.5s) */}
              {time >= 3.8 && time < 8.5 && (
                <div
                  className="flex flex-col items-center justify-center space-y-6 max-w-md w-full"
                  style={{
                    opacity: time > 8.0 ? 1 - prog(time, 8.0, 8.4, easeIn) : prog(time, 3.8, 4.2, easeOut),
                    transform: `scale(${0.95 + 0.05 * prog(time, 3.8, 4.3, easeOut)})`,
                  }}
                >
                  <div className="text-center space-y-1">
                    <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-400">
                      STEPPED REASONING BUDGET
                    </span>
                    <h2 className="text-2xl font-serif text-white">Dynamic Effort Level</h2>
                  </div>

                  {/* Effort Slider Widget */}
                  <div
                    className="w-full bg-[#1F1E1C] border border-neutral-700/60 rounded-2xl p-5 shadow-xl space-y-4"
                  >
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-neutral-400">CURRENT BUDGET</span>
                      <span
                        className="font-semibold px-2 py-0.5 rounded text-black transition-colors duration-200"
                        style={{
                          backgroundColor:
                            effortValue > 0.75
                              ? project.palette.accent
                              : effortValue > 0.5
                              ? '#F59E0B'
                              : '#10B981',
                        }}
                      >
                        {effortValue >= 0.95
                          ? 'MAX EFFORT (DEEP SYNTH)'
                          : effortValue >= 0.7
                          ? 'HIGH REASONING'
                          : effortValue >= 0.45
                          ? 'BALANCED'
                          : 'LOW LATENCY'}
                      </span>
                    </div>

                    {/* Stepper Track */}
                    <div className="relative w-full h-3 bg-neutral-800 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-75"
                        style={{
                          width: `${Math.max(8, effortValue * 100)}%`,
                          backgroundColor: project.palette.accent,
                          boxShadow: `0 0 15px ${project.palette.accent}`,
                        }}
                      />
                    </div>

                    {/* Step notches */}
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {['LOW', 'MEDIUM', 'HIGH', 'MAX'].map((label, idx) => {
                        const active = effortValue >= (idx + 1) * 0.23;
                        return (
                          <div
                            key={label}
                            className={`text-center py-1 rounded text-[10px] font-mono border transition-all ${
                              active
                                ? 'border-[#D97757] bg-[#D97757]/20 text-[#F0EEE6]'
                                : 'border-neutral-800 text-neutral-500'
                            }`}
                          >
                            {label}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Callout Chips */}
                  <div className="flex gap-2">
                    {time >= 5.0 && (
                      <span className="text-xs font-mono px-2.5 py-1 bg-neutral-800/80 border border-neutral-700 text-neutral-300 rounded-md animate-fade-in">
                        + AST Rewriter
                      </span>
                    )}
                    {time >= 5.9 && (
                      <span className="text-xs font-mono px-2.5 py-1 bg-neutral-800/80 border border-neutral-700 text-neutral-300 rounded-md animate-fade-in">
                        + Recursion Depth: 64
                      </span>
                    )}
                    {time >= 7.7 && (
                      <span
                        className="text-xs font-mono px-2.5 py-1 border rounded-md"
                        style={{
                          borderColor: project.palette.accent,
                          color: project.palette.accent,
                          backgroundColor: 'rgba(217, 119, 87, 0.15)',
                        }}
                      >
                        ⚡ 32K Thinking Tokens
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Scene 3: Telemetry & Sanitizer Tests (8.5s - 12.8s) */}
              {time >= 8.5 && time < 12.8 && (
                <div
                  className="flex flex-col items-center justify-center space-y-5 max-w-md w-full"
                  style={{
                    opacity: time > 12.3 ? 1 - prog(time, 12.3, 12.7, easeIn) : prog(time, 8.5, 8.9, easeOut),
                  }}
                >
                  <div className="text-center space-y-1">
                    <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-400">
                      SYNTHETIC VERIFICATION HARNESS
                    </span>
                    <h2 className="text-2xl font-serif text-white">5/5 Edge-Cases Verified</h2>
                  </div>

                  {/* Sanitizer Checklist */}
                  <div className="w-full bg-[#1F1E1C] border border-neutral-700/60 rounded-2xl p-4 space-y-2.5">
                    {[
                      { name: 'XSS Vector Sanitization', timeTrigger: 8.8 },
                      { name: 'Nested Malformed DOM Nodes', timeTrigger: 9.3 },
                      { name: 'Unicode Zero-Width Bypass', timeTrigger: 9.8 },
                      { name: 'CSS Expression Injection', timeTrigger: 10.4 },
                      { name: 'OOM ReDoS Loop Prevention', timeTrigger: 11.0 },
                    ].map((test, index) => {
                      const isChecked = time >= test.timeTrigger;
                      return (
                        <div
                          key={test.name}
                          className="flex items-center justify-between p-2 rounded-lg bg-neutral-900/60 border border-neutral-800 text-xs font-mono"
                          style={{
                            opacity: isChecked ? 1 : 0.4,
                            transform: `translateX(${isChecked ? 0 : 10}px)`,
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        >
                          <span className="text-neutral-300">{test.name}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isChecked
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'text-neutral-600'
                            }`}
                          >
                            {isChecked ? 'PASS ✓' : 'QUEUED'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Scene 4: Radial Iris Finale (12.8s - 16s) */}
              {time >= 12.8 && (
                <div className="relative flex flex-col items-center justify-center text-center space-y-5 max-w-lg w-full">
                  {/* Expanding Iris Ring */}
                  <div
                    className="absolute rounded-full border-2 pointer-events-none transition-all"
                    style={{
                      width: `${Math.min(700, (time - 12.8) * 450)}px`,
                      height: `${Math.min(700, (time - 12.8) * 450)}px`,
                      borderColor: project.palette.accent,
                      opacity: Math.max(0, 1 - (time - 12.8) * 0.4),
                    }}
                  />

                  <div
                    className="space-y-4"
                    style={{
                      opacity: sp(frame, 13.3, { damping: 14 }, fps),
                      transform: `scale(${0.9 + 0.1 * sp(frame, 13.3, { damping: 14 }, fps)})`,
                    }}
                  >
                    <div
                      className="inline-block px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest"
                      style={{
                        backgroundColor: 'rgba(217, 119, 87, 0.15)',
                        color: project.palette.accent,
                        border: `1px solid ${project.palette.accent}`,
                      }}
                    >
                      THE NEW REASONING STANDARD
                    </div>
                    <h1 className="text-3xl md:text-5xl font-serif tracking-tight leading-tight">
                      Intelligence when you{' '}
                      <span className="italic" style={{ color: project.palette.accent }}>
                        need it most.
                      </span>
                    </h1>
                    <p className="text-xs font-mono text-neutral-400 max-w-sm mx-auto">
                      Available now across Claude 3.5 Sonnet & Opus series.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TEMPLATE 2: HYPERFRAMES CHANGELOG SCENES */}
          {/* ------------------------------------------------------------- */}
          {project.id === 'hyperframes-changelog' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              {/* Scene 1: Version Announcement */}
              {time < 4.0 && (
                <div
                  className="flex flex-col items-center justify-center space-y-5 text-center max-w-lg w-full"
                  style={{
                    opacity: time > 3.4 ? 1 - prog(time, 3.4, 3.9, easeIn) : 1,
                  }}
                >
                  <div
                    className="px-3.5 py-1.5 rounded-full text-xs font-mono font-medium border"
                    style={{
                      borderColor: project.palette.accent,
                      backgroundColor: 'rgba(94, 241, 124, 0.12)',
                      color: project.palette.accent,
                      opacity: sp(frame, 0.2, { damping: 14 }, fps),
                    }}
                  >
                    RELEASE v3.4.0 • STABLE
                  </div>

                  <h1
                    className="text-4xl font-bold tracking-tight text-white"
                    style={{
                      opacity: sp(frame, 0.4, { damping: 14 }, fps),
                      transform: `translateY(${(1 - sp(frame, 0.4, { damping: 14 }, fps)) * 25}px)`,
                    }}
                  >
                    High-Velocity <br />
                    <span style={{ color: project.palette.accent }}>Frame Sequencing.</span>
                  </h1>

                  <div
                    className="p-4 rounded-xl border border-neutral-800 bg-[#121614]/80 backdrop-blur-md max-w-md w-full shadow-2xl flex items-center justify-between font-mono text-xs"
                    style={{
                      opacity: sp(frame, 0.8, { damping: 14 }, fps),
                    }}
                  >
                    <span className="text-neutral-400">FRAME CACHE LATENCY</span>
                    <span className="text-emerald-400 font-bold">0.42 ms / frame</span>
                  </div>
                </div>
              )}

              {/* Scene 2: 10x Performance Metrics */}
              {time >= 4.0 && time < 8.2 && (
                <div
                  className="flex flex-col items-center justify-center space-y-6 text-center max-w-lg w-full"
                  style={{
                    opacity: time > 7.7 ? 1 - prog(time, 7.7, 8.1, easeIn) : prog(time, 4.0, 4.4, easeOut),
                  }}
                >
                  <span className="text-xs font-mono tracking-widest uppercase text-neutral-400">
                    GPU HARDWARE ACCELERATED RASTERIZER
                  </span>

                  <div className="flex items-center justify-center gap-4">
                    <div
                      className="text-6xl md:text-7xl font-extrabold tracking-tighter"
                      style={{ color: project.palette.accent }}
                    >
                      {Math.min(10, Math.floor(1 + prog(time, 4.5, 6.2, easeOut) * 9))}x
                    </div>
                    <div className="text-left font-mono text-xs text-neutral-300 leading-relaxed border-l border-neutral-700 pl-4">
                      FASTER EXPORT PIPELINE<br />
                      PARALLEL WEBCODECS ENCODER<br />
                      ZERO RENDER FLICKER
                    </div>
                  </div>

                  {/* Dynamic Progress Bar */}
                  <div className="w-64 h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-75"
                      style={{
                        width: `${Math.min(100, prog(time, 4.5, 6.2, easeOut) * 100)}%`,
                        backgroundColor: project.palette.accent,
                        boxShadow: `0 0 12px ${project.palette.accent}`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Scene 3: Enterprise Ready */}
              {time >= 8.2 && (
                <div className="flex flex-col items-center justify-center space-y-5 text-center max-w-lg w-full">
                  <h2
                    className="text-3xl md:text-4xl font-bold tracking-tight text-white"
                    style={{
                      opacity: sp(frame, 8.5, { damping: 14 }, fps),
                      transform: `translateY(${(1 - sp(frame, 8.5, { damping: 14 }, fps)) * 20}px)`,
                    }}
                  >
                    Render everywhere at <span style={{ color: project.palette.accent }}>60 FPS</span>.
                  </h2>

                  <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                    {['H.264 & HEVC', 'ProRes Alpha', 'WebM VP9', 'Lossless PNG Stacks'].map((tag, i) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-md text-xs font-mono bg-neutral-900 border border-neutral-700 text-neutral-300"
                        style={{
                          opacity: sp(frame, 8.8 + i * 0.15, { damping: 14 }, fps),
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TEMPLATE 3: THREE.JS 3D KINETIC SCENE */}
          {/* ------------------------------------------------------------- */}
          {project.id === 'threejs-3d-kinetic' && (
            <div className="absolute inset-0">
              {/* Live WebGL 3D Canvas */}
              <ThreeCanvas
                time={time}
                isPlaying={isPlaying}
                colorScheme={{
                  accent: project.palette.accent,
                  secondary: project.palette.accentSecondary || '#FF007A',
                }}
              />

              {/* Cyberpunk HUD Overlay */}
              <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-neutral-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>SYS_CORE // WEBGL2 SHADER MATRIX</span>
                  </div>
                  <div>ROTATION_Z: {(time * 45).toFixed(1)}°</div>
                </div>

                {/* Center Reticle */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-32 h-32 border border-cyan-500/20 rounded-full animate-spin-slow" />
                  <div className="w-48 h-48 border border-dashed border-pink-500/15 rounded-full" />
                </div>

                <div className="text-center space-y-1">
                  <h2
                    className="text-2xl md:text-3xl font-extrabold tracking-wide uppercase"
                    style={{
                      color: project.palette.text,
                      textShadow: `0 0 20px ${project.palette.accent}`,
                    }}
                  >
                    {currentScene?.headline || 'SPATIAL COMPUTE'}
                  </h2>
                  <p className="text-xs font-mono text-cyan-300">
                    {currentScene?.subline || 'REAL-TIME 3D VIEWPORT'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TEMPLATE 4: KINETIC TYPOGRAPHY REVEAL */}
          {/* ------------------------------------------------------------- */}
          {project.id === 'kinetic-typography' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div
                className="space-y-4 max-w-sm w-full"
                style={{
                  transform: `scale(${0.96 + 0.04 * Math.sin(time * 2)})`,
                }}
              >
                <div className="text-xs font-mono tracking-widest text-[#FF8906] uppercase">
                  {currentScene?.subline || 'EDITORIAL MOTION'}
                </div>

                {/* Staggered Word Blocks */}
                <div className="space-y-2">
                  {(currentScene?.headline || 'STOP SCROLLING').split(' ').map((word, wIdx) => {
                    const isAccent = word.toLowerCase().includes(currentScene?.accentWord?.toLowerCase() || '');
                    const wordDelay = (currentScene?.startTime || 0) + wIdx * 0.12;
                    const wordProgress = sp(frame, wordDelay, { damping: 13, stiffness: 180 }, fps);

                    return (
                      <div key={wIdx} className="overflow-hidden">
                        <span
                          className={`inline-block text-4xl md:text-5xl font-black uppercase tracking-tight ${
                            isAccent ? 'text-[#FF8906]' : 'text-white'
                          }`}
                          style={{
                            transform: `translateY(${(1 - wordProgress) * 110}%) rotate(${
                              (1 - wordProgress) * 8
                            }deg)`,
                            opacity: wordProgress,
                          }}
                        >
                          {word}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-center gap-3">
                  <span className="w-8 h-1 bg-[#FF8906] rounded-full" />
                  <span className="w-2 h-1 bg-neutral-600 rounded-full" />
                  <span className="w-2 h-1 bg-neutral-600 rounded-full" />
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TEMPLATE 5: AUDIO WAVEFORM & SYNTH PULSE */}
          {/* ------------------------------------------------------------- */}
          {project.id === 'audio-waveform' && (
            <div className="absolute inset-0 flex flex-col items-center justify-between p-8">
              <div className="w-full flex justify-between items-center text-xs font-mono text-purple-300">
                <span>DSP // WEB AUDIO SYNTHESIZER</span>
                <span>44.1 kHz • 24-BIT</span>
              </div>

              {/* Reactive Equalizer Spectrum Bars */}
              <div className="flex items-center justify-center gap-1.5 h-36 w-full max-w-md">
                {Array.from({ length: 28 }).map((_, i) => {
                  const freqPhase = time * 8 + i * 0.35;
                  const barHeight = Math.abs(Math.sin(freqPhase) * Math.cos(freqPhase * 0.6)) * 100 + 10;
                  return (
                    <div
                      key={i}
                      className="w-2.5 rounded-full transition-all duration-75"
                      style={{
                        height: `${barHeight}%`,
                        background: `linear-gradient(to top, ${project.palette.accent}, ${project.palette.accentSecondary})`,
                        boxShadow: `0 0 10px ${project.palette.accent}66`,
                      }}
                    />
                  );
                })}
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-2xl font-serif text-white">{currentScene?.headline}</h3>
                <p className="text-xs font-mono text-neutral-400">{currentScene?.subline}</p>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STUDIO OVERLAYS: Safe Areas & Composition Grids */}
          {/* ------------------------------------------------------------- */}
          {showSafeAreas && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Action Safe (90%) */}
              <div className="absolute inset-[5%] border border-dashed border-cyan-400/40">
                <span className="absolute top-1 left-2 text-[9px] font-mono text-cyan-400/70">
                  ACTION SAFE (90%)
                </span>
              </div>
              {/* Title Safe (80%) */}
              <div className="absolute inset-[10%] border border-dotted border-amber-400/40">
                <span className="absolute top-1 left-2 text-[9px] font-mono text-amber-400/70">
                  TITLE SAFE (80%)
                </span>
              </div>
            </div>
          )}

          {showGrid && (
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/10">
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-b border-white/10" />
              <div className="border-r border-white/10" />
              <div className="border-r border-white/10" />
              <div />
            </div>
          )}

          {/* Timecode badge in corner */}
          <div className="absolute bottom-2 right-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-neutral-400 pointer-events-none">
            {time.toFixed(2)}s • F{frame}
          </div>
        </div>
      </div>
    </div>
  );
};
