export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';

export interface AspectConfig {
  id: AspectRatio;
  label: string;
  width: number;
  height: number;
  icon: string;
}

export type SoundType = 'whoosh' | 'pop' | 'click' | 'blip' | 'chime' | 'impact' | 'riser';

export interface SoundCue {
  id: string;
  time: number; // in seconds
  type: SoundType;
  label?: string;
  gain?: number;
  pitch?: number;
}

export interface Keyframe {
  id: string;
  time: number; // in seconds
  property: string;
  value: number | string;
  easing?: 'easeOut' | 'easeIn' | 'easeInOut' | 'overshoot' | 'spring' | 'linear';
}

export interface TrackItem {
  id: string;
  trackId: string;
  name: string;
  startTime: number; // in seconds
  duration: number; // in seconds
  color: string;
  type: 'scene' | 'text' | 'graphic' | 'particles' | 'audio' | '3d';
  data?: Record<string, any>;
}

export interface Track {
  id: string;
  name: string;
  type: 'scene' | 'text' | 'graphic' | 'particles' | 'audio' | '3d';
  color: string;
  items: TrackItem[];
  muted?: boolean;
  locked?: boolean;
}

export interface SceneDefinition {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  headline?: string;
  subline?: string;
  accentWord?: string;
  style?: string;
  elements?: string[];
  soundCues?: SoundCue[];
}

export interface MotionProject {
  id: string;
  title: string;
  duration: number; // in seconds
  fps: number;
  aspectRatio: AspectRatio;
  palette: {
    bg: string;
    panel: string;
    accent: string;
    accentSecondary?: string;
    text: string;
    muted: string;
  };
  scenes: SceneDefinition[];
  tracks: Track[];
  soundCues: SoundCue[];
  voiceoverUrl?: string;
}

export interface SpringConfig {
  damping: number;
  stiffness: number;
  mass: number;
}
