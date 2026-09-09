"use client";

/**
 * Procedural ambient synthesizer inspired by Igloo Inc's soundscape.
 * Generates an ethereal heritage drone (pentatonic temple tones + warm sub-bass).
 * Runs 100% in-browser via Web Audio API without external audio files.
 */
class ProceduralAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private lfo: OscillatorNode | null = null;
  // Lowpass filter node, stored so setMood() (below) can ramp its cutoff.
  // Only assigned inside start(); setMood() no-ops if it's still null.
  private filter: BiquadFilterNode | null = null;
  // Optional bright harmonic layer, created lazily by setMood() the first
  // time mood pushes past its fade-in threshold. Landing-4 never calls
  // setMood(), so this stays null and unused for that caller.
  private moodOsc: OscillatorNode | null = null;
  private moodGain: GainNode | null = null;

  public init() {
    if (this.ctx) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
  }

  public async start(): Promise<boolean> {
    try {
      this.init();
      if (!this.ctx) return false;

      if (this.ctx.state === "suspended") {
        await this.ctx.resume();
      }

      if (this.isPlaying) return true;

      // Master output with smooth fade
      const master = this.ctx.createGain();
      master.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 3);
      master.connect(this.ctx.destination);
      this.masterGain = master;

      // Stereo panner & filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);
      filter.connect(master);
      this.filter = filter;

      // Pentatonic ancient root frequencies (C# Aeolian / Imperial chime)
      const freqs = [69.3, 103.83, 138.59, 207.65, 277.18]; // C#2, G#2, C#3, G#3, C#4

      this.oscillators = freqs.map((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const oscGain = this.ctx!.createGain();

        osc.type = idx === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

        // Subtle detune for shimmer
        osc.detune.setValueAtTime((idx - 2) * 4, this.ctx!.currentTime);

        const gainVal = 0.25 / (idx + 1);
        oscGain.gain.setValueAtTime(gainVal, this.ctx!.currentTime);

        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start();
        return osc;
      });

      // LFO for breathing filter modulation
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 8-second breathing cycle
      lfoGain.gain.setValueAtTime(150, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      this.lfo = lfo;

      this.isPlaying = true;
      return true;
    } catch {
      return false;
    }
  }

  public stop() {
    if (!this.ctx || !this.isPlaying || !this.masterGain) return;
    try {
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1);
      setTimeout(() => {
        this.oscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // ignore
          }
        });
        this.oscillators = [];
        if (this.lfo) {
          try {
            this.lfo.stop();
            this.lfo.disconnect();
          } catch {
            // ignore
          }
          this.lfo = null;
        }
        if (this.moodOsc) {
          try {
            this.moodOsc.stop();
            this.moodOsc.disconnect();
          } catch {
            // ignore
          }
          this.moodOsc = null;
        }
        if (this.moodGain) {
          try {
            this.moodGain.disconnect();
          } catch {
            // ignore
          }
          this.moodGain = null;
        }
        this.filter = null;
        this.isPlaying = false;
      }, 1100);
    } catch {
      this.isPlaying = false;
    }
  }

  public triggerChime() {
    if (!this.ctx || !this.isPlaying || this.ctx.state !== "running") return;
    try {
      const chimeFreqs = [554.37, 830.61, 1108.73]; // C#5, G#5, C#6
      const freq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.5);

      osc.connect(gain);
      if (this.masterGain) {
        gain.connect(this.masterGain);
      } else {
        gain.connect(this.ctx.destination);
      }

      osc.start();
      osc.stop(this.ctx.currentTime + 2.6);
    } catch {
      // ignore
    }
  }

  /**
   * Additive (T23+ post-plan): reacts the ambient drone to journey progress.
   * `t` is 0..1 global scroll progress (landing-6's `useGlobalProgress()`).
   * No-op unless the engine is actually running — safe to call at any `t`
   * from a component that doesn't know/care whether audio is on.
   *
   * Mood arc (landing-6, 9 chapters, knots at i/8 matching CHAPTER_IDS order):
   *  - t 0.00-0.50 (hero..gallery): calm baseline, filter ~450Hz, gain 0.12.
   *  - t 0.50-0.875 (tableauKeep..tableauWorld): filter cutoff ramps darker
   *    down to 170Hz and gain dips to 0.085 — rising tension, ending dim at
   *    tableauWorld per its own "signs going dark" design intent.
   *  - t 0.875-1.0 (launch): filter brightens past baseline to 640Hz, gain
   *    swells to 0.16, and a soft high harmonic (E6, one octave + third above
   *    the C#5 chime) fades in past t=0.9 — the "relight the flame" beat.
   * Only real Web Audio params are touched (existing filter/masterGain), plus
   * one lazily-created optional oscillator for the harmonic — no new drone
   * voices. All changes use ramps (0.4-1.5s) instead of setValueAtTime jumps
   * so a fast scroll never clicks.
   */
  public setMood(t: number): void {
    if (!this.ctx || !this.isPlaying || !this.filter || !this.masterGain) return;
    const clamped = Math.min(1, Math.max(0, t));
    const now = this.ctx.currentTime;
    const RAMP = 0.6; // seconds — gentle, not instant, not sluggish

    // Piecewise-linear interpolation between the mood-arc knots above.
    const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
    let freq: number;
    let gain: number;
    if (clamped <= 0.5) {
      freq = 450;
      gain = 0.12;
    } else if (clamped <= 0.875) {
      const f = (clamped - 0.5) / 0.375;
      freq = lerp(450, 170, f);
      gain = lerp(0.12, 0.085, f);
    } else {
      const f = (clamped - 0.875) / 0.125;
      freq = lerp(170, 640, f);
      gain = lerp(0.085, 0.16, f);
    }

    this.filter.frequency.linearRampToValueAtTime(freq, now + RAMP);
    this.masterGain.gain.linearRampToValueAtTime(gain, now + RAMP);

    // Harmonic layer: only relevant right at the launch swell. Created once,
    // on demand, then just has its gain ramped up/down — cheaper than
    // tearing it down every time progress dips back below the threshold.
    const HARMONIC_START = 0.9;
    if (clamped >= HARMONIC_START) {
      if (!this.moodOsc) {
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1318.51, now); // E6 — bright, above the chime's C#5/G#5/C#6
        gainNode.gain.setValueAtTime(0.0001, now);
        osc.connect(gainNode);
        gainNode.connect(this.masterGain);
        osc.start();
        this.moodOsc = osc;
        this.moodGain = gainNode;
      }
      const harmonicFade = (clamped - HARMONIC_START) / (1 - HARMONIC_START);
      this.moodGain?.gain.linearRampToValueAtTime(0.05 * harmonicFade, now + RAMP);
    } else if (this.moodGain) {
      this.moodGain.gain.linearRampToValueAtTime(0.0001, now + RAMP);
    }
  }

  public getActive(): boolean {
    return this.isPlaying;
  }
}

export const audioEngine = new ProceduralAudioEngine();
