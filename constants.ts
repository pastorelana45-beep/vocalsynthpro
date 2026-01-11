
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
  // PIANO
  { id: 'concert-grand', name: 'Concert Grand', category: 'PIANO' },
  { id: 'rhodes-piano', name: 'Vintage Rhodes', category: 'PIANO' },
  { id: 'church-organ', name: 'Church Organ', category: 'PIANO' },
  { id: 'harpsichord', name: 'Harpsichord', category: 'PIANO' },
  
  // STRINGS
  { id: 'solo-violin', name: 'Solo Violin', category: 'STRINGS' },
  { id: 'solo-cello', name: 'Solo Cello', category: 'STRINGS' },
  { id: 'string-ensemble', name: 'String Ensemble', category: 'STRINGS' },
  { id: 'pizzicato-strings', name: 'Pizzicato Strings', category: 'STRINGS' },
  
  // BRASS
  { id: 'trumpet-solo', name: 'Jazz Trumpet', category: 'BRASS' },
  { id: 'french-horn-ensemble', name: 'Horn Section', category: 'BRASS' },
  { id: 'trombone', name: 'Trombone Solo', category: 'BRASS' },
  
  // REED
  { id: 'alto-sax', name: 'Alto Sax', category: 'REED' },
  { id: 'flute-concert', name: 'Concert Flute', category: 'REED' },
  { id: 'clarinet-classical', name: 'Clarinet', category: 'REED' },
  { id: 'harmonica', name: 'Harmonica', category: 'REED' },
  { id: 'oboe', name: 'Oboe Solo', category: 'REED' },
  
  // GUITAR & BASS
  { id: 'spanish-guitar', name: 'Nylon Guitar', category: 'GUITAR' },
  { id: 'steel-string', name: 'Acoustic Steel', category: 'GUITAR' },
  { id: '12-string', name: '12-String Acoustic', category: 'GUITAR' },
  { id: 'electric-clean', name: 'Clean Electric', category: 'GUITAR' },
  { id: 'electric-muted', name: 'Muted Electric', category: 'GUITAR' },
  { id: 'jazz-guitar', name: 'Jazz Hollow Body', category: 'GUITAR' },
  { id: 'overdrive-guitar', name: 'Crunch Lead', category: 'GUITAR' },
  { id: 'distortion-guitar', name: 'Heavy Distortion', category: 'GUITAR' },
  { id: 'ukulele', name: 'Ukulele Breeze', category: 'GUITAR' },
  { id: 'electric-bass', name: 'Electric Bass', category: 'GUITAR' },
  { id: 'slap-bass', name: 'Funk Slap Bass', category: 'GUITAR' },
  { id: 'banjo', name: 'Banjo Solo', category: 'GUITAR' },
  
  // SYNTH
  { id: 'amour-lead', name: 'L\'Amour Lead (90s)', category: 'SYNTH' },
  { id: 'saw-lead', name: 'Sawtooth Lead', category: 'SYNTH' },
  { id: 'warm-pad', name: 'Atmospheric Pad', category: 'SYNTH' },
  { id: 'dream-strings', name: 'Dream Strings', category: 'SYNTH' },
  { id: 'crystal-bells', name: 'Crystal Bells', category: 'SYNTH' },
  { id: 'choir-aahs', name: 'Choir Aahs', category: 'SYNTH' },

  // PERCUSSION
  { id: 'standard-kit', name: 'Studio Drum Kit', category: 'PERCUSSION' },
  { id: 'amour-909', name: 'Amour 909 Kit', category: 'PERCUSSION' },
  { id: 'steel-drums', name: 'Steel Drums', category: 'PERCUSSION' },
  { id: 'marimba', name: 'Marimba', category: 'PERCUSSION' },
  { id: 'tubular-bells', name: 'Tubular Bells', category: 'PERCUSSION' },
  { id: 'music-box', name: 'Music Box', category: 'PERCUSSION' }
];

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
  'harpsichord': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/harpsichord-mp3/'
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
  'pizzicato-strings': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/pizzicato_strings-mp3/'
  },
  'trumpet-solo': {
    urls: { 'E3': 'E3.mp3', 'C4': 'C4.mp3', 'G4': 'G4.mp3', 'C5': 'C5.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/trumpet-mp3/'
  },
  'french-horn-ensemble': {
    urls: { 'D2': 'D2.mp3', 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/french_horn-mp3/'
  },
  'trombone': {
    urls: { 'C2': 'C2.mp3', 'G2': 'G2.mp3', 'C3': 'C3.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/trombone-mp3/'
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
  'oboe': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/oboe-mp3/'
  },
  'spanish-guitar': {
    urls: { 'E2': 'E2.mp3', 'A2': 'A2.mp3', 'D3': 'D3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_nylon-mp3/'
  },
  'steel-string': {
    urls: { 'E2': 'E2.mp3', 'A2': 'A2.mp3', 'D3': 'D3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_steel-mp3/'
  },
  '12-string': {
    urls: { 'C2': 'C2.mp3', 'G2': 'G2.mp3', 'C3': 'C3.mp3', 'G3': 'G3.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_steel-mp3/'
  },
  'electric-clean': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/electric_guitar_clean-mp3/'
  },
  'electric-muted': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/electric_guitar_muted-mp3/'
  },
  'jazz-guitar': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/electric_guitar_jazz-mp3/'
  },
  'overdrive-guitar': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/overdriven_guitar-mp3/'
  },
  'distortion-guitar': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/distortion_guitar-mp3/'
  },
  'ukulele': {
    urls: { 'C4': 'C4.mp3', 'G4': 'G4.mp3', 'C5': 'C5.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/ukulele-mp3/'
  },
  'electric-bass': {
    urls: { 'E1': 'E1.mp3', 'G1': 'G1.mp3', 'A1': 'A1.mp3', 'C2': 'C2.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/electric_bass_finger-mp3/'
  },
  'slap-bass': {
    urls: { 'C1': 'C1.mp3', 'G1': 'G1.mp3', 'C2': 'C2.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/slap_bass_1-mp3/'
  },
  'banjo': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/banjo-mp3/'
  },
  'amour-lead': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/lead_1_square-mp3/'
  },
  'warm-pad': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/synth_pad_2_warm-mp3/'
  },
  'saw-lead': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/lead_2_sawtooth-mp3/'
  },
  'dream-strings': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/synth_strings_1-mp3/'
  },
  'crystal-bells': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/tinkle_bell-mp3/'
  },
  'choir-aahs': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/choir_aahs-mp3/'
  },
  'standard-kit': {
    urls: { 'C2': 'C2.mp3', 'D2': 'D2.mp3', 'F#2': 'Fs2.mp3', 'A#2': 'As2.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/standard_drum_set-mp3/'
  },
  'amour-909': {
    urls: { 'C2': 'C2.mp3', 'D2': 'D2.mp3', 'F#2': 'Fs2.mp3', 'A#2': 'As2.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/electronic_drum_set-mp3/'
  },
  'steel-drums': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/steel_drums-mp3/'
  },
  'marimba': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/marimba-mp3/'
  },
  'tubular-bells': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/tubular_bells-mp3/'
  },
  'music-box': {
    urls: { 'C3': 'C3.mp3', 'G3': 'G3.mp3', 'C4': 'C4.mp3' },
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/music_box-mp3/'
  }
};
