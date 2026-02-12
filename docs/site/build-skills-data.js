#!/usr/bin/env node
/**
 * Build script to generate skills-data.js from SKILL.md files
 * Run: node build-skills-data.js
 */

const fs = require('fs');
const path = require('path');

// Category mappings from README.md
const CATEGORY_MAP = {
  // Planning & Risk
  'battle-plan': 'planning-risk',
  'pre-mortem': 'planning-risk',
  'split-decision': 'planning-risk',
  'you-sure': 'planning-risk',

  // Data & Context Management
  'dont-be-greedy': 'data-context',
  'breadcrumbs': 'data-context',

  // Debugging & Problem Solving
  'rubber-duck': 'debugging',
  'zero-in': 'debugging',

  // Quality & Verification
  'prove-it': 'quality',
  'loose-ends': 'quality',
  'trace-it': 'quality',

  // Code Discipline
  'stay-in-lane': 'code-discipline',
  'sanity-check': 'code-discipline',
  'keep-it-simple': 'code-discipline',

  // Productivity & Growth
  'eta': 'productivity',
  'learn-from-this': 'productivity',
  'retrospective': 'productivity',
  'pair-mode': 'productivity',

  // Awareness & Fun
  'drip': 'awareness-fun',
  'geordie': 'awareness-fun',

  // Elixirs (Orchestration)
  'debug-to-fix': 'elixirs',
  'safe-refactor': 'elixirs',
  'careful-delete': 'elixirs',
  'fan-out': 'elixirs',
  'pipeline': 'elixirs',
  'map-reduce': 'elixirs',

  // Meta
  'skill-gate': 'meta',
  'skill-forge': 'meta',
  'skill-creator': 'meta',

  // Agent Development
  'agent-audit': 'agent-dev',
};

// Category colors from plan
const CATEGORY_COLORS = {
  'planning-risk': '#e63946',
  'data-context': '#457b9d',
  'debugging': '#2a9d8f',
  'quality': '#f4a261',
  'code-discipline': '#9d4edd',
  'productivity': '#00b4d8',
  'awareness-fun': '#ff69b4',
  'elixirs': 'rainbow',
  'meta': '#e0e0e0',
  'agent-dev': '#fb8500',
};

// Category display names
const CATEGORY_NAMES = {
  'planning-risk': 'Planning & Risk',
  'data-context': 'Data & Context',
  'debugging': 'Debugging',
  'quality': 'Quality & Verification',
  'code-discipline': 'Code Discipline',
  'productivity': 'Productivity & Growth',
  'awareness-fun': 'Awareness & Fun',
  'elixirs': 'Elixirs',
  'meta': 'Meta',
  'agent-dev': 'Agent Development',
};

function parseYamlFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const yaml = match[1];
  const result = {};

  // Parse simple YAML (name and description)
  const nameMatch = yaml.match(/^name:\s*(.+)$/m);
  if (nameMatch) {
    result.name = nameMatch[1].trim();
  }

  // Parse multiline description
  const descMatch = yaml.match(/description:\s*\|\n([\s\S]*?)(?=\n[a-z-]+:|$)/);
  if (descMatch) {
    result.description = descMatch[1]
      .split('\n')
      .map(line => line.replace(/^\s{2}/, ''))
      .join(' ')
      .trim();
  } else {
    // Single line description
    const singleDescMatch = yaml.match(/^description:\s*(.+)$/m);
    if (singleDescMatch) {
      result.description = singleDescMatch[1].trim();
    }
  }

  return result;
}

function extractPurpose(content) {
  const match = content.match(/<purpose>\n?([\s\S]*?)<\/purpose>/);
  if (!match) return '';
  return match[1].trim().replace(/\n/g, ' ');
}

function checkForScripts(skillDir) {
  const scriptsDir = path.join(skillDir, 'scripts');
  return fs.existsSync(scriptsDir);
}

function formatDisplayName(id) {
  return id
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function buildSkillsData() {
  const skillsDir = path.join(__dirname, '../../skills');
  const skills = [];

  if (!fs.existsSync(skillsDir)) {
    console.error('Skills directory not found:', skillsDir);
    process.exit(1);
  }

  const skillFolders = fs.readdirSync(skillsDir).filter(f => {
    return fs.statSync(path.join(skillsDir, f)).isDirectory();
  });

  for (const folder of skillFolders) {
    const skillPath = path.join(skillsDir, folder, 'SKILL.md');

    if (!fs.existsSync(skillPath)) {
      console.warn(`No SKILL.md found in ${folder}, skipping`);
      continue;
    }

    const content = fs.readFileSync(skillPath, 'utf-8');
    const frontmatter = parseYamlFrontmatter(content);
    const purpose = extractPurpose(content);
    const hasScripts = checkForScripts(path.join(skillsDir, folder));

    const category = CATEGORY_MAP[folder] || 'meta';
    const color = CATEGORY_COLORS[category];

    skills.push({
      id: folder,
      name: frontmatter.name || formatDisplayName(folder),
      displayName: formatDisplayName(folder),
      category,
      categoryName: CATEGORY_NAMES[category],
      color,
      description: frontmatter.description || '',
      purpose: purpose || frontmatter.description || '',
      hasScripts,
      filePath: `skills/${folder}/SKILL.md`,
    });
  }

  // Sort by category, then by name
  skills.sort((a, b) => {
    const catOrder = Object.keys(CATEGORY_MAP);
    const aCatIndex = catOrder.indexOf(a.id);
    const bCatIndex = catOrder.indexOf(b.id);
    if (aCatIndex !== bCatIndex) return aCatIndex - bCatIndex;
    return a.name.localeCompare(b.name);
  });

  return skills;
}

function generateOutput(skills) {
  const categories = {};
  for (const [key, value] of Object.entries(CATEGORY_NAMES)) {
    categories[key] = {
      name: value,
      color: CATEGORY_COLORS[key],
    };
  }

  const output = `// Auto-generated by build-skills-data.js
// Last updated: ${new Date().toISOString()}

const CATEGORIES = ${JSON.stringify(categories, null, 2)};

const SKILLS = ${JSON.stringify(skills, null, 2)};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SKILLS, CATEGORIES };
}
`;

  return output;
}

// Main execution
const skills = buildSkillsData();
const output = generateOutput(skills);

const outputPath = path.join(__dirname, 'js/skills-data.js');
fs.writeFileSync(outputPath, output);

// Also generate skills.json for programmatic access
const skillsJson = {
  generated: new Date().toISOString(),
  repository: 'https://github.com/ElliotJLT/Claude-Skill-Potions',
  categories: Object.entries(CATEGORY_NAMES).map(([id, name]) => ({
    id,
    name,
    color: CATEGORY_COLORS[id]
  })),
  skills: skills.map(s => ({
    id: s.id,
    name: s.displayName,
    category: s.category,
    description: s.description,
    purpose: s.purpose,
    hasScripts: s.hasScripts,
    url: `https://github.com/ElliotJLT/Claude-Skill-Potions/blob/main/${s.filePath}`,
    rawUrl: `https://raw.githubusercontent.com/ElliotJLT/Claude-Skill-Potions/main/${s.filePath}`
  }))
};

const jsonPath = path.join(__dirname, 'skills.json');
fs.writeFileSync(jsonPath, JSON.stringify(skillsJson, null, 2));

console.log(`Generated skills-data.js with ${skills.length} skills`);
console.log(`Generated skills.json for programmatic access`);
console.log('Categories:', Object.keys(CATEGORY_NAMES).join(', '));
