---
name: youtube-transcript
description: |
  Extracts YouTube video transcripts and saves them as structured markdown files
  with metadata and timestamped content. When a user shares a YouTube URL,
  IMMEDIATELY runs the extraction script, creates a local folder, and saves the
  transcript. Handles both manual and auto-generated captions.
allowed-tools: |
  bash: run transcript extraction script, install yt-dlp
  file: read, write
---

# YouTube Transcript

<purpose>
Extract transcripts from YouTube videos and save them as structured, searchable
markdown files. Used for research, interview prep, company analysis, and building
reference material from video content.
</purpose>

## When To Activate

<triggers>
- User shares a YouTube URL (youtube.com/watch, youtu.be, youtube.com/embed)
- User says "transcript", "youtube transcript", or "pull transcript"
- User asks to research a video or extract content from YouTube
</triggers>

## Instructions

### Step 1: Check yt-dlp

<check_dep>
yt-dlp must exist at `/tmp/yt-dlp` or on PATH.

If missing, install it:
```bash
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos -o /tmp/yt-dlp && chmod +x /tmp/yt-dlp
```
</check_dep>

### Step 2: Extract Transcript

Run the extraction script:
```bash
node <skill-path>/scripts/fetch-transcript.mjs "<youtube-url>"
```

The script outputs JSON with:
- `title`, `channel`, `url`, `duration`, `uploadDate`, `description`
- `segments` — individual timestamped lines
- `paragraphs` — segments merged into ~30-second blocks for readability

### Step 3: Save Output

<output_format>
Create a folder and markdown file:

**Folder:** `transcripts/` in the current working directory (create if needed)
**Filename:** `YYYY-MM-DD-kebab-case-title.md`

```markdown
---
type: transcript
source: youtube
video_id: <id>
channel: <channel>
duration: <duration>
date_published: <upload-date>
date_extracted: <today>
url: <url>
---

# <Title>

**Channel:** <channel>
**Duration:** <duration>
**Published:** <upload-date>
**URL:** <url>

---

## Transcript

[0:00] First paragraph of merged text...

[0:30] Second paragraph continues...
```
</output_format>

### Step 4: Summary

After saving, provide a brief summary:
- Video title and channel
- Duration
- File saved location
- 3-5 bullet point summary of the content (read the transcript to generate this)

## Integration with Boulot Vault

When used inside the Boulot vault for job research:
- Save to `{user}/active/{company}/research/transcripts/` if the video relates to an active application
- Add a link to the transcript in the company's `research.md`
- Tag with relevant company/role context in frontmatter

## NEVER

- Download the video itself — subtitles only
- Fabricate or hallucinate transcript content
- Skip saving to file — always persist the transcript
- Run without checking yt-dlp exists first

## ALWAYS

- Use kebab-case lowercase filenames
- Include full YAML frontmatter
- Use the paragraph-merged format for readability (not raw segments)
- Include timestamps at paragraph boundaries
- Provide a content summary after extraction
