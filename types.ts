
export enum WorkstationMode {
  IDLE = 'IDLE',
  MIDI = 'MIDI',
  VOICE = 'VOICE',
  RECORD = 'RECORD'
}

export type ScaleType = 'CHROMATIC' | 'MAJOR' | 'MINOR' | 'PENTATONIC' | 'BLUES';

export interface RecordedNote {
  note: string;
  time: number;
  duration: number;
}

export interface StudioSession {
  id: string;
  timestamp: number;
  midiNotes: RecordedNote[];
  audioUrl: string;
  instrumentId: string;
  bpm: number;
  scale: ScaleType;
}

export interface Instrument {
  id: string;
  name: string;
  category: 'PIANO' | 'STRINGS' | 'REED' | 'BRASS' | 'GUITAR' | 'SYNTH';
  icon?: string;
}

export type VoiceEffect = 'NORMAL' | 'ROBOT' | 'CHIPMUNK' | 'GIANT' | 'SPACE' | 'RADIO';
