# Skill Writing Guide

## Core Principles

### Conciseness is key

The context window is a public good. Your skill shares it with the system prompt, conversation history, other skills, and the actual request.

At startup, only metadata (name + description) is loaded (~100 tokens). The SKILL.md body loads when triggered. Scripts execute without loading into context.

**Challenge each piece of information:**
- "Does Claude really need this explanation?"
- "Can I assume Claude knows this?"
- "Does this paragraph justify its token cost?"

### Claude is already smart

Only add context Claude doesn't already have. Don't explain what PDFs are. Don't explain how libraries work. Don't add tutorials.

**Bad** (~150 tokens):
```
PDF (Portable Document Format) files are a common file format that contains
text, images, and other content. To extract text from a PDF, you'll need to
use a library. There are many libraries available...
```

**Good** (~50 tokens):
```
Use pdfplumber for text extraction:
python scripts/extract.py <file>
```

### Keep it under 500 lines

If your SKILL.md exceeds 500 lines, split into separate reference files that Claude reads on-demand.

---

## Structure

Every skill lives in `skills/[skill-name]/SKILL.md`:

```yaml
---
name: skill-name
description: |
  [Third-person description of what it does and when to activate.]
  [Specific actions, not vague summaries.]
allowed-tools: |
  bash: [allowed commands]
  file: [permissions]
---

# Skill Title

<purpose>
One paragraph: what problem this solves.
</purpose>

## Instructions

[Step-by-step workflow]

## NEVER

[Anti-patterns]

## ALWAYS

[Required behaviors]

## Examples

[Concrete input/output pairs]
```

### YAML Fields

| Field | Required | Constraints |
|-------|----------|-------------|
| name | Yes | Max 64 chars, lowercase, hyphens only |
| description | Yes | Max 1024 chars, non-empty |
| allowed-tools | No | Restricts available tools |

Do NOT add: triggers, outputs, resources, metadata, version, author, license.

### Naming Conventions

Use lowercase with hyphens. Two styles work:

- **Gerund form**: `processing-pdfs`, `analyzing-data`, `managing-context`
- **Imperative form**: `prove-it`, `ship-it`, `pre-mortem`

Pick one style and be consistent within your collection.

### Writing Descriptions

Write in **third person**. The description is injected into the system prompt.

**Good:**
```yaml
description: |
  Extracts text and tables from PDF files. Activates when working with
  PDF files or when document extraction is mentioned.
```

**Avoid:**
```yaml
description: |
  When a user uploads a PDF, I will extract the text...
```

Include both **what it does** and **when to activate**.

---

## Degrees of Freedom

Match specificity to task fragility:

**High freedom** (multiple valid approaches):
```
Analyze the code structure and suggest improvements.
Adapt based on what you find.
```

**Medium freedom** (preferred pattern with flexibility):
```python
def generate_report(data, format="markdown"):
    # Customize as needed
```

**Low freedom** (fragile, must be exact):
```bash
python scripts/migrate.py --verify --backup
# Do not modify this command
```

Use low freedom when operations are fragile or irreversible.

---

## Three-Layer Architecture

| Layer | Location | Token Cost | When Loaded |
|-------|----------|------------|-------------|
| Metadata | YAML frontmatter | ~100 tokens | Always |
| Instructions | SKILL.md body | Variable | When triggered |
| Resources | /scripts/*.py | Zero | Executed, not loaded |

**Key insight:** Scripts execute and return output. The code never enters context. Put heavy logic in scripts.

```
skills/
└── my-skill/
    ├── SKILL.md
    └── scripts/
        ├── analyze.py
        └── validate.py
```

Reference scripts in instructions:
```markdown
Run `scripts/analyze.py --path <file>` to get results.
```

---

## Patterns

### Override Claude's Defaults

Claude's default asks questions. For specialist skills, override:

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

### Feedback Loops

For quality-critical tasks, build validation into the workflow:

```markdown
1. Make changes
2. Run validation: `python scripts/validate.py`
3. If errors: fix and repeat step 2
4. Only proceed when validation passes
```

### Progressive Disclosure

Keep SKILL.md as overview, link to details:

```markdown
## Quick start
[Core instructions here]

## Advanced
See [ADVANCED.md](ADVANCED.md) for edge cases.
See [REFERENCE.md](REFERENCE.md) for API details.
```

Claude reads linked files only when needed.

### Examples Pattern

Provide concrete input/output pairs:

```markdown
## Examples

**Input:** "Fix the login bug"
**Output:**
1. Reproduce the bug
2. Identify root cause
3. Implement fix
4. Verify fix works
```

---

## Scripts Best Practices

### Solve, Don't Punt

Handle errors in scripts rather than failing to Claude:

**Good:**
```python
def process_file(path):
    try:
        return open(path).read()
    except FileNotFoundError:
        print(f"File {path} not found, creating empty")
        return ''
```

**Bad:**
```python
def process_file(path):
    return open(path).read()  # Just fails
```

### Document Constants

Avoid "magic numbers":

**Good:**
```python
# 30s timeout accounts for slow connections
REQUEST_TIMEOUT = 30
```

**Bad:**
```python
TIMEOUT = 47  # Why 47?
```

### Use Forward Slashes

Always use Unix-style paths:
- Good: `scripts/helper.py`
- Bad: `scripts\helper.py`

---

## Anti-Patterns

### Too Many Options

**Bad:**
```
You can use pypdf, or pdfplumber, or PyMuPDF, or pdf2image...
```

**Good:**
```
Use pdfplumber for text extraction.
For scanned PDFs requiring OCR, use pdf2image with pytesseract.
```

Provide a default, with escape hatch for edge cases.

### Time-Sensitive Information

**Bad:**
```
If before August 2025, use the old API.
After August 2025, use the new API.
```

**Good:**
```
Use v2 API: api.example.com/v2/messages

<details>
<summary>Legacy v1 (deprecated)</summary>
Old endpoint: api.example.com/v1/messages
</details>
```

### Over-Explaining

If you're explaining what a PDF is or how imports work, delete it.

---

## Testing

### Test With Multiple Models

What works for Opus might need more detail for Haiku. Test your skill across models you plan to use.

### Build Evaluations

Create test scenarios before writing extensive docs:

1. Run Claude on tasks without the skill - note failures
2. Write minimal instructions to address gaps
3. Test again, iterate

### Iterate With Claude

Work with Claude to develop skills:

1. Complete a task with normal prompting
2. Note what context you repeatedly provided
3. Ask Claude to create a skill capturing that pattern
4. Test with fresh Claude instance
5. Refine based on behavior

---

## Checklist

Before committing:

- [ ] Under 500 lines
- [ ] Description in third person
- [ ] Description includes what AND when
- [ ] No over-explaining (Claude is smart)
- [ ] NEVER/ALWAYS overrides included
- [ ] Concrete examples with input/output
- [ ] Scripts handle errors (don't punt)
- [ ] No magic constants
- [ ] Tested the trigger activates correctly
