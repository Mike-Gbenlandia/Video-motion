import React, { useState } from 'react';
import { MotionProject } from '../types';
import { Sparkles, Wand2, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AiDirectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyProject: (project: MotionProject) => void;
}

export const AiDirectorModal: React.FC<AiDirectorModalProps> = ({
  isOpen,
  onClose,
  onApplyProject,
}) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('modern tech');
  const [duration, setDuration] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedProject, setGeneratedProject] = useState<MotionProject | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setGeneratedProject(null);

    try {
      const response = await fetch('/api/gemini/motion-director', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, duration }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate project with Gemini');
      }

      const p = data.project;

      // Construct a complete MotionProject object
      const fullProject: MotionProject = {
        id: `gen-${Date.now()}`,
        title: p.title || 'AI Generated Motion Piece',
        duration: p.duration || duration,
        fps: p.fps || 60,
        aspectRatio: '16:9',
        palette: p.palette || {
          bg: '#0F1016',
          panel: '#1A1C26',
          accent: '#3B82F6',
          text: '#F8FAFC',
          muted: 'rgba(248, 250, 252, 0.45)',
        },
        scenes: p.scenes || [],
        tracks: [
          {
            id: 'tr-scene-ai',
            name: 'Scene Transitions',
            type: 'scene',
            color: p.palette?.accent || '#3B82F6',
            items: (p.scenes || []).map((s: any, idx: number) => ({
              id: `ai-s-${idx}`,
              trackId: 'tr-scene-ai',
              name: s.name || `Scene ${idx + 1}`,
              startTime: s.startTime || idx * 3,
              duration: (s.endTime || (idx + 1) * 3) - (s.startTime || idx * 3),
              color: p.palette?.accent || '#3B82F6',
              type: 'scene',
            })),
          },
          {
            id: 'tr-text-ai',
            name: 'Kinetic Typography',
            type: 'text',
            color: '#10B981',
            items: (p.scenes || []).map((s: any, idx: number) => ({
              id: `ai-t-${idx}`,
              trackId: 'tr-text-ai',
              name: s.headline || 'Headline',
              startTime: s.startTime || idx * 3,
              duration: (s.endTime || (idx + 1) * 3) - (s.startTime || idx * 3),
              color: '#10B981',
              type: 'text',
            })),
          },
          {
            id: 'tr-audio-ai',
            name: 'Sound FX Cues',
            type: 'audio',
            color: '#F59E0B',
            items: [
              {
                id: 'ai-a-1',
                trackId: 'tr-audio-ai',
                name: 'Procedural Sound Cues',
                startTime: 0,
                duration: p.duration || duration,
                color: '#F59E0B',
                type: 'audio',
              },
            ],
          },
        ],
        soundCues: (p.scenes || []).flatMap((s: any) =>
          (s.soundCues || []).map((c: any, i: number) => ({
            id: `cue-${s.id}-${i}`,
            time: c.time ?? s.startTime + 0.2,
            type: c.type || 'whoosh',
            label: c.label || `${c.type} cue`,
          }))
        ),
      };

      setGeneratedProject(fullProject);
    } catch (err: any) {
      setError(err.message || 'Error communicating with Gemini');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedProject) {
      onApplyProject(generatedProject);
      onClose();
    }
  };

  const samplePrompts = [
    'Announce an open-source AI agent framework with blazing speed metrics and 3 scenes',
    'A high-end teaser for an ultra-fast vector search engine with cybernetic visuals',
    'Editorial product reveal for a luxury minimalist mechanical keyboard',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#15151e] border border-neutral-700/80 rounded-2xl w-full max-w-xl p-6 shadow-2xl flex flex-col space-y-5 text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">AI Motion Director</h2>
              <p className="text-xs text-neutral-400">
                Powered by Gemini — Generates complete storyboards, kinetic typography & sound cues
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

        {/* Input Form */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Creative Brief / Story Concept
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Announce the release of our AI Code Copilot with 3 scenes, punchy copy, and a high-energy climax..."
              className="w-full bg-[#0e0e14] border border-neutral-700 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          {/* Quick Sample Prompts */}
          <div className="flex flex-wrap gap-1.5">
            {samplePrompts.map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => setPrompt(sp)}
                className="text-[10px] font-mono px-2 py-1 bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 rounded-md text-neutral-400 hover:text-white transition"
              >
                + {sp.slice(0, 36)}...
              </button>
            ))}
          </div>

          {/* Style & Duration Controls */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-400">Visual Theme</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-[#0e0e14] border border-neutral-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="modern tech">Modern Tech / Dark Slate</option>
                <option value="claude reasoning">Claude AI / Editorial Serif</option>
                <option value="cyberpunk">Cyberpunk / 3D Neon</option>
                <option value="minimalist">Minimalist Swiss Design</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-neutral-400">
                <span>Duration</span>
                <span className="font-mono text-white">{duration}s</span>
              </div>
              <input
                type="range"
                min="6"
                max="20"
                step="2"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer pt-2"
              />
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Generated Result Preview */}
        {generatedProject && (
          <div className="p-3 bg-[#0e0e14] rounded-xl border border-blue-500/30 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Storyboard Ready: {generatedProject.title}</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Generated {generatedProject.scenes.length} scenes with{' '}
              {generatedProject.soundCues.length} procedural sound cues, color palette{' '}
              <span
                className="inline-block w-2.5 h-2.5 rounded-full ml-1 align-middle"
                style={{ backgroundColor: generatedProject.palette.accent }}
              />
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 text-xs font-semibold transition"
          >
            Cancel
          </button>

          {generatedProject ? (
            <button
              onClick={handleApply}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply to Studio Timeline</span>
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Directing Motion...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Motion Piece</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
