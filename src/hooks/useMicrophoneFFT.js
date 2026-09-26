import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useMicrophoneFFT
 *
 * Captures live microphone input via getUserMedia + Web Audio AnalyserNode.
 * Returns normalised (0–1) frequency band values on every animation frame.
 *
 * bands.bass     — 20–250 Hz  (kick, bass line)
 * bands.mid      — 250–2000 Hz (vocals, snare)
 * bands.treble   — 2000–8000 Hz (hi-hats, air)
 * bands.overall  — RMS amplitude across the full spectrum
 * bands.peak     — instantaneous loudest bin (0–1)
 *
 * status: 'idle' | 'requesting' | 'active' | 'denied' | 'error' | 'stopped'
 */
export function useMicrophoneFFT({ fftSize = 1024, smoothing = 0.8 } = {}) {
  const [status, setStatus] = useState('idle');
  const [bands, setBands] = useState({ bass: 0, mid: 0, treble: 0, overall: 0, peak: 0 });

  const streamRef     = useRef(null);
  const contextRef    = useRef(null);
  const analyserRef   = useRef(null);
  const sourceRef     = useRef(null);
  const frameRef      = useRef(null);
  const dataRef       = useRef(null);

  const stop = useCallback(() => {
    if (frameRef.current) { cancelAnimationFrame(frameRef.current); frameRef.current = null; }
    if (sourceRef.current) { try { sourceRef.current.disconnect(); } catch {} sourceRef.current = null; }
    if (analyserRef.current) { try { analyserRef.current.disconnect(); } catch {} analyserRef.current = null; }
    if (contextRef.current && contextRef.current.state !== 'closed') {
      contextRef.current.close().catch(() => {});
      contextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStatus('stopped');
    setBands({ bass: 0, mid: 0, treble: 0, overall: 0, peak: 0 });
  }, []);

  const start = useCallback(async () => {
    if (status === 'active' || status === 'requesting') return;
    setStatus('requesting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      contextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = smoothing;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      const binCount = analyser.frequencyBinCount;
      dataRef.current = new Uint8Array(binCount);

      // Map frequency bins to Hz bands
      const nyquist = ctx.sampleRate / 2;
      const hzPerBin = nyquist / binCount;

      const bassEnd   = Math.round(250  / hzPerBin);
      const midEnd    = Math.round(2000 / hzPerBin);
      const trebleEnd = Math.round(8000 / hzPerBin);

      function avg(start, end) {
        let sum = 0;
        const len = end - start;
        for (let i = start; i < end; i++) sum += dataRef.current[i];
        return sum / (len * 255);
      }

      function tick() {
        analyser.getByteFrequencyData(dataRef.current);

        const bass    = avg(0, bassEnd);
        const mid     = avg(bassEnd, midEnd);
        const treble  = avg(midEnd, Math.min(trebleEnd, binCount));
        const overall = avg(0, binCount);
        const peak    = Math.max(...dataRef.current) / 255;

        setBands({ bass, mid, treble, overall, peak });
        frameRef.current = requestAnimationFrame(tick);
      }

      frameRef.current = requestAnimationFrame(tick);
      setStatus('active');
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setStatus('denied');
      } else {
        setStatus('error');
      }
    }
  }, [status, fftSize, smoothing]);

  // Clean up on unmount
  useEffect(() => { return () => { stop(); }; }, [stop]);

  return { status, bands, start, stop };
}
