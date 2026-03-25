import { useCallback, useRef } from "react";

export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playChime = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const playTone = (time: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime + time); // C5

      gainNode.gain.setValueAtTime(0, ctx.currentTime + time);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + time + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.5);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + 0.5);
    };

    // Play 3 gentle beeps
    playTone(0);
    playTone(0.3);
    playTone(0.6);
  }, []);

  return { playChime };
}
