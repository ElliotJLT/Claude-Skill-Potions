#!/usr/bin/env python3
"""
Estimate token cost for a file using conservative heuristics.
This is heuristic-only; adapt to your tokenizer/LLM.
"""
import os
import sys
from typing import Tuple

AVERAGE_CHARS_PER_TOKEN = 4  # conservative heuristic

def estimate_tokens_for_file(path: str) -> Tuple[int, int]:
    """Return (bytes, estimated_tokens)."""
    size_bytes = os.path.getsize(path)
    # read small sample to estimate char distribution for text files
    est_chars = size_bytes
    est_tokens = max(1, int(est_chars / AVERAGE_CHARS_PER_TOKEN))
    return size_bytes, est_tokens

def human_bytes(n: int) -> str:
    for unit in ['B','KB','MB','GB']:
        if n < 1024:
            return f"{n:.1f}{unit}"
        n /= 1024
    return f"{n:.1f}TB"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: estimate_size.py <path>")
        sys.exit(2)
    path = sys.argv[1]
    bytes_, tokens = estimate_tokens_for_file(path)
    print(f"bytes={{bytes_}} ({{human_bytes(bytes_)}}) tokens={{tokens}}")
