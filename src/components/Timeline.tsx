import React, { useRef, useState, useCallback, useEffect } from 'react';
import { MotionProject, SoundCue, Track } from '../types';
import { Volume2, VolumeX, Lock, Unlock, Eye, EyeOff, Play, Pause, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { formatTimecode } from '../lib/motionMath';

interface TimelineProps {
  project: MotionProject;
  currentTime: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  onTogglePlay: () => void;
  onRestart: () => void;
  onSelectCue?: (cue: SoundCue) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  project,
  currentTime,
  isPlaying,
  onSeek,
  onTogglePlay,
  onRestart,
  onSelectCue,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = normal, 2 = 2x, etc.

  const duration = project.duration;
  const fps = project.fps || 60;

  // Handle Scrubbing
  const handleSeekFromClientX = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const progress = Math.max(0, Math.min(1, relativeX / rect.width));
      const targetTime = progress * duration;
      onSeek(targetTime);
    },
    [duration, onSeek]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsScrubbing(true);
    handleSeekFromClientX(e.clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbing) {
        handleSeekFromClientX(e.clientX);
      }
    };
    const handleMouseUp = () => {
      if (isScrubbing) {
        setIsScrubbing(false);
      }
    };

    if (isScrubbing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, handleSeekFromClientX]);

  // Generate tick marks on the ruler
  const ticksCount = Math.ceil(duration);
  const playheadPercent = (currentTime / duration) * 100;

  return (
    <div className="flex flex-col bg-[#121217] border-t border-neutral-800 select-none h-64 shadow-2xl">
      {/* Top Playback Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#181820] border-b border-neutral-800 text-xs">
        {/* Playhead Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRestart}
            title="Jump to Start (0s)"
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow transition"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          {/* Timecode display */}
          <div className="font-mono text-sm px-2.5 py-1 bg-[#0c0d12] border border-neutral-700/80 rounded text-neutral-200">
            <span className="text-blue-400">{formatTimecode(currentTime, fps)}</span>
            <span className="text-neutral-500 mx-1">/</span>
            <span className="text-neutral-400">{formatTimecode(duration, fps)}</span>
          </div>

          <div className="text-neutral-400 font-mono text-[11px] hidden sm:block">
            {fps} FPS • {Math.floor(currentTime * fps)} Frames
          </div>
        </div>

        {/* Timeline Zoom */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 text-[11px]">ZOOM</span>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-neutral-300 font-mono text-xs w-8 text-center">
            {zoomLevel.toFixed(1)}x
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tracks & Ruler Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Track Headers */}
        <div className="w-48 bg-[#15151d] border-r border-neutral-800 flex flex-col flex-shrink-0 z-10">
          <div className="h-6 border-b border-neutral-800 px-3 flex items-center text-[10px] font-mono uppercase text-neutral-500">
            TRACKS ({project.tracks.length})
          </div>
          <div className="flex-1 overflow-y-auto">
            {project.tracks.map((track) => (
              <div
                key={track.id}
                className="h-10 border-b border-neutral-800/80 px-3 flex items-center justify-between text-xs hover:bg-neutral-800/30 group"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: track.color }}
                  />
                  <span className="truncate text-neutral-300 font-medium text-[11px]">
                    {track.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100">
                  <button className="text-neutral-500 hover:text-neutral-300 p-0.5">
                    <Eye className="w-3 h-3" />
                  </button>
                  <button className="text-neutral-500 hover:text-neutral-300 p-0.5">
                    <Lock className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Timeline Canvas & Tracks */}
        <div className="flex-1 flex flex-col overflow-x-auto relative" ref={containerRef}>
          {/* Time Ruler */}
          <div
            className="h-6 bg-[#16161f] border-b border-neutral-800 relative cursor-pointer"
            onMouseDown={handleMouseDown}
          >
            {Array.from({ length: ticksCount + 1 }).map((_, i) => {
              const leftPercent = (i / duration) * 100;
              return (
                <div
                  key={i}
                  style={{ left: `${leftPercent}%` }}
                  className="absolute top-0 bottom-0 flex flex-col justify-end pointer-events-none"
                >
                  <span className="text-[9px] font-mono text-neutral-400 pl-1 -translate-y-2">
                    {i}s
                  </span>
                  <div className="w-px h-2 bg-neutral-600" />
                </div>
              );
            })}
          </div>

          {/* Tracks Content */}
          <div
            className="flex-1 relative cursor-pointer overflow-hidden"
            onMouseDown={handleMouseDown}
          >
            {/* Background vertical second grid lines */}
            {Array.from({ length: ticksCount + 1 }).map((_, i) => {
              const leftPercent = (i / duration) * 100;
              return (
                <div
                  key={i}
                  style={{ left: `${leftPercent}%` }}
                  className="absolute top-0 bottom-0 w-px bg-neutral-800/40 pointer-events-none"
                />
              );
            })}

            {/* Render Track Items */}
            {project.tracks.map((track) => (
              <div
                key={track.id}
                className="h-10 border-b border-neutral-800/60 relative flex items-center px-1"
              >
                {track.items.map((item) => {
                  const left = (item.startTime / duration) * 100;
                  const width = (item.duration / duration) * 100;
                  return (
                    <div
                      key={item.id}
                      style={{
                        left: `${left}%`,
                        width: `${Math.max(1.5, width)}%`,
                        borderColor: track.color,
                        backgroundColor: `${track.color}22`,
                      }}
                      className="absolute h-7 rounded border border-neutral-700/80 px-2 flex items-center overflow-hidden text-[10px] font-mono text-neutral-200 shadow-sm transition hover:brightness-125"
                    >
                      <span className="truncate">{item.name}</span>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Sound Cue Markers Track at the Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/40 pointer-events-none flex items-center">
              {project.soundCues.map((cue) => {
                const cueLeft = (cue.time / duration) * 100;
                return (
                  <div
                    key={cue.id}
                    style={{ left: `${cueLeft}%` }}
                    className="absolute -top-1 transform -translate-x-1/2 flex flex-col items-center group pointer-events-auto cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeek(cue.time);
                      onSelectCue?.(cue);
                    }}
                    title={`${cue.type.toUpperCase()}: ${cue.label || ''} (${cue.time}s)`}
                  >
                    <div className="w-2.5 h-2.5 rotate-45 bg-amber-400 group-hover:scale-125 transition-transform shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                  </div>
                );
              })}
            </div>

            {/* Draggable Playhead Needle */}
            <div
              style={{ left: `${playheadPercent}%` }}
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none shadow-[0_0_10px_rgba(239,68,68,0.8)]"
            >
              {/* Playhead Head Icon */}
              <div className="w-3.5 h-4 bg-red-500 rounded-b -translate-x-1/2 flex items-center justify-center shadow">
                <div className="w-1 h-2 bg-white/70 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
