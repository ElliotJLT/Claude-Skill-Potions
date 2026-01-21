# Claude Skill Potions

**Reusable skills for Claude Code that actually work.**

Skills are procedural knowledge for Claude. Not prompts. Not templates. Executable workflows that trigger on specific conditions and run code to get things done.

```bash
git clone https://github.com/ElliotJLT/Claude-Skill-Potions.git ~/.claude/skills
```

---

## What's a Skill?

A skill teaches Claude *how* to do something. It's the difference between:

- ❌ "Here's a prompt template for analysing data"
- ✅ "When a CSV is uploaded, immediately run `analyze.py`, generate stats, create charts, return summary"

Skills have three layers:

| Layer | What it contains | Token cost |
|-------|------------------|------------|
| **Metadata** | Name + description (the trigger) | ~100 tokens, always loaded |
| **Instructions** | Step-by-step workflow | Loaded when triggered |
| **Resources** | Python scripts, templates | Executed, not loaded into context |

The magic is Layer 3. Scripts *execute* and return *output* - they don't bloat context with code.

---

## What Makes a Good Skill?

### 1. Specific trigger conditions

```yaml
# Bad - vague, won't trigger reliably
description: A skill for handling data files

# Good - specific condition + actions
description: When a user uploads a .csv file, immediately run comprehensive 
  data analysis, generate summary statistics, identify missing values, 
  and create visualisations without asking what they want.
```

### 2. One job, done well

If your description contains "and also", you need two skills.

### 3. Code in Layer 3, not Layer 2

```markdown
# Bad - code in instructions (eats context)
Run this Python code:
\`
\`python
import pandas as pd
# ... 200 lines of analysis code
\`
\`

# Good - reference external script
Run `scripts/analyze.py` on the uploaded file.
```

### 4. Explicit behaviour overrides

Claude's default personality asks questions. For specialist tasks, override it:

```markdown
## NEVER SAY:
- "What would you like me to do with this?"
- "How can I help you further?"
- Any question asking for user direction

## INSTEAD:
- Take action immediately
- Be thorough in first response
- Only ask if genuinely ambiguous
```

---

## Skills in This Repo

| Skill | What it does |
|-------|--------------|
| `dont-be-greedy` | Prevents context overflow - estimates file sizes, chunks large data, summarizes before loading |
| `eta` | Estimates task completion time based on codebase scope and complexity analysis |

---

## Skill vs Prompt vs Project vs MCP

| Thing | What it is | Use when |
|-------|-----------|----------|
| **Custom instructions** | Global personality settings | "Always use British English" |
| **Project instructions** | Static context for a workspace | Company docs, brand guidelines |
| **Skill** | Triggered workflow with code execution | Repeatable multi-step tasks |
| **MCP server** | Connection to external tools/data | API access, database queries |

Skills and MCP are complementary:
- MCP gives Claude *access* to Notion
- A skill teaches Claude *how* to prep meetings using Notion

---

## Installing Skills

### Option 1: Global install (all projects)

```bash
# Clone to your Claude config directory
git clone https://github.com/ElliotJLT/Claude-Skill-Potions.git ~/.claude/skills

# Add skills to your global CLAUDE.md
echo "See ~/.claude/skills for available skills." >> ~/.claude/CLAUDE.md
```

Then copy the content from any `skills/[name]/SKILL.md` into your `~/.claude/CLAUDE.md`.

### Option 2: Per-project install

```bash
# From your project root
git clone https://github.com/ElliotJLT/Claude-Skill-Potions.git .claude-skills

# Copy a specific skill into your project's CLAUDE.md
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
4. Description must be a trigger: "When [condition], [actions]"

---

## Why "Potions"?

Skills are like potions - small, focused, powerful. You brew them carefully, they do one thing well, and you combine them for complex effects.

Also it sounds cooler than "claude-skill-collection".

---

Built by [@elliot](https://github.com/elliotjlt) • Powered by frustration with agents that don't finish tasks