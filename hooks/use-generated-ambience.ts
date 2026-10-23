import * as React from 'react';
import type { LISTENING_AMBIENCES } from '@/lib/listening-ambiences';

type AmbienceId = (typeof LISTENING_AMBIENCES)[number]['id'];

interface ActiveAmbience {
  context: AudioContext;
  master: GainNode;
  sources: AudioScheduledSourceNode[];
  birdTimer: number | null;
}

function createNoise(context: AudioContext) {
  const buffer = context.createBuffer(1, context.sampleRate * 4, context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let index = 0; index < channel.length; index += 1) {
    channel[index] = Math.random() * 2 - 1;
  }
  return buffer;
}

function addNoiseLayer(
  context: AudioContext,
  master: GainNode,
  buffer: AudioBuffer,
  filters: Array<{ type: BiquadFilterType; frequency: number; q?: number }>,
  volume: number
) {
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  let previous: AudioNode = source;
  for (const settings of filters) {
    const filter = context.createBiquadFilter();
    filter.type = settings.type;
    filter.frequency.value = settings.frequency;
    if (settings.q !== undefined) filter.Q.value = settings.q;
    previous.connect(filter);
    previous = filter;
  }

  const layerGain = context.createGain();
  layerGain.gain.value = volume;
  previous.connect(layerGain);
  layerGain.connect(master);
  source.start();
  return source;
}

function addBirdCall(context: AudioContext, master: GainNode) {
  const start = context.currentTime;
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  const pitch = 2100 + Math.random() * 1200;

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(pitch, start);
  oscillator.frequency.exponentialRampToValueAtTime(pitch * 1.35, start + 0.055);
  oscillator.frequency.exponentialRampToValueAtTime(pitch * 0.78, start + 0.16);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.linearRampToValueAtTime(0.045, start + 0.025);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
  oscillator.connect(envelope);
  envelope.connect(master);
  oscillator.start(start);
  oscillator.stop(start + 0.19);
}

function addFireCrackle(context: AudioContext, master: GainNode) {
  const start = context.currentTime;
  const source = context.createBufferSource();
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.07), context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let index = 0; index < channel.length; index += 1) {
    channel[index] = (Math.random() * 2 - 1) * (1 - index / channel.length);
  }
  source.buffer = buffer;
  const filter = context.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 900 + Math.random() * 1600;
  filter.Q.value = 0.8;
  const envelope = context.createGain();
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.linearRampToValueAtTime(0.025 + Math.random() * 0.035, start + 0.008);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + 0.065);
  source.connect(filter);
  filter.connect(envelope);
  envelope.connect(master);
  source.start(start);
  source.stop(start + 0.07);
}

export function useGeneratedAmbience() {
  const activeRef = React.useRef<ActiveAmbience | null>(null);

  const stop = React.useCallback(() => {
    const active = activeRef.current;
    if (!active) return;
    activeRef.current = null;
    if (active.birdTimer !== null) window.clearInterval(active.birdTimer);
    const now = active.context.currentTime;
    active.master.gain.cancelScheduledValues(now);
    active.master.gain.setValueAtTime(active.master.gain.value, now);
    active.master.gain.linearRampToValueAtTime(0, now + 0.2);
    window.setTimeout(() => {
      active.sources.forEach((source) => source.stop());
      void active.context.close().catch((error: unknown) => {
        console.error('Unable to close generated ambience audio', error);
      });
    }, 240);
  }, []);

  const setVolume = React.useCallback((volume: number) => {
    const active = activeRef.current;
    if (!active) return;
    const now = active.context.currentTime;
    active.master.gain.cancelScheduledValues(now);
    active.master.gain.setTargetAtTime(Math.min(1, Math.max(0, volume)), now, 0.08);
  }, []);

  const play = React.useCallback(async (ambienceId: AmbienceId, volume: number) => {
    stop();
    if (!['rain', 'fire', 'nature', 'sea', 'sky'].includes(ambienceId)) return;
    if (typeof window.AudioContext === 'undefined') {
      throw new DOMException('Web Audio is not supported by this browser', 'NotSupportedError');
    }

    const context = new window.AudioContext();
    const master = context.createGain();
    master.gain.setValueAtTime(0, context.currentTime);
    master.gain.linearRampToValueAtTime(Math.min(1, Math.max(0, volume)), context.currentTime + 0.8);
    master.connect(context.destination);

    try {
      const noise = createNoise(context);
      const sources: AudioScheduledSourceNode[] = [];

      if (ambienceId === 'rain') {
        sources.push(addNoiseLayer(context, master, noise, [
          { type: 'lowpass', frequency: 4200, q: 0.25 },
          { type: 'highpass', frequency: 500, q: 0.25 },
        ], 0.12));
        sources.push(addNoiseLayer(context, master, noise, [
          { type: 'lowpass', frequency: 1100, q: 0.3 },
          { type: 'highpass', frequency: 180, q: 0.3 },
        ], 0.11));
      } else if (ambienceId === 'fire') {
        sources.push(addNoiseLayer(context, master, noise, [
          { type: 'lowpass', frequency: 380, q: 0.4 },
          { type: 'highpass', frequency: 75, q: 0.3 },
        ], 0.18));
        sources.push(addNoiseLayer(context, master, noise, [
          { type: 'highpass', frequency: 2400, q: 0.6 },
          { type: 'lowpass', frequency: 7000, q: 0.4 },
        ], 0.018));
      } else if (ambienceId === 'sea') {
        sources.push(addNoiseLayer(context, master, noise, [
          { type: 'lowpass', frequency: 520, q: 0.4 },
          { type: 'highpass', frequency: 55, q: 0.35 },
        ], 0.34));
        sources.push(addNoiseLayer(context, master, noise, [
          { type: 'lowpass', frequency: 1100, q: 0.5 },
          { type: 'highpass', frequency: 300, q: 0.4 },
        ], 0.08));
      } else if (ambienceId === 'nature') {
        sources.push(addNoiseLayer(context, master, noise, [
          { type: 'lowpass', frequency: 650, q: 0.35 },
        ], 0.2));
        sources.push(addNoiseLayer(context, master, noise, [
          { type: 'highpass', frequency: 1800, q: 0.35 },
          { type: 'lowpass', frequency: 7800, q: 0.35 },
        ], 0.025));
      } else {
        sources.push(addNoiseLayer(context, master, noise, [
          { type: 'lowpass', frequency: 420, q: 0.3 },
          { type: 'highpass', frequency: 75, q: 0.3 },
        ], 0.19));
      }

      const active: ActiveAmbience = {
        context,
        master,
        sources,
        birdTimer: ambienceId === 'nature' || ambienceId === 'fire'
          ? window.setInterval(() => {
              if (ambienceId === 'nature') {
                if (Math.random() > 0.35) addBirdCall(context, master);
              } else if (Math.random() > 0.6) {
                addFireCrackle(context, master);
              }
            }, ambienceId === 'nature' ? 2300 : 700)
          : null,
      };
      activeRef.current = active;
      await context.resume();
    } catch (error) {
      if (activeRef.current?.context === context) stop();
      else {
        void context.close().catch((closeError: unknown) => {
          console.error('Unable to close generated ambience audio after a playback error', closeError);
        });
      }
      throw error;
    }
  }, [stop]);

  React.useEffect(() => stop, [stop]);

  return React.useMemo(() => ({ play, setVolume, stop }), [play, setVolume, stop]);
}
