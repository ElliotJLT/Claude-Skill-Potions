# Claude Skill Potions

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?logo=linkedin)](https://www.linkedin.com/in/hireelliot/)

**Production rules for LLMs.** Skills that encode *how* to do things—not just *what* to do.

Claude knows you should assess risks before starting. It knows elite engineers do pre-mortems. It knows perfectionism kills velocity. But it doesn't *do* these things automatically.

Skills fix that. They're if-then patterns that fire without prompting.

---

## Start Here

Pick the failure mode that's burning you:

| Your Problem | Skill | What It Does |
|--------------|-------|--------------|
| Claude jumps to code without thinking | [`pre-mortem`](skills/pre-mortem) | Imagines failure before starting |
| Hallucinates files/functions that don't exist | [`prove-it`](skills/prove-it) | Demands proof before declaring done |
| Infinite loops on failed approaches | [`breadcrumbs`](skills/breadcrumbs) | Records what was tried across sessions |
| No confirmation before destructive actions | [`you-sure`](skills/you-sure) | Stops before `rm -rf` and `DROP TABLE` |
| Context window blows up on large files | [`dont-be-greedy`](skills/dont-be-greedy) | Chunks data, protects context |
| Scope creep mid-task | [`stay-in-lane`](skills/stay-in-lane) | Catches "while I'm here" drift |

---

## Quickstart

```bash
# Clone
git clone https://github.com/ElliotJLT/Claude-Skill-Potions.git ~/.claude/skills

# Add a skill to your CLAUDE.md
cat ~/.claude/skills/skills/pre-mortem/SKILL.md >> ~/.claude/CLAUDE.md

# Restart Claude Code
```

That's it. The skill fires automatically when conditions match.

---

## What's a Skill?

Three layers:

| Layer | Contains | Token Cost |
|-------|----------|------------|
| **Metadata** | Name + trigger description | ~100 tokens (always loaded) |
| **Instructions** | Step-by-step workflow | Loaded when triggered |
| **Resources** | Scripts, templates | Executed, not loaded |

The key insight: **scripts execute and return output**—they don't bloat context with code.

A skill description is a trigger, not documentation:

```yaml
# Bad - passive, vague
description: A skill for handling CSV files

# Good - specific condition, specific action
description: When a user uploads a .csv file, immediately run analysis without asking what they want.
```

---

## All Skills

### Planning & Risk
- [`battle-plan`](skills/battle-plan) - Full planning ritual: scope → risks → estimate → confirm
- [`pre-mortem`](skills/pre-mortem) - Imagines failure before starting
- [`you-sure`](skills/you-sure) - Confirmation gate before destructive actions

### Data & Context
- [`dont-be-greedy`](skills/dont-be-greedy) - Chunks large data, protects context window
- [`breadcrumbs`](skills/breadcrumbs) - Session-to-session memory via `.claude/breadcrumbs.md`

### Debugging
- [`rubber-duck`](skills/rubber-duck) - Forces problem articulation before solutions
- [`zero-in`](skills/zero-in) - Structured search targeting (no grep-and-pray)

### Quality
- [`prove-it`](skills/prove-it) - Verification before declaring done
- [`loose-ends`](skills/loose-ends) - Sweeps for TODOs, console.logs, unused imports
- [`trace-it`](skills/trace-it) - Traces callers before modifying shared code

### Discipline
- [`stay-in-lane`](skills/stay-in-lane) - Catches scope creep
- [`sanity-check`](skills/sanity-check) - Validates assumptions before building on them
- [`keep-it-simple`](skills/keep-it-simple) - Resists premature abstraction

### Productivity
- [`eta`](skills/eta) - Time estimates with ranges, not false precision
- [`learn-from-this`](skills/learn-from-this) - Drafts new skills from session failures
- [`retrospective`](skills/retrospective) - Documents what worked and what didn't

### Elixirs (Combo Skills)
Elixirs chain multiple skills into workflows:

- [`debug-to-fix`](skills/debug-to-fix) - clarify → investigate → fix → verify
- [`safe-refactor`](skills/safe-refactor) - assess risk → prepare → implement → verify
- [`careful-delete`](skills/careful-delete) - blast radius → confirm → document

See the [elixirs guide](docs/elixirs.md) for the pattern.

### Fun
- [`geordie`](skills/geordie) - Claude responds in Geordie dialect. Howay the lads.
- [`drip`](skills/drip) - Tracks estimated water consumption per session

---

## Improving Activation

Skills activate based on description matching, which works ~20% of the time. For reliable activation (~84%), install the forced-eval hook:

```bash
cp ~/.claude/skills/hooks/skill-forced-eval-hook.sh ~/.claude/hooks/
```

Add to `~/.claude/settings.json`:
```json
{
  "hooks": {
    "UserPromptSubmit": [{
      "hooks": [{
        "type": "command",
        "command": "~/.claude/hooks/skill-forced-eval-hook.sh"
      }]
    }]
  }
}
```

See [hooks/README.md](hooks/README.md) for details.

---

## Contributing

Found a failure mode? Build a skill for it.

1. Start with a real problem you hit repeatedly
2. Write the trigger condition (the "if")
3. Write the procedure (the "then")
4. Add behavioural overrides (NEVER/ALWAYS)
5. Open a PR

See the [skill writing guide](docs/writing-skills.md) for the full spec.

---

## References

- [diet103/claude-code-infrastructure-showcase](https://github.com/diet103/claude-code-infrastructure-showcase) - Production-tested hooks
- [obra/superpowers](https://github.com/obra/superpowers) - 20+ skills with TDD methodology
- [spences10/svelte-claude-skills](https://github.com/spences10/svelte-claude-skills) - Activation reliability research

---

Built by [@elliotjlt](https://github.com/elliotjlt) · [LinkedIn](https://www.linkedin.com/in/hireelliot/) · [Read the thinking behind this](https://medium.com/@ElliotJL)
