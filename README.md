# Claude Skill Potions

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Reusable skills for Claude Code that actually work.**

Skills are procedural knowledge for Claude. Not prompts. Not templates. Executable workflows that trigger on specific conditions and run code to get things done.

---

## Quickstart

```bash
# 1. Clone the repo
git clone https://github.com/ElliotJLT/Claude-Skill-Potions.git ~/.claude/skills

# 2. Copy a skill to your CLAUDE.md
cat ~/.claude/skills/skills/dont-be-greedy/SKILL.md >> ~/.claude/CLAUDE.md

# 3. Restart Claude Code
```

---

## Skills

### Planning & Risk

- [pre-mortem](skills/pre-mortem) - Before starting significant tasks, imagines failure scenarios, assesses risks, and reorders the implementation plan to address high-risk items first. Based on Gary Klein's prospective hindsight research.

- [you-sure](skills/you-sure) - Before destructive or irreversible actions (rm -rf, DROP TABLE, force push), pauses with a clear checklist of impact and requires explicit confirmation. Never auto-executes dangerous operations.

### Data & Context Management

- [dont-be-greedy](skills/dont-be-greedy) - Prevents context overflow by estimating file sizes, chunking large data, and summarizing before loading. Never loads raw files without checking first.

### Debugging & Problem Solving

- [rubber-duck](skills/rubber-duck) - When users describe problems vaguely, forces structured articulation through targeted questions before proposing solutions. Catches XY problems and handles frustrated users.

### Quality & Verification

- [prove-it](skills/prove-it) - Before declaring tasks complete, actually verify the outcome. Addresses Claude's core limitation: optimizing for "looks right" over "works right." No victory laps without proof.

### Productivity

- [eta](skills/eta) - Estimates task completion time based on codebase scope, complexity keywords, and risk factors. Provides time ranges, not false precision.

- [ship-it](skills/ship-it) - Declares when tasks are shippable, distinguishes blockers from polish, and prevents perfectionism loops. Helps users make the call: ship or iterate.

### Accountability

- [drip](skills/drip) - Tracks and surfaces estimated water consumption per session (~0.5ml per 1,000 tokens). Makes the physical cost of AI visible. Not guilt - just awareness that intelligence has a footprint.

### Meta

- [learn-from-this](skills/learn-from-this) - When a session contains a significant failure, analyses the root cause and drafts a new skill to prevent it. The skill library grows from real pain, not theory.

---

## What's a Skill?

A skill teaches Claude *how* to do something. It's the difference between:

- "Here's a prompt template for analysing data"
- "When a CSV is uploaded, immediately run `analyze.py`, generate stats, create charts, return summary"

Skills have three layers:

| Layer | What it contains | Token cost |
|-------|------------------|------------|
| **Metadata** | Name + description (the trigger) | ~100 tokens, always loaded |
| **Instructions** | Step-by-step workflow | Loaded when triggered |
| **Resources** | Python scripts, templates | Executed, not loaded into context |

The magic is Layer 3. Scripts *execute* and return *output* - they don't bloat context with code.

---

## Installing Skills

### Global (all projects)

```bash
git clone https://github.com/ElliotJLT/Claude-Skill-Potions.git ~/.claude/skills
cat ~/.claude/skills/skills/dont-be-greedy/SKILL.md >> ~/.claude/CLAUDE.md
```

### Per-project

```bash
git clone https://github.com/ElliotJLT/Claude-Skill-Potions.git .claude-skills
cat .claude-skills/skills/dont-be-greedy/SKILL.md >> CLAUDE.md
```

### Updating

```bash
cd ~/.claude/skills && git pull
```

---

## Skill Format

See the [skill writing guide](docs/writing-skills.md) for the full spec.

Key rules:
1. **Description is the trigger** - Write "When [condition], [actions]"
2. **One job, done well** - If it has "and also", make two skills
3. **Code in scripts, not markdown** - Reference `scripts/foo.py`, don't embed code
4. **Override defaults** - Add NEVER/ALWAYS sections for proactive behavior

---

## Why "Potions"?

Skills are like potions - small, focused, powerful. You brew them carefully, they do one thing well, and you combine them for complex effects.

Also it sounds cooler than "claude-skill-collection".

---

Built by [@elliot](https://github.com/elliotjlt)
