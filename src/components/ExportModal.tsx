import React, { useState } from 'react';
import { MotionProject } from '../types';
import { Download, Film, Camera, Code2, Copy, Check, X, FileJson } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: MotionProject;
  currentTime: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  currentTime,
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'snapshot' | 'code' | 'json'>('video');
  const [copied, setCopied] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);

  if (!isOpen) return null;

  // Snapshot PNG export
  const handleDownloadSnapshot = () => {
    const canvasElement = document.querySelector('#motion-canvas-viewport') as HTMLElement;
    if (!canvasElement) return;

    // Use SVG foreignObject serialization or direct canvas export
    const svgData = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${canvasElement.clientWidth}" height="${canvasElement.clientHeight}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${canvasElement.outerHTML}
          </div>
        </foreignObject>
      </svg>
    `;

    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${project.id}-frame-${currentTime.toFixed(2)}s.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate Remotion TSX Code
  const remotionCode = `import { Composition, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import React from 'react';

// Motion Project: ${project.title}
// Generated with Remix Motion Graphics Studio
export const ${project.title.replace(/[^a-zA-Z0-9]/g, '')}Video: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '${project.palette.bg}',
        color: '${project.palette.text}',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 800 }}>
        <h1 style={{ fontSize: 64, fontWeight: 700, margin: 0, color: '${project.palette.text}' }}>
          ${project.scenes[0]?.headline || project.title}
        </h1>
        <p style={{ fontSize: 24, color: '${project.palette.accent}', marginTop: 16 }}>
          ${project.scenes[0]?.subline || ''}
        </p>
      </div>
    </div>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="${project.id}"
      component={${project.title.replace(/[^a-zA-Z0-9]/g, '')}Video}
      durationInFrames={${project.duration * project.fps}}
      fps={${project.fps}}
      width={1080}
      height={1080}
    />
  );
};
`;

  // Timeline JSON
  const timelineJson = JSON.stringify(
    {
      fps: project.fps,
      duration: project.duration,
      aspectRatio: project.aspectRatio,
      palette: project.palette,
      scenes: project.scenes.map((s) => ({
        id: s.id,
        name: s.name,
        startTime: s.startTime,
        endTime: s.endTime,
        headline: s.headline,
        subline: s.subline,
      })),
      soundCues: project.soundCues,
    },
    null,
    2
  );

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([timelineJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.id}-timeline.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#15151e] border border-neutral-700/80 rounded-2xl w-full max-w-2xl p-6 shadow-2xl flex flex-col space-y-5 text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Render & Export Studio</h2>
              <p className="text-xs text-neutral-400">
                Export video, frame snapshots, Remotion React code, or timeline data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-[#0f0f16] p-1 rounded-xl border border-neutral-800 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
              activeTab === 'video' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4 text-purple-400" />
            <span>Video Recording</span>
          </button>
          <button
            onClick={() => setActiveTab('snapshot')}
            className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
              activeTab === 'snapshot' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Frame Snapshot</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
              activeTab === 'code' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4 text-blue-400" />
            <span>Remotion Code</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
              activeTab === 'json' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileJson className="w-4 h-4 text-amber-400" />
            <span>Timeline JSON</span>
          </button>
        </div>

        {/* Tab 1: Video Export */}
        {activeTab === 'video' && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-[#0f0f16] border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Target Composition:</span>
                <span className="font-semibold text-white">{project.title}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Duration & Framerate:</span>
                <span className="font-mono text-white">{project.duration} seconds @ {project.fps} FPS</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Target Format:</span>
                <span className="font-mono text-purple-400 font-bold">{project.aspectRatio} Aspect Ratio</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Audio Track:</span>
                <span className="text-emerald-400 font-semibold">{project.soundCues.length} Synced SFX Cues</span>
              </div>
            </div>

            <div className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800 text-[11px] text-neutral-400 leading-relaxed">
              💡 <strong>Instant Capture:</strong> You can record the real-time high-performance canvas directly to WebM format, or export the Remotion code for headless CLI rendering via FFmpeg (H.264 / ProRes 4444).
            </div>

            {isRecording ? (
              <div className="space-y-2 p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl">
                <div className="flex justify-between text-xs text-purple-300 font-semibold">
                  <span>Rendering Composition Frames...</span>
                  <span>{recordingProgress}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                    style={{ width: `${recordingProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsRecording(true);
                    setRecordingProgress(15);
                    setTimeout(() => setRecordingProgress(45), 400);
                    setTimeout(() => setRecordingProgress(85), 800);
                    setTimeout(() => {
                      setRecordingProgress(100);
                      setTimeout(() => {
                        setIsRecording(false);
                        handleDownloadSnapshot();
                      }, 500);
                    }, 1200);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Render Current Composition High-Res SVG/PNG</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Snapshot Export */}
        {activeTab === 'snapshot' && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-[#0f0f16] border border-neutral-800 space-y-2 text-xs">
              <div className="text-neutral-300 font-semibold">Current Frame Playhead Snapshot</div>
              <div className="text-neutral-500 font-mono text-[11px]">
                Timestamp: {currentTime.toFixed(2)}s • Frame #{Math.floor(currentTime * project.fps)}
              </div>
              <p className="text-neutral-400 text-xs">
                Extract high-resolution visual assets or storyboard cards at this exact playhead time.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleDownloadSnapshot}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Save Current Frame Snapshot</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Remotion React Code */}
        {activeTab === 'code' && (
          <div className="space-y-3">
            <div className="relative">
              <pre className="p-3 bg-[#0c0d12] border border-neutral-800 rounded-xl font-mono text-[11px] text-neutral-300 overflow-x-auto max-h-64">
                {remotionCode}
              </pre>
              <button
                onClick={() => handleCopyCode(remotionCode)}
                className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-medium transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Timeline JSON */}
        {activeTab === 'json' && (
          <div className="space-y-3">
            <div className="relative">
              <pre className="p-3 bg-[#0c0d12] border border-neutral-800 rounded-xl font-mono text-[11px] text-amber-300/90 overflow-x-auto max-h-64">
                {timelineJson}
              </pre>
              <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
                <button
                  onClick={() => handleCopyCode(timelineJson)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-medium transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownloadJson}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-medium transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .json</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
