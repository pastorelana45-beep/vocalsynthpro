
/**
 * Detects pitch using autocorrelation. 
 * Optimized for vocal range (approx 80Hz to 1200Hz).
 */
export function detectPitch(buffer: Float32Array, sampleRate: number): number | null {
  const SIZE = buffer.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) {
    const val = buffer[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);

  // If signal is too quiet, bail
  if (rms < 0.01) return null;

  let r1 = 0, r2 = SIZE - 1;
  const thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buffer[SIZE - i]) < thres) { r2 = SIZE - i; break; }
  }

  const slice = buffer.slice(r1, r2);
  const L = slice.length;
  const c = new Float32Array(L);
  for (let i = 0; i < L; i++) {
    for (let j = 0; j < L - i; j++) {
      c[i] = c[i] + slice[j] * slice[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxval = -1, maxpos = -1;
  for (let i = d; i < L; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  const T0 = maxpos;
  const freq = sampleRate / T0;

  // Vocal filter: ignore extreme outliers
  if (freq < 50 || freq > 2000) return null;
  return freq;
}

export function frequencyToMidi(frequency: number): number {
  return Math.round(12 * (Math.log(frequency / 440) / Math.log(2))) + 69;
}

export function frequencyToMidiFloat(frequency: number): number {
  return 12 * (Math.log(frequency / 440) / Math.log(2)) + 69;
}

export function midiToNoteName(midi: number): string {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const octave = Math.floor(midi / 12) - 1;
  const name = notes[midi % 12];
  return name + octave;
}
