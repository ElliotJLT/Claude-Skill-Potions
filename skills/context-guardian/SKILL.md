---
name: context-guardian
title: Context Guardian
version: 0.1.0
description: >
  When a user uploads a data or large file (CSV, JSON, XLSX, or any file >100KB),
  estimate token cost, generate a compact summary and safe preview, chunk the file
  for downstream processing, and only load the smallest useful subset into context.
  Do not ask the user what to do unless genuinely ambiguous — take the safe default:
  summarize, chunk, and return the preview + suggested next actions.
triggers:
  - event: file.upload
    matches: [".csv", ".json", ".xlsx", ".xls", ".txt", ".log"]
    size_greater_than: 100KB
instructions:
  - Run `scripts/estimate_size.py` to estimate token count and memory cost.
  - If estimated tokens > 30k:
      - Run `scripts/chunker.py` to split into chunks that fit a 4k token window.
      - Run `scripts/summarize.py` on each chunk to produce a 2–4 sentence summary.
      - Return:
          - overall summary (1–3 paragraphs)
          - per-chunk short summaries (bulleted)
          - an explicit "safe_preview" containing the first N rows/lines
  - If on the smaller side, run `scripts/quick_inspect.py` to produce:
      - column types, missing values, basic stats
resources:
  - scripts/estimate_size.py
  - scripts/chunker.py
  - scripts/summarize.py
  - scripts/quick_inspect.py
metadata:
  author: ElliotJLT
  license: MIT
  maintainers:
    - elliotjlt
outputs:
  - type: json
    description: >
      {
        "overall_summary": "...",
        "chunks": [
          {"id": 1, "summary": "...", "tokens": 1024},
          ...
        ],
        "safe_preview": "...",
        "recommendation": "process automatically / ask for confirmation"
      }
---
