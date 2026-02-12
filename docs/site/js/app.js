/**
 * Claude Skill Potions - Main Application
 * Wizard Shopkeeper Edition with Pokemon-style dialog
 */

(function() {
  'use strict';

  // State
  const state = {
    skills: [],
    basket: new Set(),
    currentSkill: null,
    isTyping: false,
    typewriterTimeout: null
  };

  // DOM Elements
  const elements = {
    potionRack: document.getElementById('potion-rack'),
    dialogText: document.getElementById('dialog-text'),
    dialogActions: document.getElementById('dialog-actions'),
    dialogBox: document.getElementById('dialog-box'),
    wizardPotion: document.getElementById('wizard-potion'),
    basket: document.getElementById('basket'),
    basketContainer: document.getElementById('basket-container'),
    basketCount: document.getElementById('basket-count'),
    basketPanel: document.getElementById('basket-panel'),
    basketItems: document.getElementById('basket-items'),
    panelCount: document.getElementById('panel-count'),
    closeBasket: document.getElementById('close-basket'),
    clearBasket: document.getElementById('clear-basket'),
    downloadBasket: document.getElementById('download-basket'),
    actionAdd: document.getElementById('action-add'),
    actionBrowse: document.getElementById('action-browse'),
    muteBtn: document.getElementById('mute-btn'),
    starCount: document.getElementById('star-count')
  };

  // Welcome messages
  const welcomeMessages = [
    "Welcome to the Potion Shop! Click a potion to learn its secrets...",
    "Ah, a fellow practitioner! Browse my wares... each potion holds great power.",
    "These aren't ordinary potions... they're skills for Claude Code. Choose wisely.",
    "Looking for something specific? Use the filters above, or just browse..."
  ];

  /**
   * Initialize the application
   */
  function init() {
    if (typeof SKILLS !== 'undefined') {
      state.skills = SKILLS;
    } else {
      console.error('SKILLS data not loaded');
      return;
    }

    renderPotions();
    setupEventListeners();
    fetchGitHubStars();

    // Show random welcome message
    const msg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    typeText(msg);
  }

  /**
   * Pokemon-style typewriter effect
   */
  function typeText(text, callback) {
    // Clear any existing typing
    if (state.typewriterTimeout) {
      clearTimeout(state.typewriterTimeout);
    }

    state.isTyping = true;
    elements.dialogText.innerHTML = '';

    let i = 0;
    const speed = 25; // ms per character

    function type() {
      if (i < text.length) {
        // Handle HTML tags
        if (text[i] === '<') {
          const closeIndex = text.indexOf('>', i);
          if (closeIndex !== -1) {
            elements.dialogText.innerHTML += text.substring(i, closeIndex + 1);
            i = closeIndex + 1;
          }
        } else {
          elements.dialogText.innerHTML += text[i];
          i++;
        }

        // Add cursor
        const cursor = '<span class="typing-cursor"></span>';
        const currentHTML = elements.dialogText.innerHTML;
        elements.dialogText.innerHTML = currentHTML.replace(/<span class="typing-cursor"><\/span>/g, '') + cursor;

        state.typewriterTimeout = setTimeout(type, speed);
      } else {
        // Remove cursor when done
        elements.dialogText.innerHTML = elements.dialogText.innerHTML.replace(/<span class="typing-cursor"><\/span>/g, '');
        state.isTyping = false;
        if (callback) callback();
      }
    }

    type();
  }

  /**
   * Skip typing animation
   */
  function skipTyping(text) {
    if (state.typewriterTimeout) {
      clearTimeout(state.typewriterTimeout);
    }
    elements.dialogText.innerHTML = text;
    state.isTyping = false;
  }

  /**
   * Render all potions organized by category
   */
  function renderPotions() {
    const rack = elements.potionRack;
    rack.innerHTML = '';

    // Group skills by category
    const byCategory = {};
    for (const skill of state.skills) {
      if (!byCategory[skill.category]) {
        byCategory[skill.category] = [];
      }
      byCategory[skill.category].push(skill);
    }

    // Render each category
    const categoryOrder = [
      'planning-risk', 'data-context', 'debugging', 'quality',
      'code-discipline', 'productivity', 'awareness-fun',
      'elixirs', 'meta', 'agent-dev'
    ];

    for (const category of categoryOrder) {
      const skills = byCategory[category];
      if (!skills || skills.length === 0) continue;

      const shelf = createShelf(category, skills);
      rack.appendChild(shelf);
    }
  }

  /**
   * Create a shelf element with potions
   */
  function createShelf(category, skills) {
    const categoryInfo = CATEGORIES[category] || { name: category, color: '#888' };

    const shelf = document.createElement('div');
    shelf.className = 'shelf';
    shelf.dataset.category = category;

    const label = document.createElement('div');
    label.className = 'shelf-label';
    label.style.setProperty('--cat-color', categoryInfo.color);
    label.textContent = categoryInfo.name;
    shelf.appendChild(label);

    const row = document.createElement('div');
    row.className = 'potions-row';

    for (const skill of skills) {
      const potion = createPotion(skill);
      row.appendChild(potion);
    }

    shelf.appendChild(row);
    return shelf;
  }

  /**
   * Create a potion element
   */
  function createPotion(skill) {
    const potion = document.createElement('div');
    potion.className = 'potion';
    potion.dataset.skillId = skill.id;
    potion.style.setProperty('--potion-color', skill.color);

    const bottle = document.createElement('div');
    bottle.className = 'bottle bubbling';
    if (skill.category === 'elixirs') {
      bottle.classList.add('rainbow');
    }

    potion.appendChild(bottle);

    const label = document.createElement('span');
    label.className = 'potion-label';
    label.textContent = skill.displayName;
    potion.appendChild(label);

    potion.addEventListener('click', () => selectPotion(skill));

    // Mark if in basket
    if (state.basket.has(skill.id)) {
      potion.classList.add('in-basket');
    }

    return potion;
  }

  /**
   * Select a potion - show in wizard dialog
   */
  function selectPotion(skill) {
    state.currentSkill = skill;

    // Update wizard's held potion
    elements.wizardPotion.style.display = 'block';
    const heldBottle = elements.wizardPotion.querySelector('.held-bottle');
    if (skill.color === 'rainbow') {
      heldBottle.style.setProperty('--held-potion-color', '#9d4edd');
    } else {
      heldBottle.style.setProperty('--held-potion-color', skill.color);
    }

    // Update visual selection
    document.querySelectorAll('.potion').forEach(p => p.classList.remove('selected'));
    const potionEl = document.querySelector(`.potion[data-skill-id="${skill.id}"]`);
    if (potionEl) {
      potionEl.classList.add('selected');
    }

    // Build dialog text
    const categoryStyle = `background: ${skill.color === 'rainbow' ? '#9d4edd' : skill.color}; color: white;`;
    const text = `<span class="skill-name">${skill.displayName}</span>` +
                 `<span class="skill-category" style="${categoryStyle}">${skill.categoryName}</span>` +
                 `<br>${skill.purpose || skill.description}`;

    // Show dialog with typing effect
    typeText(text, () => {
      // Show actions when typing completes
      elements.dialogActions.style.display = 'flex';
      updateActionButton();
    });

    // Hide actions while typing
    elements.dialogActions.style.display = 'none';

    // Play sound
    AudioManager.playClink();
  }

  /**
   * Update the Add/Remove button state
   */
  function updateActionButton() {
    if (!state.currentSkill) return;

    const inBasket = state.basket.has(state.currentSkill.id);
    elements.actionAdd.textContent = inBasket ? 'Remove from Basket' : 'Add to Basket';
    elements.actionAdd.className = inBasket ? 'nes-btn is-error' : 'nes-btn is-success';
  }

  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Category filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        setFilter(category);
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Mute button
    elements.muteBtn?.addEventListener('click', () => {
      AudioManager.toggleMute();
    });

    // Dialog actions
    elements.actionAdd?.addEventListener('click', () => {
      if (state.currentSkill) {
        toggleBasket(state.currentSkill.id);
        updateActionButton();
        AudioManager.playClink();

        // Show feedback message
        const inBasket = state.basket.has(state.currentSkill.id);
        const msg = inBasket
          ? `Added ${state.currentSkill.displayName} to your basket!`
          : `Removed ${state.currentSkill.displayName} from basket.`;
        typeText(msg);
        elements.dialogActions.style.display = 'none';
      }
    });

    elements.actionBrowse?.addEventListener('click', () => {
      state.currentSkill = null;
      elements.wizardPotion.style.display = 'none';
      elements.dialogActions.style.display = 'none';
      document.querySelectorAll('.potion.selected').forEach(p => p.classList.remove('selected'));

      const msg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      typeText(msg);
    });

    // Click on dialog to skip typing
    elements.dialogBox?.addEventListener('click', () => {
      if (state.isTyping && state.currentSkill) {
        const categoryStyle = `background: ${state.currentSkill.color === 'rainbow' ? '#9d4edd' : state.currentSkill.color}; color: white;`;
        const text = `<span class="skill-name">${state.currentSkill.displayName}</span>` +
                     `<span class="skill-category" style="${categoryStyle}">${state.currentSkill.categoryName}</span>` +
                     `<br>${state.currentSkill.purpose || state.currentSkill.description}`;
        skipTyping(text);
        elements.dialogActions.style.display = 'flex';
        updateActionButton();
      }
    });

    // Basket interactions
    elements.basketContainer?.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.basketPanel.style.display =
        elements.basketPanel.style.display === 'none' ? 'block' : 'none';
      updateBasketPanel();
    });

    elements.closeBasket?.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.basketPanel.style.display = 'none';
    });

    elements.clearBasket?.addEventListener('click', () => {
      state.basket.clear();
      updateBasket();
      updateBasketPanel();
      document.querySelectorAll('.potion.in-basket').forEach(p => p.classList.remove('in-basket'));
      typeText("Basket cleared! Browse for more potions...");
      elements.dialogActions.style.display = 'none';
    });

    elements.downloadBasket?.addEventListener('click', downloadCollection);

    // Close basket panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!elements.basketPanel.contains(e.target) &&
          !elements.basketContainer.contains(e.target)) {
        elements.basketPanel.style.display = 'none';
      }
    });
  }

  /**
   * Set category filter
   */
  function setFilter(category) {
    document.querySelectorAll('.shelf').forEach(shelf => {
      if (category === 'all' || shelf.dataset.category === category) {
        shelf.classList.remove('hidden');
      } else {
        shelf.classList.add('hidden');
      }
    });
  }

  /**
   * Toggle skill in basket
   */
  function toggleBasket(skillId) {
    if (state.basket.has(skillId)) {
      state.basket.delete(skillId);
    } else {
      state.basket.add(skillId);
    }

    // Update potion visual
    const potion = document.querySelector(`.potion[data-skill-id="${skillId}"]`);
    if (potion) {
      potion.classList.toggle('in-basket', state.basket.has(skillId));
    }

    updateBasket();
  }

  /**
   * Update basket count display
   */
  function updateBasket() {
    const count = state.basket.size;
    elements.basketCount.textContent = count;
    elements.clearBasket.disabled = count === 0;
    elements.downloadBasket.disabled = count === 0;
    elements.panelCount.textContent = count;
  }

  /**
   * Update basket panel contents
   */
  function updateBasketPanel() {
    const count = state.basket.size;
    elements.panelCount.textContent = count;

    if (count === 0) {
      elements.basketItems.innerHTML = '<p class="empty-basket">Your basket is empty</p>';
    } else {
      elements.basketItems.innerHTML = '';

      for (const skillId of state.basket) {
        const skill = state.skills.find(s => s.id === skillId);
        if (!skill) continue;

        const item = document.createElement('div');
        item.className = 'basket-item';
        item.innerHTML = `
          <span style="color: ${skill.color}">${skill.displayName}</span>
          <button class="remove-btn" data-skill-id="${skillId}">&times;</button>
        `;

        item.querySelector('.remove-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          toggleBasket(skillId);
          updateBasketPanel();
          AudioManager.playClink();
        });

        elements.basketItems.appendChild(item);
      }
    }
  }

  /**
   * Download selected skills as ZIP
   */
  async function downloadCollection() {
    if (state.basket.size === 0) return;

    const zip = new JSZip();
    const baseUrl = 'https://raw.githubusercontent.com/ElliotJLT/Claude-Skill-Potions/main/';

    elements.downloadBasket.disabled = true;
    elements.downloadBasket.textContent = 'Brewing...';

    typeText("Brewing your collection... please wait...");

    try {
      for (const skillId of state.basket) {
        const skill = state.skills.find(s => s.id === skillId);
        if (!skill) continue;

        try {
          const response = await fetch(baseUrl + skill.filePath);
          if (response.ok) {
            const content = await response.text();
            zip.file(`${skill.id}/SKILL.md`, content);
          }
        } catch (e) {
          console.warn(`Failed to fetch ${skill.id}:`, e);
        }
      }

      // Add README
      const readme = `# Claude Skill Potions Collection

Downloaded from https://github.com/ElliotJLT/Claude-Skill-Potions

## Skills Included:
${Array.from(state.basket).map(id => {
  const skill = state.skills.find(s => s.id === id);
  return `- ${skill?.displayName || id}`;
}).join('\n')}

## Installation

Copy the contents of any SKILL.md file to your ~/.claude/CLAUDE.md:

\`\`\`bash
cat <skill-name>/SKILL.md >> ~/.claude/CLAUDE.md
\`\`\`

Then restart Claude Code.
`;
      zip.file('README.md', readme);

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, 'claude-skill-potions.zip');

      typeText("Your potions are ready! Check your downloads folder.");

    } catch (e) {
      console.error('Download failed:', e);
      typeText("Something went wrong... please try again.");
    } finally {
      elements.downloadBasket.disabled = false;
      elements.downloadBasket.textContent = 'Download All';
    }
  }

  /**
   * Fetch GitHub star count
   */
  async function fetchGitHubStars() {
    try {
      const response = await fetch('https://api.github.com/repos/ElliotJLT/Claude-Skill-Potions');
      if (response.ok) {
        const data = await response.json();
        elements.starCount.textContent = data.stargazers_count || '0';
      }
    } catch (e) {
      console.warn('Failed to fetch GitHub stars:', e);
      elements.starCount.textContent = '★';
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
