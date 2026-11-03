import React, { useState } from 'react';
import { MotionProject, SoundCue, SoundType } from '../types';
import { audioEngine } from '../lib/audioEngine';
import { Volume2, VolumeX, Play, Music, Sparkles } from 'lucide-react';

interface SoundDesignPanelProps {
  project: MotionProject;
  currentTime: number;
  onSeek: (time: number) => void;
}

export const SoundDesignPanel: React.FC<SoundDesignPanelProps> = ({
  project,
  currentTime,
  onSeek,
}) => {
  const [volume, setVolume] = useState(audioEngine.getVolume());
  const [isMuted, setIsMuted] = useState(audioEngine.getIsMuted());

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    audioEngine.setVolume(newVol);
  };

  const handleToggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  const playPreview = (type: SoundType) => {
    audioEngine.play(type);
  };

  const soundPalette: { type: SoundType; label: string; desc: string; color: string }[] = [
    { type: 'whoosh', label: 'Whoosh', desc: 'Sweep for cuts & entrances', color: '#3B82F6' },
    { type: 'pop', label: 'Pop', desc: 'Organic bounce for callouts', color: '#10B981' },
    { type: 'click', label: 'Click', desc: 'Mechanical notch or slider step', color: '#F59E0B' },
    { type: 'blip', label: 'Blip', desc: 'Melodic tonal step accent', color: '#8B5CF6' },
    { type: 'chime', label: 'Chime', desc: 'Harmonic D-major resolution chord', color: '#EC4899' },
    { type: 'impact', label: 'Impact', desc: 'Sub-bass 40Hz hero hit', color: '#EF4444' },
    { type: 'riser', label: 'Riser', desc: 'Exponential tension sweep', color: '#06B6D4' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#14141b] border-l border-neutral-800 p-4 space-y-4 text-xs font-sans select-none overflow-y-auto">
      {/* Header & Master Volume */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-neutral-200 uppercase tracking-wide text-[11px]">
            Sound Design & SFX Cue Sheet
          </span>
        </div>
        <button
          onClick={handleToggleMute}
          className={`p-1.5 rounded transition ${
            isMuted ? 'bg-red-500/20 text-red-400' : 'bg-neutral-800 text-neutral-300 hover:text-white'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Volume Slider */}
      <div className="flex items-center gap-3 bg-[#111116] p-2.5 rounded-lg border border-neutral-800">
        <span className="text-[10px] font-mono text-neutral-400 w-16">MASTER GAIN</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => handleVolumeChange(Number(e.target.value))}
          className="flex-1 accent-amber-500 cursor-pointer"
        />
        <span className="text-[10px] font-mono text-neutral-300 w-8 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>

      {/* Interactive Soundboard Test Pad */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-neutral-400">
            PROCEDURAL SYNTH PAD
          </span>
          <span className="text-[9px] font-mono text-neutral-500">CLICK TO AUDITION</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {soundPalette.map((snd) => (
            <button
              key={snd.type}
              onClick={() => playPreview(snd.type)}
              className="p-2 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-700 active:scale-95 text-left transition flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-[11px] text-white flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: snd.color }}
                  />
                  {snd.label}
                </div>
                <div className="text-[9px] text-neutral-500 truncate max-w-[100px]">
                  {snd.desc}
                </div>
              </div>
              <Play className="w-3 h-3 text-neutral-500 group-hover:text-white transition" />
            </button>
          ))}
        </div>
      </div>

      {/* Active Cues List for Current Project */}
      <div className="space-y-2 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-neutral-400">
            TIMELINE CUES ({project.soundCues.length})
          </span>
          <span className="text-[9px] font-mono text-amber-400">FRAME-LOCKED</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-56">
          {project.soundCues.map((cue) => {
            const isNearPlayhead = Math.abs(currentTime - cue.time) < 0.25;
            return (
              <div
                key={cue.id}
                onClick={() => {
                  onSeek(cue.time);
                  audioEngine.play(cue.type);
                }}
                className={`p-2 rounded border cursor-pointer transition flex items-center justify-between text-xs ${
                  isNearPlayhead
                    ? 'border-amber-500 bg-amber-500/15 text-white'
                    : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/80 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-amber-300">
                    {cue.time.toFixed(2)}s
                  </span>
                  <span className="font-medium text-[11px] capitalize">{cue.type}</span>
                  {cue.label && (
                    <span className="text-[10px] text-neutral-400 truncate max-w-[120px]">
                      • {cue.label}
                    </span>
                  )}
                </div>
                <Play className="w-3 h-3 text-neutral-500 hover:text-white" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
