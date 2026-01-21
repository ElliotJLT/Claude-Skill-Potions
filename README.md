<div align="center">

<img src="assets/potion-wizard.png" alt="Skill Potions - Orange hooded wizard brewing code" width="400">

# Claude Skill Potions

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](pulls)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?logo=linkedin)](https://www.linkedin.com/in/hireelliot/)

**Reusable skills for Claude Code that actually work.**

</div>

**Skills** teach Claude *how* to do things. Not prompts - actual workflows that trigger automatically.

We call them **Potions** because they're small, focused, and powerful. Brew carefully, drop them in, they do one thing well. Also sounds cooler than "claude-skill-collection".

And guess what? You can combine them. Chain a few potions together and you get an **Elixir** - a combo skill that orchestrates a full workflow. Like a debug elixir that won't let you jump to fixes until you actually understand the problem.

Just markdown files. No magic required.

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

- [battle-plan](skills/battle-plan) - Complete planning ritual before significant tasks. Orchestrates [rubber-duck](skills/rubber-duck) (scope) -> [pre-mortem](skills/pre-mortem) (risks) -> [eta](skills/eta) (estimate) -> confirmation. No coding until the plan is approved.

- [pre-mortem](skills/pre-mortem) - Before starting significant tasks, imagines failure scenarios, assesses risks, and reorders the implementation plan to address high-risk items first. Based on Gary Klein's prospective hindsight research.

- [you-sure](skills/you-sure) - Before destructive or irreversible actions (rm -rf, DROP TABLE, force push), pauses with a clear checklist of impact and requires explicit confirmation. Never auto-executes dangerous operations.

### Data & Context Management

- [dont-be-greedy](skills/dont-be-greedy) - Prevents context overflow by estimating file sizes, chunking large data, and summarizing before loading. Never loads raw files without checking first.

### Debugging & Problem Solving

- [rubber-duck](skills/rubber-duck) - When users describe problems vaguely, forces structured articulation through targeted questions before proposing solutions. Catches XY problems and handles frustrated users.

- [scope-search](skills/scope-search) - Before searching a codebase, forces explicit scoping: what are you looking for, what would it look like, where would it live, what else might it be called. Prevents grep-and-pray.

### Quality & Verification

- [prove-it](skills/prove-it) - Before declaring tasks complete, actually verify the outcome. Addresses Claude's core limitation: optimizing for "looks right" over "works right." No victory laps without proof.

### Productivity

- [eta](skills/eta) - Estimates task completion time based on codebase scope, complexity keywords, and risk factors. Provides time ranges, not false precision.

- [ship-it](skills/ship-it) - Declares when tasks are shippable, distinguishes blockers from polish, and prevents perfectionism loops. Helps users make the call: ship or iterate.

- [learn-from-this](skills/learn-from-this) - When a session contains a significant failure, analyses the root cause and drafts a new skill to prevent it. The skill library grows from real pain, not theory.

- [retrospective](skills/retrospective) - After completing significant tasks, documents what worked, what failed, and key learnings. Failed attempts get documented first - they're read more than successes.

### Awareness

- [drip](skills/drip) - Tracks and surfaces estimated water consumption per session (~0.5ml per 1,000 tokens). Makes the physical cost of AI visible. Not guilt - just awareness that intelligence has a footprint.

### Elixirs

Elixirs are orchestrator skills that chain multiple skills together. See the [elixirs guide](docs/elixirs.md) for the pattern.

- [debug-to-fix](skills/debug-to-fix) - Full debug cycle: clarify → investigate → fix → verify. Chains rubber-duck and prove-it with built-in investigation. Prevents jumping to fixes before understanding the problem.

- [safe-refactor](skills/safe-refactor) - Refactoring cycle: assess risk → prepare → implement → verify. Chains pre-mortem and prove-it. Prevents "refactor broke production" disasters.

- [careful-delete](skills/careful-delete) - Destruction cycle: assess blast radius → explicit confirmation → document. Chains pre-mortem and you-sure. No `rm -rf` or `DROP TABLE` without ceremony.

- [battle-plan](skills/battle-plan) - Also an elixir. Chains rubber-duck → pre-mortem → eta → you-sure for complete planning before significant tasks.

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

### Improving Activation (Optional)

Skills activate based on descriptions, but this only works ~20% of the time. For reliable activation, install the forced-eval hook:

```bash
# Copy hook
cp ~/.claude/skills/hooks/skill-forced-eval-hook.sh ~/.claude/hooks/

# Add to ~/.claude/settings.json
```

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/skill-forced-eval-hook.sh"
          }
        ]
      }
    ]
  }
}
```

This increases activation from ~20% to ~84%. See [hooks/README.md](hooks/README.md) for details and trade-offs.

---

## Skill Format

See the [skill writing guide](docs/writing-skills.md) for the full spec.

Key rules:
1. **Description is the trigger** - Write "When [condition], [actions]"
2. **One job, done well** - If it has "and also", make two skills
3. **Code in scripts, not markdown** - Reference `scripts/foo.py`, don't embed code
4. **Override defaults** - Add NEVER/ALWAYS sections for proactive behavior

---

## References

Quality external resources for Claude Code skills:

- **[diet103/claude-code-infrastructure-showcase](https://github.com/diet103/claude-code-infrastructure-showcase)** - Production-tested activation hooks and skill-rules.json patterns. 6 months testing across 50k+ lines of TypeScript.

- **[obra/superpowers](https://github.com/obra/superpowers)** - Complete development methodology with 20+ skills. Uses TDD for skill development.

- **[ykdojo/claude-code-tips](https://github.com/ykdojo/claude-code-tips)** - 40+ practical tips and workarounds.

- **[spences10/svelte-claude-skills](https://github.com/spences10/svelte-claude-skills)** - Research on activation reliability (200+ prompt tests). Source of our forced-eval hook.

---

Built by [@elliot](https://github.com/elliotjlt) · [LinkedIn](https://www.linkedin.com/in/hireelliot/)
