#!/usr/bin/env python3
"""
Simple line-based chunker for CSV / text data.
Adjust to token-based splitting if you have a tokenizer available.
"""
import sys
import os
from typing import List

MAX_LINES_PER_CHUNK = 2000

def chunk_lines(path: str, max_lines: int = MAX_LINES_PER_CHUNK) -> List[str]:
    chunks = []
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        current = []
        for i, line in enumerate(f, 1):
            current.append(line)
            if i % max_lines == 0:
                chunks.append("".join(current))
                current = []
        if current:
            chunks.append("".join(current))
    return chunks

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: chunker.py <path> [max_lines]")
        sys.exit(2)
    path = sys.argv[1]
    max_lines = int(sys.argv[2]) if len(sys.argv) > 2 else MAX_LINES_PER_CHUNK
    chunks = chunk_lines(path, max_lines)
    for idx, c in enumerate(chunks, 1):
        out = f"{{os.path.basename(path)}}.chunk{{idx}}.txt"
        with open(out, "w", encoding="utf-8") as f:
            f.write(c)
        print(out)
