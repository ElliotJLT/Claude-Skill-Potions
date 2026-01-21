# Elixirs Guide

Elixirs are orchestrator skills that chain multiple skills together. They're not merged mega-skills - they're conductors that coordinate focused skills in sequence.

## The Pattern

```
Input ──▶ [Skill 1] ──▶ [Skill 2] ──▶ [Skill 3] ──▶ Output
          (Clarify)     (Execute)     (Verify)
```

Each skill does one thing well. The elixir ensures they run in order with proper handoffs.

## Why Elixirs?

**Without elixir:** You remember to use rubber-duck, forget prove-it, skip retrospective.

**With elixir:** One trigger activates the full workflow. Gates prevent skipping steps.

## Anatomy of an Elixir

```yaml
---
name: elixir-name
description: |
  When [trigger], orchestrate: skill-1 → skill-2 → skill-3.
  [What problem the full chain solves.]
---
```

### Key Components

**1. Dependency Check**
```markdown
## Prerequisites

Required skills (elixir degrades gracefully without them):
- skill-1: [what it provides]
- skill-2: [what it provides]
```

**2. Phases with Gates**
```markdown
<phase_1>
**Invoke:** skill-1
**Gate:** Do not proceed until [condition met]
**Output:** [What this phase produces]
</phase_1>

<phase_2>
**Invoke:** skill-2
**Input:** Output from Phase 1
**Gate:** Do not proceed until [condition met]
</phase_2>
```

**3. Graceful Degradation**
If a component skill isn't installed, the elixir should:
- Note the missing skill
- Execute the phase with built-in fallback instructions
- Continue the chain

## Available Elixirs

| Elixir | Chain | Trigger |
|--------|-------|---------|
| [debug-to-fix](../skills/debug-to-fix/) | rubber-duck → investigate → prove-it | Debugging frustration, "why isn't this working?" |
| [battle-plan](../skills/battle-plan/) | rubber-duck → pre-mortem → eta → you-sure | Significant new tasks |

## Creating Your Own

### Step 1: Identify the Chain

Ask:
- What skills do I use together repeatedly?
- What's the natural order?
- Where do I forget steps?

### Step 2: Define Gates

Each phase needs a gate - a condition that must be met before proceeding:

| Phase | Example Gate |
|-------|--------------|
| Clarify | Problem statement written and confirmed |
| Plan | Risk assessment complete |
| Execute | Implementation done |
| Verify | Tests pass, behavior confirmed |
| Document | Retrospective captured |

### Step 3: Handle Missing Skills

Not everyone has all skills installed. Your elixir should:

```markdown
## Phase 1: Clarify

**If rubber-duck installed:** Invoke rubber-duck skill
**If not installed:** Ask these questions:
1. What did you expect to happen?
2. What actually happened?
3. What have you already tried?
```

### Step 4: Keep It Linear (Usually)

Start with simple chains. Parallel execution is possible but adds complexity:

```
# Simple (recommended)
A → B → C → D

# Parallel (advanced)
A → [B, C] → D
    (B and C run simultaneously)
```

Only parallelize when phases are truly independent.

## Anti-Patterns

### The Kitchen Sink
**Bad:** Elixir that chains 8 skills for every task
**Why:** Most tasks don't need the full ceremony. Over-orchestration slows you down.

### Tight Coupling
**Bad:** Elixir that breaks completely if one skill is missing
**Why:** Users install skills incrementally. Degrade gracefully.

### Skippable Gates
**Bad:** Gates that say "optionally verify"
**Why:** If it's optional, it gets skipped. Gates should enforce, not suggest.

## When NOT to Use Elixirs

- **Simple tasks** - Don't orchestrate a 3-skill chain to rename a variable
- **Exploratory work** - When you don't know the path yet, rigid chains hurt
- **One-off tasks** - Elixirs are for repeated workflows

## Elixir vs Skill

| Aspect | Skill | Elixir |
|--------|-------|--------|
| Purpose | Do one thing well | Coordinate multiple things |
| Complexity | Self-contained | Depends on other skills |
| Token cost | Lower | Higher (loads multiple skills) |
| Use case | Specific capability | End-to-end workflow |

Rule of thumb: If you're writing `## Phase 1`, `## Phase 2`, etc., you're building an elixir.
