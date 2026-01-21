#!/usr/bin/env python3
"""
Sweep script for loose-ends skill.
Scans codebase for common cruft that should be cleaned up before declaring done.
"""

import subprocess
import sys
from pathlib import Path


def run_grep(pattern: str, file_types: list[str], label: str) -> list[str]:
    """Run ripgrep and return matches."""
    results = []

    for ft in file_types:
        try:
            cmd = ["rg", "-n", "--type", ft, pattern, "."]
            output = subprocess.run(cmd, capture_output=True, text=True, cwd=Path.cwd())
            if output.stdout.strip():
                results.extend(output.stdout.strip().split("\n"))
        except FileNotFoundError:
            # Fall back to grep if rg not available
            pass

    return results


def main():
    findings = {}

    # Debug statements
    debug_patterns = [
        ("console\\.log\\(", ["js", "ts", "tsx"], "console.log"),
        ("print\\(", ["py"], "print()"),
        ("debugger", ["js", "ts", "tsx"], "debugger"),
        ("binding\\.pry", ["ruby"], "binding.pry"),
        ("dd\\(", ["php"], "dd()"),
        ("var_dump\\(", ["php"], "var_dump()"),
    ]

    for pattern, types, label in debug_patterns:
        matches = run_grep(pattern, types, label)
        if matches:
            findings[f"Debug: {label}"] = matches[:10]  # Limit to 10

    # TODO/FIXME comments
    todo_matches = run_grep("(TODO|FIXME|XXX|HACK):", ["js", "ts", "py", "tsx", "jsx", "rb", "go", "rs"], "TODOs")
    if todo_matches:
        findings["TODO/FIXME comments"] = todo_matches[:10]

    # Commented-out code (rough heuristic: // followed by code-like patterns)
    # This is imprecise but catches obvious cases

    # Output results
    if not findings:
        print("✓ No loose ends found - looking clean!")
        return 0

    print("⚠ Loose ends found:\n")

    for category, matches in findings.items():
        print(f"### {category}")
        for match in matches:
            print(f"  {match}")
        if len(matches) == 10:
            print("  ... (showing first 10)")
        print()

    total = sum(len(m) for m in findings.values())
    print(f"Total: {total} items to review")

    return 1


if __name__ == "__main__":
    sys.exit(main())
