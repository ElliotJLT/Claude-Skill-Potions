---
name: my-skill-name
description: |
  When [specific trigger condition], [specific actions to take].
  Be proactive and don't ask the user what to do - just do it.
allowed-tools: |
  bash: python, ls, cat
  file: read
---

# My Skill Name

<purpose>
One paragraph explaining what problem this skill solves and why it matters.
</purpose>

## Instructions

### Step 1: Detect Trigger

Describe how to recognize when this skill should activate.

### Step 2: Execute

```bash
python scripts/main.py "<input>"
```

### Step 3: Return Results

Describe what output to provide to the user.

## NEVER

- Ask "What would you like me to do?"
- Wait for user confirmation before acting
- [Add skill-specific anti-patterns]

## ALWAYS

- Act immediately when triggered
- Be thorough in first response
- [Add skill-specific behaviors]

## Examples

### Example 1: [Scenario Name]

**Input:** User says "[example input]"

**Workflow:**
1. [Step one]
2. [Step two]
3. Return: [expected output]
