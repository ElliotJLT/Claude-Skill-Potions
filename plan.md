# Obsidian + Claude Code Skills — Strategic Plan

## Context Dump (for your Obsidian vault)

### Resources Discovered

| Resource | URL | What It Is |
|----------|-----|------------|
| kepano/obsidian-skills | https://github.com/kepano/obsidian-skills | Obsidian CEO's official 5-skill pack (9.7k stars). Reference-style skills for OFM, Bases, Canvas, CLI, Defuddle |
| Yakitrak/obsidian-cli | https://github.com/Yakitrak/obsidian-cli | Free Go-based CLI (974 stars). CRUD on vault files without Obsidian running. Auto-updates wikilinks on move |
| Official Obsidian CLI | https://help.obsidian.md/cli | Ships with Obsidian 1.12+. Talks to running Obsidian instance. Catalyst/early-access ($25). Plugin dev commands, eval, screenshots |
| vincentkoc/awesome-openclaw | https://github.com/vincentkoc/awesome-openclaw | Curated ecosystem list. 14 categories, 2,999+ vetted skills, memory systems, deployment tools. Lists kepano as "transferable skill-pack patterns" |
| VoltAgent/awesome-openclaw-skills | (linked from awesome-openclaw) | Community index of 2,999 skills filtered from 5,705 (47% were spam/crypto/malicious) |
| runkids/skillshare | (linked from awesome-openclaw) | CLI to sync skills across 45+ AI tools via symlinks |
| sonomirco/obsidian-plugin-and-skills-for-granola | https://github.com/sonomirco/obsedian-plugin-and-skills-for-granola | Granola meeting notes → Obsidian sync (similar to our granola-sync skill) |
| OthmanAdi/planning-with-files | (linked from awesome-openclaw) | 3-file markdown planning pattern (task_plan.md, findings.md, progress.md) adopted across 14 IDEs |

### kepano's 5 Skills — What They Are

1. **obsidian-markdown** — Complete OFM reference: wikilinks, embeds, callouts (13 types), properties/frontmatter, block refs, highlights, comments, math, mermaid. ~500 lines of syntax tables and examples.
2. **obsidian-bases** — Full `.base` YAML schema: 4 view types (table/cards/list/map), filters (AND/OR/NOT nesting), 60+ formula functions, summaries, the `this` keyword. Essentially the Bases docs in skill form.
3. **json-canvas** — JSON Canvas Spec 1.0: 4 node types (text/file/link/group), edges, color system, ID generation, layout guidelines. Complete working examples for kanban boards, flowcharts.
4. **obsidian-cli** — Official CLI commands: read, create, append, search, daily notes, property management, plugin dev (reload, eval, screenshot, DOM inspection).
5. **defuddle** — Web page → clean markdown extraction via `defuddle-cli`. Thin reference skill (~50 lines).

### Key Insight: Two Different Skill Philosophies

| Aspect | kepano/obsidian-skills | Claude-Skill-Potions |
|--------|----------------------|---------------------|
| **Type** | Knowledge-reference (syntax cheat sheets) | Behavioral-workflow (how to approach tasks) |
| **Guardrails** | None | NEVER/ALWAYS sections, anti-patterns |
| **Scripts** | None | 6 skills have Python/shell scripts |
| **Activation** | Description-based | Forced-eval hooks (84% activation) |
| **Token cost** | High (1500+ per skill) | Moderate (layered: metadata → instructions → scripts) |
| **Packaging** | `.claude-plugin/` marketplace format | Manual `skills/` directory |

kepano's skills tell Claude **what** Obsidian syntax looks like. Our skills tell Claude **how** to approach tasks. These are complementary, not competing.

### Obsidian CLI Comparison

| Feature | Official CLI (1.12) | Yakitrak CLI |
|---------|-------------------|-------------|
| Requires running Obsidian | Yes | No (direct file ops) |
| Price | Catalyst ($25 early access) | Free, MIT |
| Read notes | `obsidian read file="..."` | `obsidian-cli print <name>` |
| Create notes | `obsidian create name="..." content="..."` | `obsidian-cli create <name> --content "..."` |
| Search | `obsidian search query="..."` | `obsidian-cli search` (fuzzy) / `search-content` (full-text) |
| Auto-update links on move | Not documented | Yes |
| Plugin dev tools | Yes (reload, eval, screenshot, DOM) | No |
| Daily notes | `obsidian daily:read/append` | `obsidian-cli daily` |
| WSL compatible | Needs the WSL PR | Likely works (file-based) |
| Install | Bundled with Obsidian 1.12 | `brew install yakitrak/yakitrak/obsidian-cli` |

**For your WSL setup**: Yakitrak is the practical choice today. It reads/writes vault files directly — no need for Obsidian to be running. The official CLI needs a running Obsidian instance which complicates WSL (Obsidian on Windows, CLI needs to talk to it across the boundary).

---

## The Decision: Expand Scope vs. Separate Branch

### Recommendation: Expand within this repo, in a dedicated `skills/obsidian-*` namespace

**Why not a separate repo:**
- kepano already owns the "obsidian-skills" namespace with 9.7k stars
- A separate repo fragments your skill ecosystem and breaks elixir chaining
- Your granola-sync skill already lives here — Obsidian skills belong alongside it
- The value you add is the **behavioral layer** on top of kepano's reference layer

**Why expand here:**
- Your skills are behavioral workflows; kepano's are reference docs. Different value.
- You can import/reference kepano's syntax knowledge without copying it
- Your forced-eval hooks, elixir patterns, and script architecture are unique advantages
- Naming convention: `obsidian-*` prefix keeps them organized (e.g., `obsidian-vault-init`, `obsidian-note-create`)

---

## Planned Skills

### Phase 1 — Foundation (Core Obsidian Workflow Skills)

#### 1. `obsidian-vault-init`
**What it does:** Initializes a new or existing Obsidian vault for Claude Code workflows. Sets up folder structure, templates, `.base` files, and a `CLAUDE.md` that describes the vault to future sessions.

**Why it's better than what exists:** kepano has no vault setup skill. This fills the "cold start" gap — the hardest part of Obsidian adoption.

**Key behaviors:**
- Asks about vault purpose (PKM, project notes, journal, mixed)
- Creates folder structure with templates per folder
- Sets up frontmatter conventions
- Creates a `CLAUDE.md` describing the vault structure for agent sessions
- Creates starter `.base` files for common views

#### 2. `obsidian-note-create`
**What it does:** Creates well-structured Obsidian notes with proper frontmatter, wikilinks, and template adherence. Wraps either the official CLI or Yakitrak CLI depending on what's available.

**Why it's better than what exists:** kepano's `obsidian-cli` skill is a command reference. This is a behavioral skill that ensures notes are created correctly — right folder, right template, right frontmatter, right links.

**Key behaviors:**
- Detects available CLI (official → Yakitrak → direct file write fallback)
- Reads vault's template conventions before creating
- Validates frontmatter against vault's property schema
- Creates wikilinks to related existing notes
- Applies the user's folder → template mapping

#### 3. `obsidian-daily-driver`
**What it does:** Manages daily notes workflow — append tasks, log learnings, link to project notes. Bridges Claude Code sessions to your daily note.

**Why it's better than what exists:** No behavioral skill exists for daily note workflows. This makes Claude Code a daily note companion.

**Key behaviors:**
- Appends session summaries to today's daily note
- Creates task items from Claude Code todos
- Links session breadcrumbs to daily note
- Integrates with the `breadcrumbs` skill for cross-session context

### Phase 2 — Power Features

#### 4. `obsidian-vault-search`
**What it does:** Searches an Obsidian vault intelligently — combines CLI search, frontmatter filtering, and wikilink graph traversal to find relevant notes.

**Why it's better than what exists:** Raw CLI search is keyword-based. This adds structured search (by property, by link, by folder) and presents results with context.

#### 5. `obsidian-canvas-create`
**What it does:** Generates `.canvas` files programmatically from structured input. Takes a description of what you want to visualize and produces valid JSON Canvas.

**Why it's better than what exists:** kepano's `json-canvas` skill is a spec reference. This is a behavioral skill that generates canvases from intent (e.g., "create a kanban board for my project tasks").

#### 6. `obsidian-base-create`
**What it does:** Generates `.base` files from natural language descriptions. "Show me all notes tagged #project that are status:active, sorted by date" → valid `.base` YAML.

**Why it's better than what exists:** kepano's `obsidian-bases` skill is a syntax reference. This translates intent to working `.base` files.

### Phase 3 — Elixirs (Orchestrated Workflows)

#### 7. `obsidian-session-sync` (Elixir)
**What it does:** End-of-session ritual that syncs Claude Code session artifacts to your Obsidian vault. Chains: `breadcrumbs` → `retrospective` → `obsidian-note-create` → `obsidian-daily-driver`.

**Why:** Bridges the gap between "Claude Code session" and "persistent knowledge." Every session leaves a trace in your vault.

#### 8. `obsidian-research-flow` (Elixir)
**What it does:** Research workflow: gather sources → extract content (defuddle) → create structured notes → link to existing knowledge → create a canvas map. Chains: `zero-in` → web fetch → `obsidian-note-create` → `obsidian-canvas-create`.

**Why:** Complete research-to-vault pipeline. Web content becomes permanent, linked knowledge.

---

## Rewrite Opportunities (Existing Skills We Can Do Better)

### From kepano/obsidian-skills

| kepano Skill | Opportunity | Our Approach |
|-------------|-------------|--------------|
| **defuddle** | Very thin (~50 lines), just a CLI reference | Rewrite as a behavioral skill: when to extract, how to structure the output for Obsidian, frontmatter generation, vault placement decisions |
| **obsidian-cli** | Pure command reference, no workflow guidance | We don't rewrite this — we *wrap* it with behavioral skills (`obsidian-note-create`, `obsidian-daily-driver`) that use it as a tool |
| **obsidian-markdown** | High quality, but no guardrails or anti-patterns | We don't need to rewrite — reference it. Our skills can specify "follow OFM conventions per kepano/obsidian-skills" |
| **obsidian-bases** | High quality reference but no generation logic | Our `obsidian-base-create` generates `.base` files; kepano's is the syntax reference it uses |
| **json-canvas** | High quality reference but no generation logic | Our `obsidian-canvas-create` generates canvases; kepano's is the spec reference it uses |

**Strategy:** Don't copy or rewrite kepano's reference skills. They're excellent at what they do. Instead, build behavioral skills that **use** his reference knowledge as a foundation. Users install both: kepano for the "what," us for the "how."

### From awesome-openclaw ecosystem

| Ecosystem Pattern | Our Opportunity |
|------------------|----------------|
| **planning-with-files** (3-file pattern) | Integrate into `battle-plan` skill with Obsidian vault backing |
| **Memory systems** (11 listed) | `obsidian-session-sync` treats the vault as persistent memory |
| **skillshare** (cross-tool sync) | Future: make our skills portable to 45+ tools |
| **skill-audit** (quality validation) | Integrate with our `skill-creator` and `agent-audit` |

---

## Implementation Order

```
Phase 1 (Foundation):
  1. obsidian-vault-init     — Cold start problem. Get a vault ready for Claude Code.
  2. obsidian-note-create    — Core CRUD. Every other skill depends on note creation.
  3. obsidian-daily-driver   — Daily workflow. Immediate daily value.

Phase 2 (Power):
  4. obsidian-vault-search   — Find things in your vault.
  5. obsidian-canvas-create  — Visual thinking / spatial organization.
  6. obsidian-base-create    — Structured views / dashboards.

Phase 3 (Elixirs):
  7. obsidian-session-sync   — End-of-session ritual.
  8. obsidian-research-flow  — Research pipeline.
```

Each skill will follow the Claude-Skill-Potions conventions:
- YAML frontmatter (`name`, `description`, `allowed-tools`)
- `<purpose>` section
- `## Instructions` with numbered steps
- `## NEVER` / `## ALWAYS` guardrails
- `## Examples` with concrete input/output
- Scripts in `scripts/` subdirectory where needed
- Under 500 lines per SKILL.md

---

## WSL-Specific Notes (for your setup)

Since you're running Obsidian on Windows with Claude Code in WSL:

1. **Vault path**: Your Windows Obsidian vault is accessible from WSL at `/mnt/c/Users/<you>/path/to/vault`
2. **Yakitrak CLI**: Install in WSL. It operates on files directly — no cross-boundary issues
3. **Official Obsidian CLI**: Won't work from WSL until the WSL PR lands (it needs to talk to the running Obsidian process on Windows)
4. **File watching**: Obsidian on Windows will auto-detect file changes made by Claude Code in WSL (as long as the vault is on the Windows filesystem, not in WSL's ext4)
5. **Skills should detect the environment** and adapt: if vault path starts with `/mnt/`, we're in WSL → use Yakitrak or direct file ops

---

## Summary

**Don't steal kepano's skills. Complement them.**

kepano built the reference library (syntax, specs, commands). We build the behavioral layer (workflows, guardrails, orchestration). Users install both. The result is better than either alone.

The `obsidian-*` namespace within Claude-Skill-Potions keeps everything organized without fragmenting the ecosystem. The existing `granola-sync` skill already established the pattern.

8 new skills across 3 phases. Phase 1 solves the cold-start and daily-use problems. Phase 2 adds power features. Phase 3 chains everything into end-to-end workflows.
