/**
 * Skill Potions Shop
 * A cozy 8-bit interface for downloading Claude Code skills
 */

// ===== CONFIG =====
const CONFIG = {
  REPO: 'ElliotJLT/Claude-Skill-Potions',
  BRANCH: 'main',
  BUTTONDOWN_API: 'https://api.buttondown.email/v1/subscribers',
  // Set to your Buttondown API key when ready
  BUTTONDOWN_KEY: null,
};

// ===== STATE =====
const state = {
  skills: [],
  selected: new Set(JSON.parse(localStorage.getItem('selectedPotions') || '[]')),
  currentFilter: 'all',
  soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
};

// ===== DOM ELEMENTS =====
const elements = {
  potionGrid: document.getElementById('potionGrid'),
  selectionCount: document.getElementById('selectionCount'),
  downloadBtn: document.getElementById('downloadBtn'),
  clearBtn: document.getElementById('clearBtn'),
  filterBtns: document.querySelectorAll('.filter-btn'),
  emailModal: document.getElementById('emailModal'),
  emailForm: document.getElementById('emailForm'),
  emailInput: document.getElementById('emailInput'),
  skipEmail: document.getElementById('skipEmail'),
  modalClose: document.getElementById('modalClose'),
  soundToggle: document.getElementById('soundToggle'),
  toast: document.getElementById('toast'),
  ambient: document.getElementById('ambient'),
  bubble: document.getElementById('bubble'),
};

// ===== INITIALIZATION =====
async function init() {
  try {
    // Load skills data
    const response = await fetch('data/skills.json');
    const data = await response.json();
    state.skills = data.skills;

    // Render potions
    renderPotions();
    updateSelectionUI();

    // Setup event listeners
    setupEventListeners();

    // Setup audio
    setupAudio();

  } catch (error) {
    console.error('Failed to initialize:', error);
    elements.potionGrid.innerHTML = `
      <p style="grid-column: 1/-1; text-align: center; color: var(--potion-red);">
        Failed to load potions. Please refresh.
      </p>
    `;
  }
}

// ===== RENDER POTIONS =====
function renderPotions() {
  elements.potionGrid.innerHTML = state.skills.map(skill => `
    <div class="potion-item potion-${skill.color} ${state.selected.has(skill.id) ? 'selected' : ''}"
         data-id="${skill.id}"
         data-category="${skill.category}">
      <div class="potion-tooltip">
        <div class="tooltip-title">${skill.name}</div>
        <div class="tooltip-desc">${skill.description}</div>
        <div class="tooltip-problem">${skill.problem}</div>
      </div>
      <div class="potion-bottle">
        <div class="bottle-body">
          <div class="bottle-liquid"></div>
        </div>
      </div>
      <span class="potion-name">${skill.name}</span>
    </div>
  `).join('');
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Potion selection
  elements.potionGrid.addEventListener('click', handlePotionClick);

  // Filter buttons
  elements.filterBtns.forEach(btn => {
    btn.addEventListener('click', () => handleFilter(btn.dataset.filter));
  });

  // Download button
  elements.downloadBtn.addEventListener('click', handleDownloadClick);

  // Clear button
  elements.clearBtn.addEventListener('click', handleClear);

  // Modal events
  elements.modalClose.addEventListener('click', closeModal);
  elements.emailModal.addEventListener('click', (e) => {
    if (e.target === elements.emailModal) closeModal();
  });
  elements.emailForm.addEventListener('submit', handleEmailSubmit);
  elements.skipEmail.addEventListener('click', () => downloadSkills(false));

  // Sound toggle
  elements.soundToggle.addEventListener('click', toggleSound);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

// ===== POTION CLICK HANDLER =====
function handlePotionClick(e) {
  const potionItem = e.target.closest('.potion-item');
  if (!potionItem) return;

  const id = potionItem.dataset.id;

  if (state.selected.has(id)) {
    state.selected.delete(id);
    potionItem.classList.remove('selected');
  } else {
    state.selected.add(id);
    potionItem.classList.add('selected');
    playSound('pop');
  }

  saveSelection();
  updateSelectionUI();
}

// ===== FILTER HANDLER =====
function handleFilter(filter) {
  state.currentFilter = filter;

  // Update button states
  elements.filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });

  // Filter potions
  const potions = elements.potionGrid.querySelectorAll('.potion-item');
  potions.forEach(potion => {
    const category = potion.dataset.category;
    const show = filter === 'all' || category === filter;
    potion.classList.toggle('hidden', !show);
  });

  playSound('clink');
}

// ===== SELECTION UI =====
function updateSelectionUI() {
  const count = state.selected.size;
  elements.selectionCount.textContent = count;
  elements.downloadBtn.disabled = count === 0;
  elements.clearBtn.style.display = count > 0 ? 'block' : 'none';
}

function saveSelection() {
  localStorage.setItem('selectedPotions', JSON.stringify([...state.selected]));
}

// ===== DOWNLOAD FLOW =====
function handleDownloadClick() {
  // Show email modal
  elements.emailModal.classList.add('active');
  elements.emailInput.focus();
}

async function handleEmailSubmit(e) {
  e.preventDefault();
  const email = elements.emailInput.value.trim();

  if (email) {
    await subscribeEmail(email);
  }

  await downloadSkills(true);
}

async function subscribeEmail(email) {
  // If Buttondown API key is set, submit to Buttondown
  if (CONFIG.BUTTONDOWN_KEY) {
    try {
      await fetch(CONFIG.BUTTONDOWN_API, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${CONFIG.BUTTONDOWN_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      console.error('Email subscription failed:', error);
    }
  } else {
    // For now, just log it (replace with your email service)
    console.log('Email captured:', email);
    // You could also use Netlify Forms by adding a hidden form
  }
}

async function downloadSkills(showToast = true) {
  closeModal();

  try {
    const selectedSkills = state.skills.filter(s => state.selected.has(s.id));

    // Fetch all skill contents from GitHub
    const contents = await Promise.all(
      selectedSkills.map(async (skill) => {
        const url = `https://raw.githubusercontent.com/${CONFIG.REPO}/${CONFIG.BRANCH}/skills/${skill.id}/SKILL.md`;
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error('Not found');
          return await response.text();
        } catch {
          return `# ${skill.name}\n\nFailed to fetch. Get it from: https://github.com/${CONFIG.REPO}/tree/${CONFIG.BRANCH}/skills/${skill.id}`;
        }
      })
    );

    // Combine into single file
    const combined = contents.join('\n\n---\n\n');

    // Create download
    const blob = new Blob([combined], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedSkills.length === 1
      ? `${selectedSkills[0].id}.md`
      : 'skill-potions.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Also copy to clipboard
    await navigator.clipboard.writeText(combined);

    if (showToast) {
      showToastMessage('Downloaded and copied to clipboard!');
    }

  } catch (error) {
    console.error('Download failed:', error);
    showToastMessage('Download failed. Please try again.');
  }
}

// ===== CLEAR SELECTION =====
function handleClear() {
  state.selected.clear();
  saveSelection();

  // Update UI
  elements.potionGrid.querySelectorAll('.potion-item').forEach(p => {
    p.classList.remove('selected');
  });
  updateSelectionUI();

  playSound('clink');
}

// ===== MODAL =====
function closeModal() {
  elements.emailModal.classList.remove('active');
  elements.emailInput.value = '';
}

// ===== TOAST =====
function showToastMessage(message) {
  elements.toast.querySelector('.toast-message').textContent = message;
  elements.toast.classList.add('active');

  setTimeout(() => {
    elements.toast.classList.remove('active');
  }, 3000);
}

// ===== AUDIO =====
function setupAudio() {
  // Set initial volumes
  if (elements.ambient) {
    elements.ambient.volume = 0.15;
  }
  if (elements.bubble) {
    elements.bubble.volume = 0.1;
  }

  // Update toggle UI
  updateSoundToggleUI();

  // Start audio on first user interaction (browser requirement)
  document.addEventListener('click', startAudio, { once: true });
}

function startAudio() {
  if (state.soundEnabled) {
    elements.ambient?.play().catch(() => {});
    elements.bubble?.play().catch(() => {});
  }
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  localStorage.setItem('soundEnabled', state.soundEnabled);

  if (state.soundEnabled) {
    elements.ambient?.play().catch(() => {});
    elements.bubble?.play().catch(() => {});
  } else {
    elements.ambient?.pause();
    elements.bubble?.pause();
  }

  updateSoundToggleUI();
}

function updateSoundToggleUI() {
  const soundOn = elements.soundToggle.querySelector('.sound-on');
  const soundOff = elements.soundToggle.querySelector('.sound-off');

  if (state.soundEnabled) {
    soundOn.style.display = 'inline';
    soundOff.style.display = 'none';
  } else {
    soundOn.style.display = 'none';
    soundOff.style.display = 'inline';
  }
}

function playSound(type) {
  if (!state.soundEnabled) return;

  // Create temporary audio for sound effects
  // In production, you'd preload these
  const sounds = {
    pop: 'audio/pop.mp3',
    clink: 'audio/clink.mp3',
  };

  if (sounds[type]) {
    const audio = new Audio(sounds[type]);
    audio.volume = 0.3;
    audio.play().catch(() => {});
  }
}

// ===== START =====
document.addEventListener('DOMContentLoaded', init);
