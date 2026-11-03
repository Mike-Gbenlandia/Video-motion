import React from 'react';
import { MotionProject, AspectRatio } from '../types';
import { TEMPLATES } from '../templates/templates';
import {
  Sparkles,
  Film,
  Layers,
  Ratio,
  Sliders,
  Grid,
  Shield,
  Repeat,
  Volume2,
  Activity,
  PlaySquare,
  Mic,
} from 'lucide-react';

interface HeaderProps {
  currentProject: MotionProject;
  onSelectTemplate: (project: MotionProject) => void;
  aspectRatio: AspectRatio;
  onChangeAspectRatio: (ratio: AspectRatio) => void;
  fps: number;
  onChangeFps: (fps: number) => void;
  showSafeAreas: boolean;
  onToggleSafeAreas: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  activeSidePanel: 'easing' | 'sound';
  onChangeSidePanel: (panel: 'easing' | 'sound') => void;
  isVoiceoverEnabled?: boolean;
  onToggleVoiceover?: () => void;
  onOpenAiDirector: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  onSelectTemplate,
  aspectRatio,
  onChangeAspectRatio,
  fps,
  onChangeFps,
  showSafeAreas,
  onToggleSafeAreas,
  showGrid,
  onToggleGrid,
  isLooping,
  onToggleLoop,
  activeSidePanel,
  onChangeSidePanel,
  isVoiceoverEnabled = true,
  onToggleVoiceover,
  onOpenAiDirector,
  onOpenExport,
}) => {
  return (
    <header className="h-14 bg-[#121218] border-b border-neutral-800 px-4 flex items-center justify-between select-none z-20">
      {/* Brand & Project Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <PlaySquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white tracking-tight">
                Remix Motion
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 font-mono hidden md:block">
              REMOTION • THREE.JS • DSP SFX
            </div>
          </div>
        </div>

        {/* Template Selector Dropdown */}
        <div className="relative">
          <select
            value={currentProject.id}
            onChange={(e) => {
              const selected = TEMPLATES.find((t) => t.id === e.target.value);
              if (selected) onSelectTemplate(selected);
            }}
            className="bg-[#1a1a24] border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {TEMPLATES.map((tmpl) => (
              <option key={tmpl.id} value={tmpl.id}>
                {tmpl.title} ({tmpl.duration}s)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center Viewport & Composition Format Controls */}
      <div className="hidden lg:flex items-center gap-3 bg-[#171720] border border-neutral-800 rounded-lg p-1 text-xs">
        {/* Aspect Ratio Selector */}
        <div className="flex items-center gap-1 px-1 border-r border-neutral-800">
          {(['16:9', '9:16', '1:1', '4:5'] as AspectRatio[]).map((ratio) => (
            <button
              key={ratio}
              onClick={() => onChangeAspectRatio(ratio)}
              className={`px-2 py-1 rounded text-[11px] font-mono transition ${
                aspectRatio === ratio
                  ? 'bg-blue-600 text-white font-bold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>

        {/* Framerate selector */}
        <div className="flex items-center gap-1 px-1 border-r border-neutral-800">
          {[24, 30, 60].map((rate) => (
            <button
              key={rate}
              onClick={() => onChangeFps(rate)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition ${
                fps === rate ? 'bg-neutral-800 text-blue-400 font-semibold' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {rate}fps
            </button>
          ))}
        </div>

        {/* Overlay Guides */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleSafeAreas}
            title="Toggle Safe Area Margins (Action 90% / Title 80%)"
            className={`p-1.5 rounded transition ${
              showSafeAreas ? 'bg-cyan-500/20 text-cyan-300' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleGrid}
            title="Toggle Rule-of-Thirds Grid"
            className={`p-1.5 rounded transition ${
              showGrid ? 'bg-blue-500/20 text-blue-300' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleLoop}
            title="Toggle Continuous Loop"
            className={`p-1.5 rounded transition ${
              isLooping ? 'bg-amber-500/20 text-amber-300' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2.5">
        {/* Voiceover status / toggle */}
        {onToggleVoiceover && (
          <button
            onClick={onToggleVoiceover}
            title={isVoiceoverEnabled ? "Mute ElevenLabs Voiceover" : "Unmute ElevenLabs Voiceover"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
              isVoiceoverEnabled
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/10'
                : 'bg-neutral-800/80 border-neutral-700 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Mic className={`w-3.5 h-3.5 ${isVoiceoverEnabled ? 'animate-pulse text-emerald-400' : 'text-neutral-500'}`} />
            <span className="hidden sm:inline">Voiceover {isVoiceoverEnabled ? 'ON' : 'OFF'}</span>
          </button>
        )}

        {/* Side Panel Switcher: Easing vs Sound */}
        <div className="flex bg-[#181822] border border-neutral-800 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => onChangeSidePanel('easing')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
              activeSidePanel === 'easing'
                ? 'bg-neutral-800 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Easing</span>
          </button>
          <button
            onClick={() => onChangeSidePanel('sound')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
              activeSidePanel === 'sound'
                ? 'bg-neutral-800 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Audio SFX</span>
          </button>
        </div>

        {/* AI Motion Director Button */}
        <button
          onClick={onOpenAiDirector}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Director</span>
        </button>

        {/* Render & Export Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xs font-semibold border border-neutral-700 transition cursor-pointer"
        >
          <Film className="w-3.5 h-3.5 text-purple-400" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
