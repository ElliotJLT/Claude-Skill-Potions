# Skill Writing Guide

Every skill lives in `skills/[skill-name]/SKILL.md` with this structure:

```yaml
---
name: skill-name
description: |
  When [specific trigger condition], [specific actions to take].
  Be proactive and don't ask the user what to do - just do it.
allowed-tools: |
  bash: [list of allowed bash commands]
  file: [file permissions if needed]
---

# Skill Title

<purpose>
One paragraph explaining what problem this skill solves.
</purpose>

## Instructions

[Step-by-step workflow in markdown]

## Examples

[Concrete input/output examples]
```

---

## Critical Rules

### 1. Description Is The Trigger

The description field is NOT documentation. Claude scans it at startup to decide WHEN to activate the skill. Write it as a trigger condition.

**Bad:**
```yaml
description: A skill for handling CSV files
```

**Good:**
```yaml
description: |
  When a user uploads a .csv file or asks to analyse tabular data,
  immediately estimate token size, chunk if >30k tokens, and return
  summary statistics without asking what the user wants.
```

Pattern: "When [condition], [actions]."

### 2. Only Three YAML Fields Matter

| Field | Required | Purpose |
|-------|----------|---------|
| name | Yes | Skill identifier, lowercase with hyphens |
| description | Yes | Trigger condition + actions |
| allowed-tools | No | Restricts which tools the skill can use |

Do NOT add: triggers, outputs, resources, metadata, version, title, author, license. These are not part of the spec and will be ignored.

### 3. Three-Layer Architecture

| Layer | Location | Token Cost | When Loaded |
|-------|----------|------------|-------------|
| Level 1: Metadata | YAML frontmatter | ~100 tokens | Always |
| Level 2: Instructions | SKILL.md body | <5000 tokens | When triggered |
| Level 3: Resources | /scripts/*.py | Zero | Executed, not loaded |

Key insight: Scripts EXECUTE and return OUTPUT. The code itself never enters context. Put heavy logic in scripts, not in the markdown.

### 4. Override Claude's Defaults

Claude's default personality asks questions. For specialist skills, override this:

```markdown
## NEVER

- Ask "What would you like me to do with this?"
- Wait for user direction before acting
- Offer options instead of taking action

## ALWAYS

- Act immediately on trigger
- Be thorough in first response
- Only ask if genuinely ambiguous
```

### 5. Use XML Tags For Structure

Claude recognises XML tags as hard boundaries:

```markdown
<validation>
Check file exists. Verify format. Confirm size.
</validation>

<execution>
Run analysis. Generate output. Save results.
</execution>
```

### 6. Scripts Go In /scripts/

```
skills/
└── my-skill/
    ├── SKILL.md           # Required
    └── scripts/           # Optional
        ├── analyse.py
        └── transform.py
```

Reference scripts in instructions:
```markdown
Run `scripts/analyse.py --path <file>` to get token estimate.
```

Do NOT embed code in the SKILL.md body. Reference external scripts.

---

## Example: Complete Skill

```yaml
---
name: portion-control
description: |
  ALWAYS activate before reading files, loading data exports, processing logs,
  or calling any tool that returns variable-length data. First estimate the
  response size. If >10K tokens, chunk, filter, or summarise before loading
  into context. Never load raw data without size check.
allowed-tools: |
  bash: cat, head, tail, wc, grep, jq, find, du, ls, python
  file: read
---

# Portion Control

<purpose>
Prevents context overflow by enforcing size-aware data loading. Agents die
when they load data exceeding their context window. This skill enforces
"measure twice, load once."
</purpose>

## Instructions

### Step 1: Estimate Before Loading

Before ANY data operation:

\```bash
python scripts/estimate_size.py --path "<file>"
\```

### Step 2: Apply Strategy

| Estimated Tokens | Action |
|------------------|--------|
| < 10,000 | Load directly |
| 10,000 - 50,000 | Filter first |
| > 50,000 | Chunk and summarise |

### Step 3: Execute

<strategy name="filter-first">
\```bash
jq '.items[] | {id, name}' data.json
\```
</strategy>

## NEVER

- Load files without size check
- Use `cat` on unknown files
- Return unfiltered API responses

## Examples

### Example 1: User uploads large CSV

User: "Analyse this sales data" (uploads 50MB file)

1. Run `scripts/estimate_size.py` -> 150K tokens
2. Too large. Run `scripts/chunker.py` -> 20 chunks
3. Summarise each chunk
4. Return: overall summary + per-chunk insights
```

---

## Checklist Before Committing

- [ ] YAML has only name, description, and optionally allowed-tools
- [ ] Description starts with "When [trigger]"
- [ ] Description includes specific actions, not vague summaries
- [ ] No code blocks longer than 10 lines in SKILL.md (use scripts)
- [ ] Includes NEVER/ALWAYS behavioural overrides
- [ ] Has concrete examples with expected input/output
- [ ] Scripts are in skills/[name]/scripts/
- [ ] Total SKILL.md body is under 5000 tokens
