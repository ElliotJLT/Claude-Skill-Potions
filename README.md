# Claude Skill Potions

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/ElliotJLT/Claude-Skill-Potions/pulls)
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

### Data & Context Management

- [dont-be-greedy](skills/dont-be-greedy) - Prevents context overflow by estimating file sizes, chunking large data, and summarizing before loading. Never loads raw files without checking first.

### Productivity

- [eta](skills/eta) - Estimates task completion time based on codebase scope, complexity keywords, and risk factors. Provides time ranges, not false precision.

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

## Creating a Skill

Use the template to get started:

```bash
cp -r ~/.claude/skills/skills/_template ~/.claude/skills/skills/my-skill
```

Then edit `SKILL.md` following the [skill writing guide](docs/writing-skills.md).

### Key Rules

1. **Description is the trigger** - Write "When [condition], [actions]"
2. **One job, done well** - If it has "and also", make two skills
3. **Code in scripts, not markdown** - Reference `scripts/foo.py`, don't embed code
4. **Override defaults** - Add NEVER/ALWAYS sections for proactive behavior

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

## Contributing

1. Each skill lives in `skills/[skill-name]/`
2. Must have a `SKILL.md` with YAML frontmatter (only `name`, `description`, `allowed-tools`)
3. Scripts go in `skills/[skill-name]/scripts/`
4. Follow the [skill writing guide](docs/writing-skills.md)

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## Why "Potions"?

Skills are like potions - small, focused, powerful. You brew them carefully, they do one thing well, and you combine them for complex effects.

Also it sounds cooler than "claude-skill-collection".

---

Built by [@elliot](https://github.com/elliotjlt)
