export class SfxManager {
  constructor() {
    this.context = null;
  }

  getContext() {
    if (this.context) return this.context;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    this.context = new AudioContextClass();
    return this.context;
  }

  resume() {
    const context = this.getContext();
    if (!context) return;
    if (context.state === 'suspended') {
      context.resume();
    }
  }

  playSequence(steps, options = {}) {
    const context = this.getContext();
    if (!context) return;
    if (context.state === 'suspended') {
      context.resume();
    }
    const start = context.currentTime + 0.01;
    const masterGain = context.createGain();
    masterGain.gain.value = options.volume ?? 0.05;
    masterGain.connect(context.destination);

    steps.forEach((step, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const duration = step.duration ?? 0.08;
      const offset = step.offset ?? steps.slice(0, index).reduce((sum, item) => sum + (item.duration ?? 0.08), 0);
      const time = start + offset;
      oscillator.type = step.type || 'sine';
      oscillator.frequency.setValueAtTime(step.frequency, time);
      if (step.endFrequency) {
        oscillator.frequency.exponentialRampToValueAtTime(step.endFrequency, time + duration);
      }
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(step.gain ?? 0.7, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      oscillator.connect(gain);
      gain.connect(masterGain);
      oscillator.start(time);
      oscillator.stop(time + duration);
    });
  }

  playUiTap() {
    this.playSequence([
      { frequency: 520, endFrequency: 720, duration: 0.06, type: 'triangle', gain: 0.45 },
      { frequency: 760, endFrequency: 920, duration: 0.05, type: 'triangle', gain: 0.3, offset: 0.04 },
    ], { volume: 0.07 });
  }

  playNodeSelect() {
    this.playSequence([
      { frequency: 360, endFrequency: 520, duration: 0.08, type: 'triangle', gain: 0.5 },
      { frequency: 620, endFrequency: 840, duration: 0.08, type: 'sine', gain: 0.28, offset: 0.06 },
    ], { volume: 0.08 });
  }

  playCard() {
    this.playSequence([
      { frequency: 320, endFrequency: 180, duration: 0.022, type: 'square', gain: 0.5 },
      { frequency: 1240, endFrequency: 760, duration: 0.012, type: 'triangle', gain: 0.2, offset: 0.002 },
      { frequency: 720, endFrequency: 420, duration: 0.018, type: 'square', gain: 0.16, offset: 0.004 },
    ], { volume: 0.082 });
  }

  playEnemyCard(enemyId) {
    if (enemyId === 'jade_construct') {
      this.playSequence([
        { frequency: 180, endFrequency: 120, duration: 0.08, type: 'sawtooth', gain: 0.52 },
        { frequency: 320, endFrequency: 200, duration: 0.06, type: 'square', gain: 0.18, offset: 0.02 },
      ], { volume: 0.085 });
      return;
    }
    if (enemyId === 'scarlet_bat') {
      this.playSequence([
        { frequency: 860, endFrequency: 1220, duration: 0.04, type: 'triangle', gain: 0.24 },
        { frequency: 300, endFrequency: 180, duration: 0.03, type: 'square', gain: 0.32, offset: 0.015 },
      ], { volume: 0.08 });
      return;
    }
    if (enemyId === 'ghost_monk') {
      this.playSequence([
        { frequency: 420, endFrequency: 260, duration: 0.06, type: 'sine', gain: 0.24 },
        { frequency: 700, endFrequency: 420, duration: 0.035, type: 'triangle', gain: 0.2, offset: 0.02 },
      ], { volume: 0.075 });
      return;
    }
    this.playSequence([
      { frequency: 260, endFrequency: 160, duration: 0.05, type: 'square', gain: 0.42 },
      { frequency: 540, endFrequency: 300, duration: 0.03, type: 'triangle', gain: 0.18, offset: 0.01 },
    ], { volume: 0.078 });
  }

  playHit() {
    this.playSequence([
      { frequency: 180, endFrequency: 90, duration: 0.09, type: 'sawtooth', gain: 0.55 },
      { frequency: 120, endFrequency: 60, duration: 0.12, type: 'triangle', gain: 0.35, offset: 0.02 },
    ], { volume: 0.08 });
  }

  playBuff() {
    this.playSequence([
      { frequency: 540, endFrequency: 680, duration: 0.07, type: 'sine', gain: 0.4 },
      { frequency: 760, endFrequency: 980, duration: 0.09, type: 'triangle', gain: 0.26, offset: 0.05 },
    ], { volume: 0.06 });
  }

  playVictory() {
    this.playSequence([
      { frequency: 392, endFrequency: 523, duration: 0.12, type: 'triangle', gain: 0.42 },
      { frequency: 523, endFrequency: 659, duration: 0.12, type: 'triangle', gain: 0.36, offset: 0.1 },
      { frequency: 659, endFrequency: 784, duration: 0.16, type: 'triangle', gain: 0.28, offset: 0.2 },
    ], { volume: 0.08 });
  }

  playDefeat() {
    this.playSequence([
      { frequency: 320, endFrequency: 210, duration: 0.12, type: 'sawtooth', gain: 0.38 },
      { frequency: 210, endFrequency: 140, duration: 0.18, type: 'triangle', gain: 0.24, offset: 0.11 },
    ], { volume: 0.07 });
  }

  playReward() {
    this.playSequence([
      { frequency: 660, endFrequency: 880, duration: 0.1, type: 'triangle', gain: 0.4 },
      { frequency: 990, endFrequency: 1220, duration: 0.12, type: 'sine', gain: 0.24, offset: 0.08 },
    ], { volume: 0.07 });
  }
}
