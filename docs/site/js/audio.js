/**
 * Audio Manager for Claude Skill Potions
 * Handles ambient sounds and UI sound effects
 */

const AudioManager = (function() {
  let audioContext = null;
  let isMuted = false;
  let isInitialized = false;

  // Audio buffers
  let clinkBuffer = null;
  let ambientSource = null;
  let ambientGain = null;

  // Storage key
  const MUTE_KEY = 'claude-potions-muted';

  /**
   * Initialize audio context (must be called on user interaction)
   */
  async function init() {
    if (isInitialized) return;

    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Create master gain
      ambientGain = audioContext.createGain();
      ambientGain.connect(audioContext.destination);
      ambientGain.gain.value = 0.15; // Low ambient volume

      // Load mute preference
      isMuted = localStorage.getItem(MUTE_KEY) === 'true';
      updateMuteUI();

      // Generate synthetic sounds
      await generateClinkSound();

      isInitialized = true;
      console.log('Audio initialized');

      // Start ambient if not muted
      if (!isMuted) {
        startAmbient();
      }
    } catch (e) {
      console.warn('Audio initialization failed:', e);
    }
  }

  /**
   * Generate a synthetic glass clink sound
   */
  async function generateClinkSound() {
    if (!audioContext) return;

    const sampleRate = audioContext.sampleRate;
    const duration = 0.15;
    const length = sampleRate * duration;

    clinkBuffer = audioContext.createBuffer(1, length, sampleRate);
    const data = clinkBuffer.getChannelData(0);

    // Create a short, high-pitched "clink" sound
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Multiple frequencies for glass-like sound
      const freq1 = 2000 + Math.random() * 500;
      const freq2 = 3500 + Math.random() * 500;
      const freq3 = 5000 + Math.random() * 500;

      // Quick decay envelope
      const envelope = Math.exp(-t * 30);

      data[i] = envelope * (
        0.3 * Math.sin(2 * Math.PI * freq1 * t) +
        0.3 * Math.sin(2 * Math.PI * freq2 * t) +
        0.2 * Math.sin(2 * Math.PI * freq3 * t) +
        0.2 * (Math.random() * 2 - 1) * Math.exp(-t * 50) // Initial noise burst
      );
    }
  }

  /**
   * Play the glass clink sound
   */
  function playClink() {
    if (!isInitialized || isMuted || !clinkBuffer) return;

    try {
      const source = audioContext.createBufferSource();
      source.buffer = clinkBuffer;

      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.3;

      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      source.start();
    } catch (e) {
      console.warn('Failed to play clink:', e);
    }
  }

  /**
   * Start ambient bubbling sound
   */
  function startAmbient() {
    if (!isInitialized || isMuted || ambientSource) return;

    try {
      // Create ambient bubbling using oscillators and noise
      const osc1 = audioContext.createOscillator();
      const osc2 = audioContext.createOscillator();

      osc1.frequency.value = 80;
      osc2.frequency.value = 120;

      osc1.type = 'sine';
      osc2.type = 'sine';

      // Create LFOs for modulation
      const lfo1 = audioContext.createOscillator();
      const lfo2 = audioContext.createOscillator();
      lfo1.frequency.value = 0.3;
      lfo2.frequency.value = 0.5;

      const lfoGain1 = audioContext.createGain();
      const lfoGain2 = audioContext.createGain();
      lfoGain1.gain.value = 20;
      lfoGain2.gain.value = 30;

      lfo1.connect(lfoGain1);
      lfo2.connect(lfoGain2);
      lfoGain1.connect(osc1.frequency);
      lfoGain2.connect(osc2.frequency);

      // Mix oscillators
      const merger = audioContext.createGain();
      merger.gain.value = 0.1;

      osc1.connect(merger);
      osc2.connect(merger);
      merger.connect(ambientGain);

      // Create dripping noise
      const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);

      // Create occasional "drip" sounds in the noise
      for (let i = 0; i < noiseData.length; i++) {
        const t = i / audioContext.sampleRate;
        // Random drip sounds
        if (Math.random() < 0.0001) {
          const dripLength = Math.floor(audioContext.sampleRate * 0.05);
          for (let j = 0; j < dripLength && i + j < noiseData.length; j++) {
            const dripT = j / dripLength;
            noiseData[i + j] = Math.sin(2 * Math.PI * (800 + 400 * dripT) * (j / audioContext.sampleRate)) *
                              Math.exp(-dripT * 10) * 0.3;
          }
        }
      }

      const noiseSource = audioContext.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const noiseGain = audioContext.createGain();
      noiseGain.gain.value = 0.15;

      noiseSource.connect(noiseGain);
      noiseGain.connect(ambientGain);

      // Start all sources
      osc1.start();
      osc2.start();
      lfo1.start();
      lfo2.start();
      noiseSource.start();

      // Store references for stopping
      ambientSource = {
        oscillators: [osc1, osc2, lfo1, lfo2],
        noiseSource: noiseSource
      };

    } catch (e) {
      console.warn('Failed to start ambient:', e);
    }
  }

  /**
   * Stop ambient sound
   */
  function stopAmbient() {
    if (!ambientSource) return;

    try {
      // Fade out
      if (ambientGain) {
        ambientGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
      }

      // Stop after fade
      setTimeout(() => {
        if (ambientSource) {
          ambientSource.oscillators.forEach(osc => {
            try { osc.stop(); } catch (e) {}
          });
          try { ambientSource.noiseSource.stop(); } catch (e) {}
          ambientSource = null;
        }
        if (ambientGain) {
          ambientGain.gain.value = 0.15;
        }
      }, 500);
    } catch (e) {
      console.warn('Failed to stop ambient:', e);
    }
  }

  /**
   * Toggle mute state
   */
  function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem(MUTE_KEY, isMuted.toString());
    updateMuteUI();

    if (isMuted) {
      stopAmbient();
    } else if (isInitialized) {
      startAmbient();
    }
  }

  /**
   * Update mute button UI
   */
  function updateMuteUI() {
    const btn = document.getElementById('mute-btn');
    if (btn) {
      btn.classList.toggle('is-muted', isMuted);
    }
  }

  /**
   * Check if audio is muted
   */
  function getMuted() {
    return isMuted;
  }

  // Public API
  return {
    init,
    playClink,
    toggleMute,
    getMuted,
    startAmbient,
    stopAmbient
  };
})();

// Initialize on first user interaction
document.addEventListener('click', function initOnClick() {
  AudioManager.init();
  document.removeEventListener('click', initOnClick);
}, { once: true });

// Also initialize on keypress
document.addEventListener('keydown', function initOnKey() {
  AudioManager.init();
  document.removeEventListener('keydown', initOnKey);
}, { once: true });
