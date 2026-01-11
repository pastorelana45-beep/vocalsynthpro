
import { Instrument, ScaleType } from './types';

export const MIN_NOTE_DURATION = 0.05;

export const SCALES: Record<ScaleType, number[]> = {
  CHROMATIC: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  MAJOR: [0, 2, 4, 5, 7, 9, 11],
  MINOR: [0, 2, 3, 5, 7, 8, 10],
  PENTATONIC: [0, 2, 4, 7, 9],
  BLUES: [0, 3, 5, 6, 7, 10]
};

export const INSTRUMENTS: Instrument[] = [
  { id: 'concert-grand', name: 'Concert Grand', category: 'PIANO' },
  { id: 'rhodes-piano', name: 'Vintage Rhodes', category: 'PIANO' },
  { id: 'church-organ', name: 'Church Organ', category: 'PIANO' },
  { id: 'solo-violin', name: 'Solo Violin', category: 'STRINGS' },
  { id: 'solo-cello', name: 'Solo Cello', category: 'STRINGS' },
  { id: 'string-ensemble', name: 'String Ensemble', category: 'STRINGS' },
  { id: 'trumpet-solo', name: 'Jazz Trumpet', category: 'BRASS' },
  { id: 'french-horn-ensemble', name: 'Horn Section', category: 'BRASS' },
  { id: 'alto-sax', name: 'Alto Sax', category: 'REED' },
  { id: 'flute-concert', name: 'Concert Flute', category: 'REED' },
  { id: 'clarinet-classical', name: 'Clarinet', category: 'REED' },
  { id: 'harmonica', name: 'Harmonica', category: 'REED' },
  { id: 'spanish-guitar', name: 'Nylon Guitar', category: 'GUITAR' },
  { id: 'steel-string', name: 'Acoustic Steel', category: 'GUITAR' },
  { id: 'electric-bass', name: 'Electric Bass', category: 'GUITAR' },
  { id: 'banjo', name: 'Banjo', category: 'GUITAR' },
  { id: 'saw-lead', name: 'Sawtooth Lead', category: 'SYNTH' },
  { id: 'warm-pad', name: 'Atmospheric Pad', category: 'SYNTH' },
  { id: 'choir-aahs', name: 'Choir Aahs', category: 'SYNTH' }
];

// Simplified mapping to increase reliability
export const SAMPLE_MAPS: Record<string, any> = {
  'concert-grand': {
    urls: { 'A1': 'A1.mp3', 'A2': 'A2.mp3', 'A3': 'A3.mp3', 'A4': 'A4.mp3', 'A5': 'A5.mp3', 'A6': 'A6.mp3' },
    baseUrl: 'https://tonejs.github.io/audio/salamander/'
  },
  'rhodes-piano': {
    urls: { 'C2': 'C2.mp3', 'C3': 'C3.mp3', 'C4': 'C4.mp3', 'C5': 'C5.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/electric_piano_1-mp3/'
  },
  'church-organ': {
    urls: { 'C2': 'C2.mp3', 'C3': 'C3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/church_organ-mp3/'
  },
  'solo-violin': {
    urls: { 'G3': 'G3.mp3', 'C4': 'C4.mp3', 'G4': 'G4.mp3', 'C5': 'C5.mp3', 'G5': 'G5.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/violin-mp3/'
  },
  'solo-cello': {
    urls: { 'C2': 'C2.mp3', 'G2': 'G2.mp3', 'C3': 'C3.mp3', 'G3': 'G3.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/cello-mp3/'
  },
  'string-ensemble': {
    urls: { 'C2': 'C2.mp3', 'G2': 'G2.mp3', 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/string_ensemble_1-mp3/'
  },
  'trumpet-solo': {
    urls: { 'E3': 'E3.mp3', 'C4': 'C4.mp3', 'G4': 'G4.mp3', 'C5': 'C5.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/trumpet-mp3/'
  },
  'french-horn-ensemble': {
    urls: { 'D2': 'D2.mp3', 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/french_horn-mp3/'
  },
  'alto-sax': {
    urls: { 'D3': 'D3.mp3', 'A3': 'A3.mp3', 'E4': 'E4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/alto_sax-mp3/'
  },
  'flute-concert': {
    urls: { 'C4': 'C4.mp3', 'G4': 'G4.mp3', 'C5': 'C5.mp3', 'G5': 'G5.mp3', 'C6': 'C6.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/flute-mp3/'
  },
  'clarinet-classical': {
    urls: { 'D3': 'D3.mp3', 'A3': 'A3.mp3', 'E4': 'E4.mp3', 'A4': 'A4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/clarinet-mp3/'
  },
  'harmonica': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/harmonica-mp3/'
  },
  'spanish-guitar': {
    urls: { 'E2': 'E2.mp3', 'A2': 'A2.mp3', 'D3': 'D3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_nylon-mp3/'
  },
  'steel-string': {
    urls: { 'E2': 'E2.mp3', 'A2': 'A2.mp3', 'D3': 'D3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_steel-mp3/'
  },
  'electric-bass': {
    urls: { 'E1': 'E1.mp3', 'G1': 'G1.mp3', 'A1': 'A1.mp3', 'C2': 'C2.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/electric_bass_finger-mp3/'
  },
  'banjo': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/banjo-mp3/'
  },
  'warm-pad': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/synth_pad_2_warm-mp3/'
  },
  'saw-lead': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/lead_2_sawtooth-mp3/'
  },
  'choir-aahs': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/choir_aahs-mp3/'
  }
};
