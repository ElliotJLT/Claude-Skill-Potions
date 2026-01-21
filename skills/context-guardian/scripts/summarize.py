#!/usr/bin/env python3
"""
Very small local summariser used as a placeholder.
In production, call the configured LLM or a concise heuristic.
"""
import sys
import os
import csv
from typing import List

def summarize_text(text: str, max_sentences: int = 3) -> str:
    # naive: return first N non-empty lines as a 'summary'
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    return " ".join(lines[:max_sentences])

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: summarize.py <chunk_file>")
        sys.exit(2)
    path = sys.argv[1]
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        text = f.read()
    print(summarize_text(text, max_sentences=3))
