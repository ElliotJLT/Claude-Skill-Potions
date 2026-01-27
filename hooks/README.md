# Activation Hooks

Skills are supposed to activate autonomously based on their descriptions. In practice, description-based activation achieves roughly **20% success** - essentially a coin flip.

This directory contains hooks that dramatically improve activation rates.

## The Research

Testing by [spences10](https://github.com/spences10/svelte-claude-skills) across 200+ prompts found:

| Hook Type | Success Rate | Notes |
|-----------|-------------|-------|
| No hook (description only) | ~20% | Baseline - unreliable |
| Simple instruction | 20% | "If prompt matches, use Skill()" - no better |
| **Forced evaluation** | **84%** | Requires explicit YES/NO per skill |
| LLM pre-eval | 80% | External API call, can fail spectacularly |

## Why Forced Eval Works

The difference is a **commitment mechanism**.

Simple instruction (20%):
```
If the prompt matches any skill keywords, use Skill(skill-name).
```

This is passive. Claude acknowledges it, then ignores it.

Forced evaluation (84%):
```
Step 1 - EVALUATE: For each skill, state YES/NO with reason
Step 2 - ACTIVATE: Use Skill() tool NOW
Step 3 - IMPLEMENT: Only after activation
```

This forces Claude to:
1. **Show its work** - explicitly evaluate each skill
2. **Make a commitment** - state YES/NO for each
3. **Follow through** - can't skip to implementation without activating

Once Claude writes "YES - need this skill" in its response, it's committed.

## Installation

### Per-Project

```bash
# Copy hook to your project
cp hooks/skill-forced-eval-hook.sh /path/to/project/.claude/hooks/

# Add to .claude/settings.json
```

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/skill-forced-eval-hook.sh"
          }
        ]
      }
    ]
  }
}
```

### Global

```bash
# Copy to global hooks directory
cp hooks/skill-forced-eval-hook.sh ~/.claude/hooks/

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

## Trade-offs

**Pros:**
- 84% activation vs 20% baseline
- No external dependencies
- Pure client-side solution

**Cons:**
- Verbose output (Claude lists every skill with YES/NO reasoning)
- Slightly more tokens per request
- Not 100% (nothing is)

## When to Use

Use the forced-eval hook when:
- You have multiple skills installed
- Skills frequently fail to activate
- Consistency matters more than brevity

Skip the hook when:
- You only have 1-2 simple skills
- You prefer cleaner output
- You're invoking skills manually anyway

## Creating Custom Hooks

The hook is a shell script that outputs text injected into the prompt. You can customize:

- The evaluation format
- Which skills to evaluate (filter by category)
- The aggressiveness of language ("MANDATORY", "CRITICAL", etc.)

Aggressive language helps. Words like "WORTHLESS unless you ACTIVATE" make it harder for Claude to ignore.

## Context-Loader Hook

While forced-eval evaluates ALL skills, the context-loader hook is **selective**.
It suggests skills based on file patterns and keywords in the prompt.

### How It Works

1. User prompt mentions "auth" or "login"
2. Hook checks `skill-triggers.yaml` for matching patterns
3. Finds: `auth|login: pre-mortem, prove-it`
4. Suggests those specific skills (not all 20+)

### Configuration

Edit `skill-triggers.yaml` to customize:

```yaml
# Pattern: skill1, skill2
auth|login|password: pre-mortem, prove-it
database|migration: pre-mortem, you-sure, trace-it
refactor|cleanup: safe-refactor, trace-it
```

### Installation

```bash
# Copy both files
cp hooks/context-loader-hook.sh /path/to/project/.claude/hooks/
cp hooks/skill-triggers.yaml /path/to/project/.claude/

# Add to .claude/settings.json
```

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/context-loader-hook.sh"
          }
        ]
      }
    ]
  }
}
```

### Forced-Eval vs Context-Loader

| Aspect | Forced-Eval | Context-Loader |
|--------|-------------|----------------|
| Evaluates | All skills | Matching skills only |
| Output | Verbose (YES/NO for each) | Concise (only suggestions) |
| Best for | Ensuring nothing missed | Reducing noise |
| Activation | Mandatory | Suggestive |

**Recommendation:** Use forced-eval for critical tasks, context-loader for routine work.

## References

- [Original research and testing framework](https://github.com/spences10/svelte-claude-skills)
- [Claude Code hooks documentation](https://docs.anthropic.com/en/docs/claude-code/hooks)
