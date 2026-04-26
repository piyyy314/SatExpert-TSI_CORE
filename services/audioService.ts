
/**
 * Tactical Soundscape Service
 * Uses Web Audio API to synthesize real-time tactical feedback sounds.
 */

class AudioController {
  private ctx: AudioContext | null = null;
  private droneGain: GainNode | null = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.droneGain) {
      this.droneGain.gain.setTargetAtTime(muted ? 0 : 0.05, this.ctx!.currentTime, 0.5);
    }
  }

  /**
   * Starts the low-frequency background hum (Mission Control Drone)
   */
  public startAmbientDrone() {
    this.initCtx();
    if (this.droneGain) return;

    this.droneGain = this.ctx!.createGain();
    this.droneGain.gain.setValueAtTime(0, this.ctx!.currentTime);
    this.droneGain.connect(this.ctx!.destination);

    // Layer 1: Fundamental
    this.createOscillator(60, 'sine', 0.5, this.droneGain);
    // Layer 2: Sub-harmonic
    this.createOscillator(30, 'sine', 0.3, this.droneGain);
    // Layer 3: Technical buzz
    this.createOscillator(120, 'sawtooth', 0.05, this.droneGain);

    if (!this.isMuted) {
      this.droneGain.gain.setTargetAtTime(0.05, this.ctx!.currentTime, 2);
    }
  }

  private createOscillator(freq: number, type: OscillatorType, volume: number, destination: AudioNode) {
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx!.currentTime);
    
    osc.connect(gain);
    gain.connect(destination);
    
    osc.start();
    return osc;
  }

  /**
   * High-pitched data "chirp" for status changes
   */
  public playChirp() {
    if (this.isMuted) return;
    this.initCtx();
    
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, this.ctx!.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.1);
  }

  /**
   * Warning "blip" for critical alerts or jams
   */
  public playAlert() {
    if (this.isMuted) return;
    this.initCtx();

    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx!.currentTime);
    osc.frequency.linearRampToValueAtTime(220, this.ctx!.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, this.ctx!.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx!.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx!.destination);

    osc.start();
    osc.stop(this.ctx!.currentTime + 0.2);
  }

  /**
   * Deep pulse for quantum triggers
   */
  public playPulse() {
    if (this.isMuted) return;
    this.initCtx();

    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, this.ctx!.currentTime);
    osc.frequency.linearRampToValueAtTime(50, this.ctx!.currentTime + 0.5);

    gain.gain.setValueAtTime(0.3, this.ctx! .currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx!.destination);

    osc.start();
    osc.stop(this.ctx!.currentTime + 0.5);
  }

  /**
   * Tactical Voice Alerts
   */
  public playSystemVoice(message: string) {
    if (this.isMuted) return;
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1.1;
    utterance.pitch = 0.8;
    utterance.volume = 0.5;
    window.speechSynthesis.speak(utterance);
  }
}

export const audioController = new AudioController();
export const playSystemVoice = (msg: string) => audioController.playSystemVoice(msg);
