#!/usr/bin/env python3
"""
Quick inspection for small data files.
Returns basic stats: file type, row/line count, column info for structured data.
"""
import sys
import os
import json
from typing import Dict, Any

def inspect_csv(path: str) -> Dict[str, Any]:
    """Inspect CSV file and return basic stats."""
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        lines = f.readlines()
    if not lines:
        return {"type": "csv", "rows": 0, "columns": [], "empty": True}
    header = lines[0].strip().split(",")
    return {
        "type": "csv",
        "rows": len(lines) - 1,
        "columns": len(header),
        "column_names": header[:20],  # first 20 columns
        "preview_rows": [l.strip()[:200] for l in lines[1:6]],  # first 5 data rows
    }

def inspect_json(path: str) -> Dict[str, Any]:
    """Inspect JSON file and return structure info."""
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        data = json.load(f)
    result = {"type": "json"}
    if isinstance(data, list):
        result["structure"] = "array"
        result["items"] = len(data)
        if data and isinstance(data[0], dict):
            result["keys"] = list(data[0].keys())[:20]
    elif isinstance(data, dict):
        result["structure"] = "object"
        result["keys"] = list(data.keys())[:20]
    return result

def inspect_text(path: str) -> Dict[str, Any]:
    """Inspect plain text/log file."""
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        lines = f.readlines()
    return {
        "type": "text",
        "lines": len(lines),
        "preview": [l.strip()[:200] for l in lines[:10]],
    }

def quick_inspect(path: str) -> Dict[str, Any]:
    """Auto-detect file type and run appropriate inspection."""
    ext = os.path.splitext(path)[1].lower()
    size_bytes = os.path.getsize(path)
    result = {"path": path, "size_bytes": size_bytes}
    try:
        if ext == ".csv":
            result.update(inspect_csv(path))
        elif ext == ".json":
            result.update(inspect_json(path))
        else:
            result.update(inspect_text(path))
    except Exception as e:
        result["error"] = str(e)
    return result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: quick_inspect.py <path>")
        sys.exit(2)
    path = sys.argv[1]
    result = quick_inspect(path)
    print(json.dumps(result, indent=2))
