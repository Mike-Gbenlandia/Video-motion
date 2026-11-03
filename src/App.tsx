/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MotionProject, AspectRatio, SoundCue } from './types';
import { TEMPLATES } from './templates/templates';
import { CanvasRenderer } from './components/CanvasRenderer';
import { Timeline } from './components/Timeline';
import { Header } from './components/Header';
import { EasingGraphEditor } from './components/EasingGraphEditor';
import { SoundDesignPanel } from './components/SoundDesignPanel';
import { AiDirectorModal } from './components/AiDirectorModal';
import { ExportModal } from './components/ExportModal';
import { audioEngine } from './lib/audioEngine';

export default function App() {
  const [project, setProject] = useState<MotionProject>(TEMPLATES[0]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(TEMPLATES[0].aspectRatio);
  const [fps, setFps] = useState<number>(TEMPLATES[0].fps || 60);
  const [showSafeAreas, setShowSafeAreas] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [activeSidePanel, setActiveSidePanel] = useState<'easing' | 'sound'>('easing');
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isVoiceoverEnabled, setIsVoiceoverEnabled] = useState<boolean>(true);

  const canvasRef = useRef<HTMLDivElement>(null);
  const voiceoverAudioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const triggeredCuesRef = useRef<Set<string>>(new Set());

  // Synchronize Voiceover Audio
  useEffect(() => {
    if (!voiceoverAudioRef.current) {
      voiceoverAudioRef.current = new Audio();
    }
    const audio = voiceoverAudioRef.current;
    if (project.voiceoverUrl && isVoiceoverEnabled) {
      const fullUrl = project.voiceoverUrl;
      if (!audio.src.endsWith(fullUrl)) {
        audio.src = fullUrl;
      }
      audio.volume = audioEngine.getIsMuted() ? 0 : audioEngine.getVolume();
      if (isPlaying) {
        if (Math.abs(audio.currentTime - currentTime) > 0.25) {
          audio.currentTime = currentTime;
        }
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, project.voiceoverUrl, isVoiceoverEnabled, currentTime]);

  // Switch Template
  const handleSelectTemplate = (selected: MotionProject) => {
    setProject(selected);
    setCurrentTime(0);
    setIsPlaying(false);
    setAspectRatio(selected.aspectRatio);
    setFps(selected.fps || 60);
    triggeredCuesRef.current.clear();
    if (voiceoverAudioRef.current) {
      voiceoverAudioRef.current.currentTime = 0;
      voiceoverAudioRef.current.pause();
    }
  };

  // Seek time
  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time);
    if (voiceoverAudioRef.current) {
      voiceoverAudioRef.current.currentTime = time;
    }
    // Clear future cues
    triggeredCuesRef.current.clear();
    // Mark already passed cues so we don't burst fire them
    project.soundCues.forEach((cue) => {
      if (cue.time < time) {
        triggeredCuesRef.current.add(cue.id);
      }
    });
  }, [project.soundCues]);

  // Restart to 0
  const handleRestart = useCallback(() => {
    setCurrentTime(0);
    if (voiceoverAudioRef.current) {
      voiceoverAudioRef.current.currentTime = 0;
    }
    triggeredCuesRef.current.clear();
  }, []);

  // Toggle Play / Pause
  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (next && currentTime >= project.duration) {
        setCurrentTime(0);
        triggeredCuesRef.current.clear();
      }
      return next;
    });
  }, [currentTime, project.duration]);

  // Main high-precision animation loop
  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const loop = (now: number) => {
      if (lastTimeRef.current !== null) {
        const deltaSec = (now - lastTimeRef.current) / 1000;
        setCurrentTime((prevTime) => {
          let nextTime = prevTime + deltaSec;

          // Sound cues check & trigger
          project.soundCues.forEach((cue) => {
            if (
              cue.time >= prevTime &&
              cue.time <= nextTime &&
              !triggeredCuesRef.current.has(cue.id)
            ) {
              triggeredCuesRef.current.add(cue.id);
              audioEngine.play(cue.type, {
                pitch: cue.pitch,
                gain: cue.gain,
              });
            }
          });

          // End of duration reached
          if (nextTime >= project.duration) {
            if (isLooping) {
              triggeredCuesRef.current.clear();
              return 0;
            } else {
              setIsPlaying(false);
              return project.duration;
            }
          }
          return nextTime;
        });
      }

      lastTimeRef.current = now;
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isLooping, project.duration, project.soundCues]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(Math.max(0, currentTime - 1 / fps));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeek(Math.min(project.duration, currentTime + 1 / fps));
      } else if (e.code === 'Home') {
        e.preventDefault();
        handleRestart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handleSeek, handleRestart, currentTime, fps, project.duration]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0e0e14] text-neutral-100 overflow-hidden select-none font-sans">
      {/* Studio Top Navigation */}
      <Header
        currentProject={project}
        onSelectTemplate={handleSelectTemplate}
        aspectRatio={aspectRatio}
        onChangeAspectRatio={setAspectRatio}
        fps={fps}
        onChangeFps={setFps}
        showSafeAreas={showSafeAreas}
        onToggleSafeAreas={() => setShowSafeAreas((v) => !v)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((v) => !v)}
        isLooping={isLooping}
        onToggleLoop={() => setIsLooping((v) => !v)}
        activeSidePanel={activeSidePanel}
        onChangeSidePanel={setActiveSidePanel}
        isVoiceoverEnabled={isVoiceoverEnabled}
        onToggleVoiceover={() => setIsVoiceoverEnabled((v) => !v)}
        onOpenAiDirector={() => setIsAiModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
      />

      {/* Main Studio Middle Work Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Center Live Canvas Viewport */}
        <main className="flex-1 relative flex flex-col items-center justify-center bg-[#08080c] overflow-hidden">
          <CanvasRenderer
            project={project}
            time={currentTime}
            isPlaying={isPlaying}
            aspectRatio={aspectRatio}
            showSafeAreas={showSafeAreas}
            showGrid={showGrid}
            canvasRef={canvasRef}
          />
        </main>

        {/* Right Side Dock: Easing & Curves or Sound Design */}
        <aside className="w-80 border-l border-neutral-800 bg-[#121219] flex-shrink-0 flex flex-col z-10">
          {activeSidePanel === 'easing' ? (
            <EasingGraphEditor />
          ) : (
            <SoundDesignPanel
              project={project}
              currentTime={currentTime}
              onSeek={handleSeek}
            />
          )}
        </aside>
      </div>

      {/* Bottom Multi-Track Timeline & Playhead */}
      <Timeline
        project={project}
        currentTime={currentTime}
        isPlaying={isPlaying}
        onSeek={handleSeek}
        onTogglePlay={handleTogglePlay}
        onRestart={handleRestart}
      />

      {/* AI Motion Director Modal */}
      <AiDirectorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyProject={handleSelectTemplate}
      />

      {/* Export / Render Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
        currentTime={currentTime}
      />
    </div>
  );
}
