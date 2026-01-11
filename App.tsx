
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as Tone from 'tone';
import { 
  Music, Settings, Mic, Play, Square, Volume2, Trash2, 
  Activity, Disc, History, AudioWaveform,
  ChevronRight, XCircle, Mic2, Zap, Hash, ListMusic, Ghost, User, Bot, Stars,
  MoveUp, MoveDown, Loader2, Timer, Sparkles, Sliders, Download, Layers, Combine,
  VolumeX, Volume1, ArrowRightToLine, AlertCircle, FileAudio, FileJson, Share2,
  ChevronDown, ExternalLink, FastForward, Wand2, MessageSquareText
} from 'lucide-react';
import { INSTRUMENTS, SCALES, SAMPLE_MAPS, MIN_NOTE_DURATION } from './constants';
import { Instrument, WorkstationMode, RecordedNote, StudioSession, ScaleType, VoiceEffect } from './types';
import { detectPitch, frequencyToMidi, frequencyToMidiFloat, midiToNoteName } from './services/pitchDetection';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  // --- State ---
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>(INSTRUMENTS[0]);
  const [mode, setMode] = useState<WorkstationMode>(WorkstationMode.IDLE);
  const [isStarted, setIsStarted] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [setupStep, setSetupStep] = useState<'PERMISSION' | 'LOADING' | 'COMPLETE'>('PERMISSION');
  const [currentMidiNote, setCurrentMidiNote] = useState<number | null>(null);
  const [currentChordName, setCurrentChordName] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingBack, setIsPlayingBack] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState<string | null>(null);
  const [sessions, setSessions] = useState<StudioSession[]>([]);
  const [rmsVolume, setRmsVolume] = useState(0);
  const [sensitivity, setSensitivity] = useState(0.015); 
  const [micBoost, setMicBoost] = useState(3.0); 
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'BROWSER' | 'VAULT'>('BROWSER');
  const [isInstrumentLoading, setIsInstrumentLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [bendMode, setBendMode] = useState(true);
  const [skipSilences, setSkipSilences] = useState(false);
  const [openExportId, setOpenExportId] = useState<string | null>(null);
  
  // AI Insights State
  const [aiAnalysis, setAiAnalysis] = useState<{ id: string, text: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);

  // Mixer & Harmonic State
  const [leadVol, setLeadVol] = useState(0.8);
  const [chordVol, setChordVol] = useState(0.4);
  const [isHarmonizerActive, setIsHarmonizerActive] = useState(true);

  const [bpm, setBpm] = useState(120);
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [currentScale, setCurrentScale] = useState<ScaleType>('MAJOR');

  // --- Audio Refs ---
  const leadSamplerRef = useRef<Tone.Sampler | Tone.PolySynth | null>(null);
  const chordSamplerRef = useRef<Tone.Sampler | Tone.PolySynth | null>(null);
  const leadGainRef = useRef<Tone.Gain | null>(null);
  const chordGainRef = useRef<Tone.Gain | null>(null);
  const vibratoRef = useRef<Tone.Vibrato | null>(null);
  const mainFxRef = useRef<{ 
    reverb: Tone.Reverb, 
    delay: Tone.FeedbackDelay, 
    filter: Tone.Filter,
    masterLimiter: Tone.Limiter,
    masterCompressor: Tone.Compressor
  } | null>(null);
  const micRef = useRef<Tone.UserMedia | null>(null);
  const analyserRef = useRef<Tone.Analyser | null>(null);
  const recorderRef = useRef<Tone.Recorder | null>(null);
  const playerRef = useRef<Tone.Player | null>(null);
  const voicePassthroughRef = useRef<Tone.Gain | null>(null);
  const metronomeRef = useRef<Tone.MembraneSynth | null>(null);
  const audioLoopIntervalRef = useRef<number | null>(null);
  
  const stateRef = useRef({ 
    mode: WorkstationMode.IDLE, 
    isRecording: false, 
    isPlayingBack: false, 
    lastMidi: null as number | null, 
    sensitivity: 0.015, 
    micBoost: 3.0, 
    scale: 'MAJOR' as ScaleType, 
    bendMode: true, 
    isHarmonizerActive: true 
  });
  const recordingNotesRef = useRef<RecordedNote[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const activeNoteStartRef = useRef<{ note: string, time: number } | null>(null);

  // --- Logic ---
  const groupedInstruments = useMemo(() => INSTRUMENTS.reduce((acc, inst) => {
    if (!acc[inst.category]) acc[inst.category] = [];
    acc[inst.category].push(inst);
    return acc;
  }, {} as Record<string, Instrument[]>), []);

  useEffect(() => {
    stateRef.current = { ...stateRef.current, mode, isRecording, isPlayingBack: !!isPlayingBack, sensitivity, micBoost, scale: currentScale, bendMode, isHarmonizerActive };
    
    const isPlaybackMidi = isPlayingBack?.includes('_midi');
    const isLiveMidiFeedback = (mode === WorkstationMode.MIDI); 
    
    if (leadGainRef.current && chordGainRef.current) {
      const activeState = (isPlaybackMidi || isLiveMidiFeedback) ? 1 : 0;
      leadGainRef.current.gain.rampTo(leadVol * activeState, 0.1);
      chordGainRef.current.gain.rampTo(isHarmonizerActive ? chordVol * activeState : 0, 0.1);
    }
    if (voicePassthroughRef.current) voicePassthroughRef.current.gain.value = (mode === WorkstationMode.VOICE) ? 1 : 0;
  }, [mode, isRecording, isPlayingBack, sensitivity, micBoost, currentScale, bendMode, leadVol, chordVol, isHarmonizerActive]);

  const getChordNotes = (midi: number, scaleType: ScaleType): { notes: number[], name: string } => {
    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const rootName = noteNames[midi % 12];
    if (scaleType === 'CHROMATIC') return { notes: [midi, midi + 4, midi + 7], name: `${rootName} Maj` };
    const scale = SCALES[scaleType];
    const rootInOctave = midi % 12;
    const octave = Math.floor(midi / 12);
    const degree = scale.indexOf(rootInOctave);
    if (degree === -1) return { notes: [midi], name: `${rootName}` };
    const getNoteAtDegree = (offset: number) => {
      const targetDegreeIndex = (degree + offset) % scale.length;
      const octaveShift = Math.floor((degree + offset) / scale.length);
      return (octave + octaveShift) * 12 + scale[targetDegreeIndex];
    };
    const notes = [midi, getNoteAtDegree(2), getNoteAtDegree(4)];
    const thirdInterval = (scale[(degree + 2) % scale.length] - rootInOctave + 12) % 12;
    return { notes, name: `${rootName}${thirdInterval === 3 ? 'min' : 'Maj'}` };
  };

  const snapToScale = (midi: number, scaleType: ScaleType): number => {
    if (scaleType === 'CHROMATIC') return midi;
    const scale = SCALES[scaleType];
    const noteInOctave = midi % 12;
    const octave = Math.floor(midi / 12);
    const closest = scale.reduce((prev, curr) => Math.abs(curr - noteInOctave) < Math.abs(prev - noteInOctave) ? curr : prev);
    return octave * 12 + closest;
  };

  const processNotes = useCallback((notes: RecordedNote[]) => {
    if (!skipSilences) return notes;
    const sorted = [...notes].sort((a, b) => a.time - b.time);
    let timeOffset = 0; 
    let lastNoteEnd = 0; 
    const GAP_MAX = 0.3;

    return sorted.map((n, i) => {
      if (i === 0) { 
        timeOffset = n.time; 
        lastNoteEnd = n.duration;
        return { ...n, time: 0 }; 
      }
      const realStart = n.time - timeOffset; 
      const gap = realStart - lastNoteEnd;
      if (gap > GAP_MAX) {
        timeOffset += (gap - GAP_MAX);
      }
      const finalStart = n.time - timeOffset; 
      lastNoteEnd = finalStart + n.duration;
      return { ...n, time: finalStart };
    });
  }, [skipSilences]);

  const applyInstrumentSettings = useCallback(async (instrumentId: string, isFallback = false): Promise<void> => {
    if (!mainFxRef.current || !vibratoRef.current) return;
    setIsInstrumentLoading(true);
    setLoadError(null);
    const config = SAMPLE_MAPS[instrumentId] || SAMPLE_MAPS['concert-grand'];
    [leadSamplerRef, chordSamplerRef].forEach(ref => { if (ref.current) { ref.current.releaseAll(); ref.current.dispose(); } });

    const createSampler = (gainNode: Tone.Gain) => new Promise<Tone.Sampler>((resolve, reject) => {
      const s = new Tone.Sampler({ 
        urls: config.urls, 
        baseUrl: config.baseUrl, 
        onload: () => resolve(s),
        onerror: (e) => reject(e)
      }).connect(gainNode);
    });

    try {
      const [lead, chord] = await Promise.all([ createSampler(leadGainRef.current!), createSampler(chordGainRef.current!) ]);
      leadSamplerRef.current = lead; 
      chordSamplerRef.current = chord;
      setIsInstrumentLoading(false);
    } catch (e) { 
      console.warn(`Sampler loading failed for ${instrumentId}:`, e);
      if (!isFallback) {
        applyInstrumentSettings('concert-grand', true);
      } else {
        const createSynth = (gainNode: Tone.Gain) => new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 1.0 }
        }).connect(gainNode);
        leadSamplerRef.current = createSynth(leadGainRef.current!);
        chordSamplerRef.current = createSynth(chordGainRef.current!);
        setLoadError("Engine reverted to basic synth (Network Error)");
        setIsInstrumentLoading(false);
      }
    }
  }, []);

  const initAudioCore = async () => {
    if (Tone.context.state !== 'running') await Tone.start();
    if (leadSamplerRef.current) return true;
    try {
      setSetupStep('LOADING');
      const masterLimiter = new Tone.Limiter(-0.5).toDestination();
      const masterCompressor = new Tone.Compressor({ threshold: -18, ratio: 3 }).connect(masterLimiter);
      const mainReverb = new Tone.Reverb({ decay: 2.8, wet: 0.2 }).connect(masterCompressor);
      const delay = new Tone.FeedbackDelay("8n", 0.15).connect(mainReverb);
      const mainFilter = new Tone.Filter(20000, "lowpass").connect(delay);
      const vibrato = new Tone.Vibrato(0, 0).connect(mainFilter);
      await mainReverb.generate();
      const leadGain = new Tone.Gain(0.8).connect(vibrato);
      const chordGain = new Tone.Gain(0.4).connect(vibrato);
      leadGainRef.current = leadGain; chordGainRef.current = chordGain;
      const metronome = new Tone.MembraneSynth({ volume: -6 }).toDestination();
      const mic = new Tone.UserMedia();
      const analyser = new Tone.Analyser('waveform', 1024); 
      const recorder = new Tone.Recorder();
      const player = new Tone.Player().connect(masterCompressor);
      const voicePassthrough = new Tone.Gain(0).connect(masterCompressor);
      await mic.open(); mic.connect(analyser); mic.connect(recorder); mic.connect(voicePassthrough);
      vibratoRef.current = vibrato; metronomeRef.current = metronome; micRef.current = mic; analyserRef.current = analyser; recorderRef.current = recorder; playerRef.current = player; voicePassthroughRef.current = voicePassthrough;
      mainFxRef.current = { reverb: mainReverb, delay, filter: mainFilter, masterLimiter, masterCompressor };
      await applyInstrumentSettings(selectedInstrument.id);
      if (audioLoopIntervalRef.current) clearInterval(audioLoopIntervalRef.current);
      audioLoopIntervalRef.current = window.setInterval(audioLoop, 30); 
      return true;
    } catch (err) { console.error(err); return false; }
  };

  const audioLoop = () => {
    if (!analyserRef.current || !leadSamplerRef.current || !chordSamplerRef.current) return;
    const buffer = analyserRef.current.getValue() as Float32Array;
    let sum = 0; for (let i = 0; i < buffer.length; i++) { const sample = buffer[i] * stateRef.current.micBoost; sum += sample * sample; }
    const rms = Math.sqrt(sum / buffer.length); setRmsVolume(rms);
    if (stateRef.current.isPlayingBack) return;
    const isMidiActive = stateRef.current.mode === WorkstationMode.MIDI || stateRef.current.mode === WorkstationMode.RECORD;
    if (rms > stateRef.current.sensitivity && isMidiActive) {
      const freq = detectPitch(buffer, Tone.getContext().sampleRate);
      let dMidiFloat = freq ? frequencyToMidiFloat(freq) : null;
      if (dMidiFloat !== null) {
        const dMidi = snapToScale(Math.round(dMidiFloat), stateRef.current.scale);
        if (stateRef.current.bendMode) {
          const bend = (dMidiFloat - Math.round(dMidiFloat)) * 100;
          if ('set' in leadSamplerRef.current) leadSamplerRef.current.set({ detune: bend }); 
          if ('set' in chordSamplerRef.current) chordSamplerRef.current.set({ detune: bend });
        }
        
        if (dMidi !== stateRef.current.lastMidi) {
          const nName = midiToNoteName(dMidi); if (nName.startsWith("undefined")) return;
          if (stateRef.current.mode === WorkstationMode.RECORD && activeNoteStartRef.current) {
            const duration = Tone.now() - recordingStartTimeRef.current - activeNoteStartRef.current.time;
            if (duration >= MIN_NOTE_DURATION) {
              recordingNotesRef.current.push({ ...activeNoteStartRef.current, duration });
            }
          }
          leadSamplerRef.current.releaseAll(); 
          leadSamplerRef.current.triggerAttack(nName);
          chordSamplerRef.current.releaseAll();
          if (stateRef.current.isHarmonizerActive) {
            const chord = getChordNotes(dMidi, stateRef.current.scale); setCurrentChordName(chord.name);
            chord.notes.forEach(m => chordSamplerRef.current?.triggerAttack(midiToNoteName(m)));
          } else setCurrentChordName(null);
          setCurrentMidiNote(dMidi); 
          stateRef.current.lastMidi = dMidi;
          if (stateRef.current.mode === WorkstationMode.RECORD) {
            activeNoteStartRef.current = { note: nName, time: Tone.now() - recordingStartTimeRef.current };
          }
        }
      }
    } else if (stateRef.current.lastMidi !== null) {
      leadSamplerRef.current.releaseAll(); 
      chordSamplerRef.current.releaseAll();
      if (stateRef.current.mode === WorkstationMode.RECORD && activeNoteStartRef.current) {
        const duration = Tone.now() - recordingStartTimeRef.current - activeNoteStartRef.current.time;
        if (duration >= MIN_NOTE_DURATION) {
          recordingNotesRef.current.push({ ...activeNoteStartRef.current, duration });
        }
        activeNoteStartRef.current = null;
      }
      stateRef.current.lastMidi = null; 
      setCurrentMidiNote(null); 
      setCurrentChordName(null);
    }
  };

  const getAiInsights = async (session: StudioSession) => {
    setIsAnalyzing(session.id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const midiContext = session.midiNotes.map(n => n.note).slice(0, 10).join(', ');
      const prompt = `Agisci come un produttore musicale professionista di classe mondiale. Analizza questa sessione vocale-to-MIDI:
        Strumento: ${session.instrumentId}
        BPM: ${session.bpm}
        Scala: ${session.scale}
        Note rilevate (prime 10): ${midiContext}
        
        Fornisci un breve feedback creativo (max 100 parole) in italiano. Suggerisci un genere musicale adatto, un trucco di produzione (es. "usa un sidechain compressor") e come espandere l'idea. Sii molto incoraggiante e tecnico.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiAnalysis({ id: session.id, text: response.text || "Impossibile generare l'analisi al momento." });
    } catch (err) {
      console.error(err);
      setAiAnalysis({ id: session.id, text: "Errore durante la connessione con l'AI Studio. Riprova tra poco." });
    } finally {
      setIsAnalyzing(null);
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      stopAllPlayback(); 
      recordingNotesRef.current = []; 
      recordingStartTimeRef.current = Tone.now();
      recorderRef.current?.start(); 
      setIsRecording(true); 
      setMode(WorkstationMode.RECORD);
    } else {
      const audioBlob = await recorderRef.current?.stop();
      setIsRecording(false); 
      setMode(WorkstationMode.IDLE);
      if (activeNoteStartRef.current) {
        const duration = Tone.now() - recordingStartTimeRef.current - activeNoteStartRef.current.time;
        if (duration >= MIN_NOTE_DURATION) {
          recordingNotesRef.current.push({ ...activeNoteStartRef.current, duration });
        }
        activeNoteStartRef.current = null;
      }
      if (audioBlob) {
        setSessions(prev => [{ 
          id: Math.random().toString(36).substr(2, 9), 
          timestamp: Date.now(), 
          midiNotes: [...recordingNotesRef.current], 
          audioUrl: URL.createObjectURL(audioBlob), 
          instrumentId: selectedInstrument.id, 
          bpm, 
          scale: currentScale 
        }, ...prev]);
      }
      setActiveTab('VAULT');
    }
  };

  const stopAllPlayback = () => { 
    [leadSamplerRef, chordSamplerRef].forEach(ref => ref.current?.releaseAll()); 
    playerRef.current?.stop(); 
    setIsPlayingBack(null); 
    setCurrentMidiNote(null); 
    setCurrentChordName(null); 
    stateRef.current.lastMidi = null; 
  };

  const playSessionMidi = async (session: StudioSession) => {
    if (isPlayingBack) stopAllPlayback();
    setIsPlayingBack(session.id + "_loading");
    try {
      await applyInstrumentSettings(session.instrumentId);
      setIsPlayingBack(session.id + "_midi");
      
      const processed = processNotes(session.midiNotes);
      
      const now = Tone.now() + 0.1; 
      let maxD = 0;
      processed.forEach(n => {
        leadSamplerRef.current?.triggerAttackRelease(n.note, n.duration, now + n.time);
        if (isHarmonizerActive) {
          const midiVal = Tone.Frequency(n.note).toMidi();
          const chord = getChordNotes(midiVal, session.scale);
          chord.notes.forEach(m => chordSamplerRef.current?.triggerAttackRelease(midiToNoteName(m), n.duration, now + n.time));
        }
        maxD = Math.max(maxD, n.time + n.duration);
      });
      setTimeout(() => setIsPlayingBack(null), (maxD * 1000) + 1000);
    } catch (e) { setIsPlayingBack(null); }
  };

  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  const exportMidi = (session: StudioSession) => {
    const header = [0x4D, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06, 0x00, 0x01, 0x00, 0x01, 0x01, 0xE0];
    const trackHead = [0x4D, 0x54, 0x72, 0x6B];
    const events: any[] = [];
    
    const processed = processNotes(session.midiNotes);

    processed.forEach(n => {
      const midi = Tone.Frequency(n.note).toMidi();
      events.push({ time: n.time * 480, type: 0x90, data: [midi, 0x60] });
      events.push({ time: (n.time + n.duration) * 480, type: 0x80, data: [midi, 0x00] });
    });
    events.sort((a, b) => a.time - b.time);
    const trackData: number[] = [];
    let lastTime = 0;
    events.forEach(e => {
      let delta = Math.floor(e.time - lastTime);
      const bytes = []; while (delta > 127) { bytes.push((delta & 127) | 128); delta >>= 7; }
      bytes.push(delta); bytes.reverse().forEach(b => trackData.push(b));
      trackData.push(e.type, ...e.data);
      lastTime = e.time;
    });
    trackData.push(0x00, 0xFF, 0x2F, 0x00);
    const trackLen = trackData.length;
    const lenBytes = [ (trackLen >> 24) & 0xFF, (trackLen >> 16) & 0xFF, (trackLen >> 8) & 0xFF, trackLen & 0xFF ];
    const midiBytes = new Uint8Array([...header, ...trackHead, ...lenBytes, ...trackData]);
    downloadBlob(new Blob([midiBytes], { type: 'audio/midi' }), `Session_${session.id}.mid`);
  };

  const audioBufferToWav = (buffer: AudioBuffer) => {
    let numOfChan = buffer.numberOfChannels, length = buffer.length * numOfChan * 2 + 44, bufferWav = new ArrayBuffer(length), view = new DataView(bufferWav), channels = [], i, sample, offset = 0, pos = 0;
    const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };
    const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };
    setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157); setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan); setUint32(buffer.sampleRate); setUint32(buffer.sampleRate * 2 * numOfChan); setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164); setUint32(length - pos - 4);
    for(i=0; i<buffer.numberOfChannels; i++) channels.push(buffer.getChannelData(i));
    while(pos < length) { for(i=0; i<numOfChan; i++) { sample = Math.max(-1, Math.min(1, channels[i][offset])); sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; view.setInt16(pos, sample, true); pos += 2; } offset++; }
    return bufferWav;
  };

  const renderMasterMix = async (session: StudioSession) => {
    setIsRendering(session.id);
    setOpenExportId(null);
    try {
      const processed = processNotes(session.midiNotes);
      const duration = Math.max(...processed.map(n => n.time + n.duration), 2) + 1;
      
      const buffer = await Tone.Offline(async (context) => {
        const samplerConfig = SAMPLE_MAPS[session.instrumentId] || SAMPLE_MAPS['concert-grand'];
        const offlineSampler = new Tone.Sampler({ 
          urls: samplerConfig.urls, 
          baseUrl: samplerConfig.baseUrl 
        }).toDestination();
        
        const offlinePlayer = new Tone.Player(session.audioUrl).toDestination();
        await Tone.loaded();
        
        if (!skipSilences) {
          offlinePlayer.start(0);
        } else {
          offlinePlayer.volume.value = -100; 
        }

        processed.forEach(n => {
          offlineSampler.triggerAttackRelease(n.note, n.duration, n.time);
          if (isHarmonizerActive) {
            const chord = getChordNotes(Tone.Frequency(n.note).toMidi(), session.scale);
            chord.notes.forEach(m => offlineSampler.triggerAttackRelease(midiToNoteName(m), n.duration, n.time));
          }
        });
      }, duration);
      const wav = audioBufferToWav(buffer);
      downloadBlob(new Blob([wav], { type: 'audio/wav' }), `MasterMix_${session.id}.wav`);
    } catch (e) { console.error(e); } finally { setIsRendering(null); }
  };

  const startSetupWizard = async () => {
    setIsConfiguring(true); setSetupStep('PERMISSION');
    if (await initAudioCore()) setSetupStep('COMPLETE');
    else setIsConfiguring(false);
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col overflow-hidden font-sans select-none text-[10px]">
      
      {/* Header */}
      <header className="px-3 py-2 flex justify-between items-center bg-zinc-950/95 border-b border-white/5 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <Combine size={16} className="text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[10px] font-black uppercase tracking-tighter leading-none">VocalSynth<span className="text-purple-500">Pro</span></h1>
            <p className="text-[6px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Commercial Build v10.1</p>
          </div>
        </div>
        {isStarted && (
          <div className="flex items-center gap-2">
            <div className="flex bg-zinc-900 rounded-full px-2.5 py-1 items-center gap-1.5 border border-white/10">
              <Timer size={10} className={isMetronomeActive ? 'text-emerald-500 animate-pulse' : 'text-zinc-600'} />
              <input type="number" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="bg-transparent w-6 text-[9px] font-black outline-none text-center" />
            </div>
            <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 bg-zinc-900 rounded-full border border-white/10 hover:bg-zinc-800 transition-colors"><Settings size={14} /></button>
          </div>
        )}
      </header>

      {/* Visualizer Area */}
      {isStarted && (
        <div className="w-full h-16 bg-zinc-950 relative border-b border-white/5 flex items-center justify-center overflow-hidden">
          <div className="flex items-center gap-1.5 opacity-40">
             {Array.from({ length: 60 }).map((_, i) => (
                <div key={i} className={`w-1 rounded-full bg-gradient-to-t transition-all duration-75 ${i % 2 === 0 ? 'from-purple-600 via-white to-cyan-400' : 'from-blue-600 via-white to-purple-400'}`} style={{ height: `${Math.max(2, (rmsVolume * 400 * (0.5 + Math.random()))) }px`, transform: `translateY(${(Math.sin(i * 0.2) * 5)}px)` }} />
             ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-around px-3 pointer-events-none z-10">
             <div className="flex flex-col items-center">
               <span className="text-[7px] font-black text-zinc-600 uppercase tracking-[0.3em]">Pitch</span>
               <div className="text-xl font-black text-white font-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{currentMidiNote ? midiToNoteName(currentMidiNote) : '--'}</div>
             </div>
             <div className="flex flex-col items-center">
               <span className="text-[7px] font-black text-zinc-600 uppercase tracking-[0.3em]">Harmonics</span>
               <div className="text-xl font-black text-purple-400 font-mono tracking-tighter drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">{currentChordName || 'OFF'}</div>
             </div>
          </div>
        </div>
      )}

      {isConfiguring && (
        <div className="absolute inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-xl">
          <Layers size={40} className="text-purple-500 animate-pulse mb-6" />
          <h3 className="text-xl font-black italic mb-2 text-white uppercase">{setupStep}</h3>
          <p className="text-zinc-500 text-[8px] font-bold tracking-[0.4em] uppercase">Matrix Calibration...</p>
          {setupStep === 'COMPLETE' && <button onClick={() => { setIsConfiguring(false); setIsStarted(true); }} className="mt-10 w-full max-w-xs bg-white text-black py-4 rounded-full font-black text-sm uppercase italic shadow-2xl transition-all hover:scale-105 active:scale-95">Start Engine</button>}
        </div>
      )}

      {isStarted && (
        <main className="flex-1 flex flex-col px-4 overflow-hidden bg-zinc-950">
          
          {loadError && (
            <div className="mt-2 bg-red-950/40 border border-red-500/20 p-2 rounded-xl flex items-center gap-2 text-red-400 text-[7px] font-black uppercase tracking-widest">
              <AlertCircle size={12} /> {loadError}
            </div>
          )}

          {/* Mixer */}
          <section className="bg-zinc-900/30 mt-4 p-4 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center mb-4">
               <div className="flex items-center gap-1.5">
                 <Sliders size={12} className="text-purple-500" />
                 <span className="text-[8px] font-black text-zinc-500 tracking-widest uppercase">Console Mix</span>
               </div>
               <button onClick={() => setIsHarmonizerActive(!isHarmonizerActive)} className={`px-3 py-1 rounded-full border text-[7px] font-black uppercase transition-all ${isHarmonizerActive ? 'bg-purple-600 border-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                 Harmonizer: {isHarmonizerActive ? 'ON' : 'OFF'}
               </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <div className="flex justify-between text-[7px] font-black text-zinc-600 uppercase"><span>Lead</span><span>{Math.round(leadVol * 100)}%</span></div>
                 <input type="range" min="0" max="1" step="0.01" value={leadVol} onChange={e => setLeadVol(parseFloat(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-white" />
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between text-[7px] font-black text-zinc-600 uppercase"><span>Chord</span><span>{Math.round(chordVol * 100)}%</span></div>
                 <input type="range" min="0" max="1" step="0.01" value={chordVol} onChange={e => setChordVol(parseFloat(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-purple-500" />
              </div>
            </div>
          </section>

          {/* Scale Strip */}
          <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {(Object.keys(SCALES) as ScaleType[]).map(s => (
              <button key={s} onClick={() => setCurrentScale(s)} className={`flex-none px-4 py-2 rounded-xl text-[8px] font-black transition-all border ${currentScale === s ? 'bg-white text-black border-white scale-105' : 'bg-zinc-900 text-zinc-600 border-transparent hover:bg-zinc-800'}`}>
                {s}
              </button>
            ))}
          </div>

          {/* Modes */}
          <section className="grid grid-cols-3 gap-2 my-4 shrink-0">
            <button onClick={() => setMode(mode === WorkstationMode.MIDI ? WorkstationMode.IDLE : WorkstationMode.MIDI)} className={`py-3 rounded-2xl flex flex-col items-center gap-1 border-2 transition-all ${mode === WorkstationMode.MIDI ? 'bg-purple-600 border-purple-400 shadow-[0_0_20px_rgba(147,51,234,0.3)]' : 'bg-zinc-900 border-transparent text-zinc-600'}`}><Activity size={18} /><span className="text-[7px] font-black uppercase tracking-widest">Harmonic</span></button>
            <button onClick={() => setMode(mode === WorkstationMode.VOICE ? WorkstationMode.IDLE : WorkstationMode.VOICE)} className={`py-3 rounded-2xl flex flex-col items-center gap-1 border-2 transition-all ${mode === WorkstationMode.VOICE ? 'bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'bg-zinc-900 border-transparent text-zinc-600'}`}><Mic2 size={18} /><span className="text-[7px] font-black uppercase tracking-widest">Direct</span></button>
            <button onClick={toggleRecording} className={`py-3 rounded-2xl flex flex-col items-center gap-1 border-2 transition-all ${isRecording ? 'bg-red-600 border-red-400 animate-pulse' : 'bg-zinc-900 border-transparent text-zinc-600'}`}>{isRecording ? <Square size={18} fill="white" /> : <Disc size={18} />}<span className="text-[7px] font-black uppercase tracking-widest">Session</span></button>
          </section>

          {/* Tabs */}
          <div className="flex gap-2 mb-3 bg-zinc-900/60 p-1.5 rounded-2xl border border-white/5">
             <button onClick={() => setActiveTab('BROWSER')} className={`flex-1 py-2.5 rounded-xl text-[8px] font-black uppercase flex items-center justify-center gap-2 transition-all ${activeTab === 'BROWSER' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}><ListMusic size={14} /> Library</button>
             <button onClick={() => setActiveTab('VAULT')} className={`flex-1 py-2.5 rounded-xl text-[8px] font-black uppercase flex items-center justify-center gap-2 transition-all ${activeTab === 'VAULT' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}><History size={14} /> Vault ({sessions.length})</button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar rounded-2xl bg-zinc-900/20 border border-white/5 p-4 mb-32 relative">
            {activeTab === 'BROWSER' ? (
              <div className="space-y-6">
                 {(Object.entries(groupedInstruments) as [string, Instrument[]][]).map(([cat, insts]) => (
                  <div key={cat} className="space-y-3">
                    <h4 className="text-[8px] font-black text-zinc-700 tracking-[0.4em] uppercase flex items-center gap-2"><div className="w-4 h-[1px] bg-zinc-800" /> {cat}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {insts.map(inst => (
                        <button key={inst.id} onClick={() => { setSelectedInstrument(inst); applyInstrumentSettings(inst.id); }} className={`p-3 rounded-xl border transition-all text-left flex items-center gap-3 relative ${selectedInstrument.id === inst.id ? 'bg-zinc-900 border-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.1)] scale-[1.02]' : 'bg-zinc-900/40 border-transparent hover:bg-zinc-800/40'}`}>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${selectedInstrument.id === inst.id ? 'bg-purple-600 shadow-lg' : 'bg-zinc-800'}`}>
                            <Music size={24} className={selectedInstrument.id === inst.id ? 'text-white' : 'text-zinc-500'} />
                          </div>
                          <span className={`text-[9px] font-black uppercase truncate ${selectedInstrument.id === inst.id ? 'text-white' : 'text-zinc-700'}`}>{inst.name}</span>
                          {isInstrumentLoading && selectedInstrument.id === inst.id && (
                            <div className="absolute top-2 right-2"><Loader2 size={10} className="animate-spin text-purple-400" /></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1 pb-2 border-b border-white/5">
                   <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Saved Recordings</span>
                   <button onClick={() => setSkipSilences(!skipSilences)} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[7px] font-black uppercase transition-all ${skipSilences ? 'bg-emerald-600 border-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
                     <FastForward size={10} /> Skip Silence
                   </button>
                </div>
                {sessions.length === 0 && <div className="py-16 text-center opacity-10"><History size={40} className="mx-auto" /></div>}
                {sessions.map(s => (
                  <div key={s.id} className="p-4 bg-zinc-950 rounded-2xl border border-white/10 shadow-xl relative overflow-visible group">
                    <div className="flex justify-between items-center mb-4">
                       <select value={s.instrumentId} onChange={(e) => setSessions(prev => prev.map(x => x.id === s.id ? { ...x, instrumentId: e.target.value } : x))} className="bg-zinc-900 text-purple-400 text-[9px] font-black uppercase rounded-lg px-2 py-1 outline-none border border-white/10">
                         {INSTRUMENTS.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                       </select>
                       <div className="flex gap-1">
                         <button onClick={() => getAiInsights(s)} disabled={isAnalyzing === s.id} className={`p-2 rounded-lg transition-all ${isAnalyzing === s.id ? 'bg-purple-900 animate-pulse' : 'text-purple-400 hover:bg-purple-400/10'}`}>
                           {isAnalyzing === s.id ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                         </button>
                         <div className="relative">
                            <button onClick={() => setOpenExportId(openExportId === s.id ? null : s.id)} className="p-2 text-zinc-500 hover:text-white transition-colors"><Download size={16} /></button>
                            {openExportId === s.id && (
                              <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-[200] overflow-hidden backdrop-blur-3xl">
                                <button onClick={() => { fetch(s.audioUrl).then(r => r.blob()).then(b => downloadBlob(b, `Source_${s.id}.wav`)); setOpenExportId(null); }} className="w-full text-left px-4 py-3 text-[8px] font-black uppercase hover:bg-zinc-800 flex items-center gap-3"><Mic size={12} className="text-blue-400" /> Vocal Source</button>
                                <button onClick={() => { exportMidi(s); setOpenExportId(null); }} className="w-full text-left px-4 py-3 text-[8px] font-black uppercase hover:bg-zinc-800 flex items-center gap-3 border-t border-white/5"><Activity size={12} className="text-purple-400" /> MIDI File</button>
                                <button onClick={() => renderMasterMix(s)} className="w-full text-left px-4 py-3 text-[8px] font-black uppercase hover:bg-zinc-800 flex items-center gap-3 border-t border-white/5"><Combine size={12} className="text-emerald-400" /> Master Mix (AI)</button>
                              </div>
                            )}
                         </div>
                         <button onClick={() => setSessions(prev => prev.filter(x => x.id !== s.id))} className="p-2 text-zinc-700 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                       </div>
                    </div>

                    {isRendering === s.id && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
                         <div className="flex items-center gap-3">
                           <Loader2 size={14} className="animate-spin text-emerald-400" />
                           <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Rendering Master...</span>
                         </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => playSessionMidi(s)} className={`py-3 bg-zinc-900 rounded-xl text-[8px] font-black uppercase transition-all flex items-center justify-center gap-2 border border-transparent ${isPlayingBack === s.id + "_midi" ? 'bg-purple-600 text-white shadow-lg border-purple-400' : 'hover:bg-zinc-800 hover:border-zinc-700'}`}>
                        {isPlayingBack === s.id + "_midi" ? <Loader2 size={12} className="animate-spin" /> : <Play size={10} fill="currentColor" />}
                        Harmonic Replay
                      </button>
                      <button onClick={() => { 
                        if (isPlayingBack) stopAllPlayback(); 
                        setIsPlayingBack(s.id + "_audio"); 
                        playerRef.current?.load(s.audioUrl).then(() => { 
                          playerRef.current?.start(); 
                          setTimeout(() => setIsPlayingBack(null), (playerRef.current!.buffer.duration * 1000) + 1000); 
                        }); 
                      }} className={`py-3 bg-zinc-900 rounded-xl text-[8px] font-black uppercase transition-all flex items-center justify-center gap-2 border border-transparent ${isPlayingBack === s.id + "_audio" ? 'bg-blue-600 text-white shadow-lg border-blue-400' : 'hover:bg-zinc-800 hover:border-zinc-700'}`}>
                        {isPlayingBack === s.id + "_audio" ? <Loader2 size={12} className="animate-spin" /> : <Mic size={10} />}
                        Vocal Take
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* AI Analysis Overlay */}
      {aiAnalysis && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 overflow-hidden" onClick={() => setAiAnalysis(null)}>
          <div className="w-full max-w-md bg-zinc-950 border border-purple-500/30 rounded-[2.5rem] shadow-[0_0_50px_rgba(147,51,234,0.2)] p-8 flex flex-col gap-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-2xl flex items-center justify-center">
                  <Wand2 size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-white">AI Producer Insights</h4>
                  <p className="text-[7px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Powered by Gemini Engine</p>
                </div>
              </div>
              <button onClick={() => setAiAnalysis(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><XCircle size={20} className="text-zinc-600" /></button>
            </div>
            
            <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5">
              <p className="text-[10px] leading-relaxed text-zinc-300 font-medium whitespace-pre-wrap italic">"{aiAnalysis.text}"</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setAiAnalysis(null)} className="flex-1 bg-white text-black py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:bg-purple-500 hover:text-white transition-all">Got it, Coach!</button>
              <button className="px-6 bg-zinc-900 text-zinc-500 py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest border border-white/5"><Share2 size={14} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Dock */}
      {isStarted && (
        <div className="fixed bottom-6 left-4 right-4 z-[60]">
          <div className="bg-zinc-950/95 backdrop-blur-3xl border border-white/10 p-3 rounded-3xl flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isRecording ? 'bg-red-600 animate-pulse' : mode === WorkstationMode.VOICE ? 'bg-blue-600' : 'bg-zinc-900 text-zinc-600'}`}>
                {isRecording ? <Disc size={20} className="animate-spin" /> : <Mic size={20} />}
              </div>
              <div className="flex flex-col">
                <span className="text-[6px] font-black text-zinc-600 uppercase tracking-widest leading-none">{mode} ACTIVE</span>
                <span className="text-[11px] font-black text-white italic truncate max-w-[100px] mt-1 uppercase tracking-tighter">{currentChordName || (currentMidiNote ? midiToNoteName(currentMidiNote) : 'IDLE')}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setBendMode(!bendMode)} className={`text-[7px] font-black px-2.5 py-1 rounded-full border transition-all ${bendMode ? 'text-emerald-400 border-emerald-500/30 bg-emerald-400/5' : 'text-zinc-700 border-white/5'}`}>BEND</button>
              <button onClick={stopAllPlayback} className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-600 hover:text-white transition-colors"><Square size={16} fill="currentColor" /></button>
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      {showSettings && (
        <div className="absolute inset-0 z-[150] bg-black/98 flex items-center justify-center p-8 backdrop-blur-xl" onClick={() => setShowSettings(false)}>
           <div className="w-full max-w-sm bg-zinc-950 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3 text-white"><Sliders className="text-purple-500" size={20} /> Preferences</h3>
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex justify-between text-[9px] font-black uppercase text-zinc-500 tracking-widest"><span>Detection Threshold</span><span>{(sensitivity * 100).toFixed(1)}%</span></div>
                  <input type="range" min="0.001" max="0.1" step="0.001" value={sensitivity} onChange={(e) => setSensitivity(parseFloat(e.target.value))} className="w-full h-1 bg-zinc-900 rounded-full appearance-none accent-purple-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[9px] font-black uppercase text-zinc-500 tracking-widest"><span>Input Gain Boost</span><span>{micBoost.toFixed(1)}x</span></div>
                  <input type="range" min="1" max="15" step="0.5" value={micBoost} onChange={(e) => setMicBoost(parseFloat(e.target.value))} className="w-full h-1 bg-zinc-900 rounded-full appearance-none accent-blue-600" />
                </div>
                <div className="pt-4 border-t border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase text-white tracking-widest">Skip Silences</span>
                      <span className="text-[7px] text-zinc-500 uppercase tracking-tight">Trims gaps &gt; 0.3s in MIDI Replay</span>
                    </div>
                    <button onClick={() => setSkipSilences(!skipSilences)} className={`w-10 h-5 rounded-full relative transition-all ${skipSilences ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
                       <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${skipSilences ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Landing */}
      {!isStarted && !isConfiguring && (
        <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-10 text-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-purple-600 rounded-[2rem] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
            <div className="w-24 h-24 bg-purple-600 rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl rotate-12 relative group-hover:rotate-0 transition-transform">
              <Combine size={48} className="text-white" />
            </div>
          </div>
          <h2 className="text-6xl font-black mb-4 tracking-tighter uppercase italic leading-[0.8] text-white">Vocal<br/><span className="text-purple-600">Synth</span></h2>
          <p className="text-zinc-700 text-[8px] mt-8 mb-16 uppercase font-black tracking-[0.6em]">Pro Studio Engine Commercial v10.1</p>
          <button onClick={startSetupWizard} className="w-full max-w-[240px] bg-white text-black py-6 rounded-full font-black text-xl hover:bg-purple-500 hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">INITIALIZE</button>
        </div>
      )}

      <style>{`
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: #fff; cursor: pointer; border: 3px solid currentColor; box-shadow: 0 0 10px rgba(0,0,0,0.5); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

export default App;
