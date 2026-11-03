import React, { useMemo } from 'react';
import {
  WallBuildersLogo,
  ElevationTitle,
  IsometricStairs,
  CountdownPrism,
} from './WallBuildersAssets';
import { sp, prog, clamp01, easeOut, easeIn, easeInOut, overshoot } from '../../lib/motionMath';
import {
  Palette,
  Video,
  Bot,
  Smartphone,
  Mic,
  Lightbulb,
  Camera,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Gift,
} from 'lucide-react';

interface WallBuildersSceneProps {
  time: number; // Playhead time in seconds (0.0 to 31.2s)
  fps?: number;
}

export const WallBuildersScene: React.FC<WallBuildersSceneProps> = ({
  time,
  fps = 60,
}) => {
  const frame = Math.floor(time * fps);

  // Active Scene Detection
  // Scene 1: 0.0s - 4.5s (Countdown 03 Days To Go)
  // Scene 2: 4.5s - 9.0s (Theme: Elevation & Core Pillars)
  // Scene 3: 9.0s - 18.0s (4 Skills & Gear Giveaways)
  // Scene 4: 18.0s - 26.0s (Event Venue & Free Registration)
  // Scene 5: 26.0s - 31.2s (Grand Finale Climax)
  const sceneIdx = useMemo(() => {
    if (time < 4.5) return 1;
    if (time < 9.0) return 2;
    if (time < 18.0) return 3;
    if (time < 26.0) return 4;
    return 5;
  }, [time]);

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden select-none font-sans">
      {/* ------------------------------------------------------------- */}
      {/* BACKGROUND THEME LAYER: Canary Yellow / Scarlet Red / Dark    */}
      {/* ------------------------------------------------------------- */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          backgroundColor:
            sceneIdx === 1
              ? '#FFDE00' // Yellow (from Image 2)
              : sceneIdx === 2
              ? '#FF1E27' // Scarlet Red (from Image 1 & 3)
              : sceneIdx === 3
              ? '#0A0C14' // Dark Studio Canvas for Skills
              : sceneIdx === 4
              ? '#0D1117' // Sleek Midnight for Ticket
              : '#FFDE00', // Yellow Finale
        }}
      >
        {/* Subtle Geometric Triangle Tessellation Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 35H0L20 0z' fill='%23000' fill-opacity='0.4'/%3E%3C/svg%3E")`,
            backgroundSize: '36px 36px',
            backgroundPosition: `${(time * 12) % 36}px ${(time * 8) % 36}px`,
          }}
        />

        {/* Memphis Top Corner Decorative Target Rings (from Poster) */}
        {(sceneIdx === 1 || sceneIdx === 2 || sceneIdx === 5) && (
          <>
            <div className="absolute -top-10 -left-10 w-36 h-36 rounded-full border-[10px] border-[#00F0FF] pointer-events-none flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-[8px] border-[#FFDE00]" />
            </div>
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full border-[10px] border-[#38EF7D] pointer-events-none flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-[8px] border-[#E024C3]" />
            </div>
          </>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SCENE 1: THE COUNTDOWN HOOK "03 DAYS TO GO" (0.0s - 4.5s)     */}
      {/* ------------------------------------------------------------- */}
      {time < 4.5 && (
        <div
          className="relative z-10 flex flex-col items-center justify-center space-y-4 max-w-lg w-full text-center px-4"
          style={{
            opacity: time > 4.0 ? 1 - prog(time, 4.0, 4.4, easeIn) : 1,
            transform: `translateY(${time > 4.0 ? prog(time, 4.0, 4.4, easeIn) * -40 : 0}px)`,
          }}
        >
          {/* Logo Animation */}
          <div
            style={{
              opacity: sp(frame, 0.1, { damping: 14, stiffness: 160 }, fps),
              transform: `translateY(${(1 - sp(frame, 0.1, { damping: 14 }, fps)) * -25}px)`,
            }}
          >
            <WallBuildersLogo size={52} />
          </div>

          {/* Giant 3D "03 DAYS TO GO" */}
          <div className="py-2">
            <CountdownPrism
              progress={sp(frame, 0.4, { damping: 12, stiffness: 180, mass: 0.9 }, fps)}
              days={3}
            />
          </div>

          {/* Subtitle hook */}
          <div
            className="space-y-1"
            style={{
              opacity: sp(frame, 1.2, { damping: 15 }, fps),
              transform: `translateY(${(1 - sp(frame, 1.2, { damping: 15 }, fps)) * 20}px)`,
            }}
          >
            <div className="inline-block bg-black text-[#FFDE00] font-mono text-xs md:text-sm font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
              THE BIGGEST CREATIVE & TECH EVENT IN OTA
            </div>
            <div className="text-black font-extrabold text-sm tracking-tight pt-1">
              SATURDAY, NOVEMBER 7, 2026 • 9:00 AM
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SCENE 2: THEME: ELEVATION & PILLAR BADGES (4.5s - 9.0s)       */}
      {/* ------------------------------------------------------------- */}
      {time >= 4.5 && time < 9.0 && (
        <div
          className="relative z-10 flex flex-col items-center justify-center space-y-5 max-w-xl w-full text-center px-6"
          style={{
            opacity: time > 8.5 ? 1 - prog(time, 8.5, 8.9, easeIn) : prog(time, 4.5, 4.9, easeOut),
            transform: `scale(${0.96 + 0.04 * prog(time, 4.5, 5.0, easeOut)})`,
          }}
        >
          {/* Circular Archway White Card Container (matching poster) */}
          <div className="w-full bg-white border-4 border-black rounded-t-[140px] rounded-b-2xl p-6 md:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.5)] flex flex-col items-center space-y-4">
            {/* Logo Header inside card */}
            <WallBuildersLogo size={40} className="scale-90" />

            {/* "THEME" Tag */}
            <div className="inline-block bg-[#0048FF] text-white text-[11px] font-mono font-black uppercase px-3 py-0.5 rounded border-2 border-black tracking-widest shadow-sm">
              THEME
            </div>

            {/* ELEVATION Wordmark */}
            <ElevationTitle
              progress={sp(frame, 4.8, { damping: 13, stiffness: 170 }, fps)}
            />

            {/* 5 Event Pillar Badges (from Poster) */}
            <div className="flex flex-wrap gap-2 justify-center pt-2 max-w-md">
              {[
                { label: 'CONVERSATIONS', bg: '#FF1E27', text: '#FFF', delay: 5.6 },
                { label: 'PRACTICAL LEARNING', bg: '#0048FF', text: '#FFF', delay: 5.9 },
                { label: 'OPPORTUNITIES', bg: '#00F0FF', text: '#000', delay: 6.2 },
                { label: 'NETWORKING', bg: '#FF6B00', text: '#FFF', delay: 6.5 },
                { label: 'EXCITING GIVEAWAYS', bg: '#E024C3', text: '#FFF', delay: 6.8 },
              ].map((pill, i) => {
                const pillProg = sp(frame, pill.delay, { damping: 11, stiffness: 210, mass: 0.7 }, fps);
                return (
                  <span
                    key={pill.label}
                    className="font-mono text-xs font-black px-3 py-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] uppercase transition-transform"
                    style={{
                      backgroundColor: pill.bg,
                      color: pill.text,
                      opacity: pillProg,
                      transform: `scale(${pillProg}) translateY(${(1 - pillProg) * 15}px)`,
                    }}
                  >
                    {pill.label}
                  </span>
                );
              })}
            </div>

            {/* Blue Banner Divider */}
            <div className="w-full bg-[#0048FF] text-white font-mono text-[10px] md:text-xs font-bold py-1 px-4 rounded border-2 border-black tracking-wider uppercase mt-2">
              FREE • REGISTRATION IS REQUIRED
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SCENE 3: 4 PRACTICAL SKILLS + CREATOR GEAR (9.0s - 18.0s)     */}
      {/* ------------------------------------------------------------- */}
      {time >= 9.0 && time < 18.0 && (
        <div
          className="relative z-10 flex flex-col items-center justify-center space-y-5 max-w-2xl w-full px-6"
          style={{
            opacity: time > 17.5 ? 1 - prog(time, 17.5, 17.9, easeIn) : prog(time, 9.0, 9.4, easeOut),
          }}
        >
          {/* Header Title */}
          <div className="text-center space-y-1">
            <span className="text-xs font-mono tracking-[0.25em] font-bold text-[#00F0FF] uppercase">
              HANDS-ON WORKSHOPS
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              PRACTICAL SKILLS TO BE TAUGHT
            </h2>
          </div>

          {/* 4 Skill Cards Grid */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {[
              {
                id: 'graphics',
                title: 'Graphics Design',
                desc: 'Branding, vector typography & layout',
                icon: <Palette className="w-5 h-5" />,
                color: '#E024C3',
                delay: 9.3,
              },
              {
                id: 'content',
                title: 'Content Creation',
                desc: 'Visual storytelling, hooks & studio setups',
                icon: <Video className="w-5 h-5" />,
                color: '#00F0FF',
                delay: 9.7,
              },
              {
                id: 'ai',
                title: 'AI Automation',
                desc: 'Next-gen generative workflows & smart bots',
                icon: <Bot className="w-5 h-5" />,
                color: '#0048FF',
                delay: 10.1,
              },
              {
                id: 'mobile',
                title: 'Mobile Video Editing',
                desc: 'Viral pacing, motion graphics & color grading',
                icon: <Smartphone className="w-5 h-5" />,
                color: '#FFDE00',
                delay: 10.5,
              },
            ].map((skill) => {
              const cardProg = sp(frame, skill.delay, { damping: 13, stiffness: 170 }, fps);
              return (
                <div
                  key={skill.id}
                  className="bg-[#141622] border-2 border-neutral-700 rounded-xl p-3.5 shadow-xl flex items-center gap-3 transition-transform relative overflow-hidden"
                  style={{
                    opacity: cardProg,
                    transform: `translateY(${(1 - cardProg) * 20}px) scale(${0.95 + 0.05 * cardProg})`,
                    borderColor: time >= skill.delay + 0.3 ? skill.color : 'rgba(255,255,255,0.15)',
                  }}
                >
                  <div
                    className="p-2.5 rounded-lg border-2 border-black flex items-center justify-center text-black flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: skill.color }}
                  >
                    {skill.icon}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-white font-black text-xs md:text-sm tracking-tight">
                      {skill.title}
                    </div>
                    <div className="text-neutral-400 text-[10px] truncate">{skill.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Giveaway Announcement (Revealed at 13.5s) */}
          {time >= 13.0 && (
            <div
              className="w-full bg-gradient-to-r from-[#FF1E27] via-[#E024C3] to-[#0048FF] p-0.5 rounded-2xl shadow-2xl"
              style={{
                opacity: sp(frame, 13.2, { damping: 13 }, fps),
                transform: `scale(${0.92 + 0.08 * sp(frame, 13.2, { damping: 13 }, fps)})`,
              }}
            >
              <div className="bg-[#0C0E17] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFDE00] border-2 border-black flex items-center justify-center text-black shadow-md flex-shrink-0 animate-bounce">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#FFDE00] uppercase tracking-widest">
                      EXCITING GIVEAWAYS
                    </span>
                    <h4 className="text-xs md:text-sm font-extrabold text-white">
                      We'll be sharing content creation tools!
                    </h4>
                  </div>
                </div>

                {/* Micro Gear Badges */}
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#1F2232] border border-neutral-700 text-[11px] font-mono text-neutral-200">
                    <Mic className="w-3.5 h-3.5 text-[#00F0FF]" /> Mics
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#1F2232] border border-neutral-700 text-[11px] font-mono text-neutral-200">
                    <Lightbulb className="w-3.5 h-3.5 text-[#FFDE00]" /> Lighting
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#1F2232] border border-neutral-700 text-[11px] font-mono text-neutral-200">
                    <Camera className="w-3.5 h-3.5 text-[#E024C3]" /> Tripods
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SCENE 4: VENUE, DATE & REGISTRATION PASS (18.0s - 26.0s)      */}
      {/* ------------------------------------------------------------- */}
      {time >= 18.0 && time < 26.0 && (
        <div
          className="relative z-10 flex flex-col items-center justify-center space-y-4 max-w-lg w-full px-6"
          style={{
            opacity: time > 25.5 ? 1 - prog(time, 25.5, 25.9, easeIn) : prog(time, 18.0, 18.4, easeOut),
            transform: `translateY(${time > 25.5 ? -30 : 0}px)`,
          }}
        >
          {/* Header */}
          <div className="text-center space-y-1">
            <span className="text-[11px] font-mono tracking-widest text-[#FFDE00] uppercase font-bold">
              CONFERENCE LOCATION & LOGISTICS
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              JOIN US LIVE IN OTA
            </h2>
          </div>

          {/* Event VIP Ticket Card */}
          <div
            className="w-full bg-[#161824] border-2 border-neutral-700 rounded-2xl p-5 shadow-2xl space-y-4 relative overflow-hidden"
            style={{
              opacity: sp(frame, 18.3, { damping: 14 }, fps),
              transform: `scale(${0.94 + 0.06 * sp(frame, 18.3, { damping: 14 }, fps)})`,
            }}
          >
            {/* Glowing Accent strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF1E27] via-[#FFDE00] to-[#0048FF]" />

            {/* Date & Time Row */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <div className="p-2.5 rounded-lg bg-[#0048FF] text-white">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-neutral-400 uppercase">DATE & TIME</div>
                <div className="text-sm font-black text-white">
                  Sat. November 7, 2026 | 9:00 AM
                </div>
              </div>
            </div>

            {/* Venue Row */}
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <div className="p-2.5 rounded-lg bg-[#FF1E27] text-white flex-shrink-0 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">VENUE ADDRESS</div>
                <div className="text-xs font-bold text-white leading-snug">
                  RCCG Mega Grace Sanctuary
                </div>
                <div className="text-[11px] text-neutral-300">
                  Along The Bells junction, off Fasogbon Street, Ota, Ogun State.
                </div>
              </div>
            </div>

            {/* Registration CTA block */}
            <div className="pt-1 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-emerald-400 font-bold">● ADMISSION IS 100% FREE</span>
                <span className="text-neutral-400">SEATS LIMITED</span>
              </div>

              {/* Big Clickable/Register URL Bar */}
              <div className="bg-[#0048FF] hover:bg-blue-600 border-2 border-black rounded-xl p-3 text-center flex items-center justify-between shadow-[0_4px_14px_rgba(0,72,255,0.4)] transition">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-white/80 font-bold uppercase">
                    REGISTER HERE:
                  </span>
                  <span className="font-mono text-sm md:text-base font-black text-white underline tracking-tight">
                    bit.ly/WallBuilders2026
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-bold">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SCENE 5: GRAND FINALE CLIMAX (26.0s - 31.2s)                  */}
      {/* ------------------------------------------------------------- */}
      {time >= 26.0 && (
        <div
          className="relative z-10 flex flex-col items-center justify-center space-y-4 max-w-xl w-full text-center px-6"
          style={{
            opacity: sp(frame, 26.2, { damping: 14 }, fps),
            transform: `scale(${0.92 + 0.08 * sp(frame, 26.2, { damping: 14 }, fps)})`,
          }}
        >
          {/* Logo & Elevation Title Lockup */}
          <div className="space-y-2">
            <WallBuildersLogo size={58} />
            <ElevationTitle progress={1} />
          </div>

          {/* Final Callout Badge */}
          <div className="bg-black text-[#FFDE00] font-black font-mono text-lg md:text-xl px-6 py-2 rounded-xl border-4 border-black shadow-[4px_4px_0px_#0048FF] uppercase tracking-wider animate-pulse">
            ★ 3 DAYS TO GO — DON'T MISS IT! ★
          </div>

          {/* Ascending Isometric Staircase Visual Graphic */}
          <IsometricStairs className="scale-75 -my-4" />

          {/* Registration link banner */}
          <div className="bg-[#0048FF] text-white border-2 border-black rounded-xl px-6 py-2.5 font-mono text-sm font-black shadow-lg">
            Register: bit.ly/WallBuilders2026
          </div>

          <div className="text-black font-mono text-xs font-extrabold tracking-widest pt-1">
            @WallBuildersConference • wallbuildersconference@gmail.com
          </div>
        </div>
      )}
    </div>
  );
};
