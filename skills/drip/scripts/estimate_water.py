#!/usr/bin/env python3
"""
Estimate water consumption for LLM token usage.

Based on:
- UC Riverside/Colorado 2023 study
- "How Hungry is AI?" 2025 benchmark
- Google/OpenAI self-reported figures 2024-2025

Usage:
    python estimate_water.py --tokens 50000
    python estimate_water.py --words 10000
"""

import argparse

# Mid-range estimate including indirect water (electricity generation)
# Conservative: excludes hardware manufacturing, lifecycle analysis
ML_PER_1000_TOKENS = 0.5

# Comparison points (in ml)
COMPARISONS = [
    (0.05, "1 drop"),
    (0.5, "10 drops"),
    (5, "1 teaspoon"),
    (15, "1 tablespoon"),
    (30, "1 fluid ounce"),
    (50, "small espresso cup"),
    (140, "brewing 1 cup of coffee"),
    (250, "1 cup"),
    (500, "small bottle of water"),
    (1000, "1 liter"),
    (65000, "5-minute shower"),
]


def tokens_to_ml(tokens: int) -> float:
    """Convert token count to estimated water in ml."""
    return (tokens / 1000) * ML_PER_1000_TOKENS


def words_to_tokens(words: int) -> int:
    """Rough conversion: 1 word ≈ 1.3 tokens for English."""
    return int(words * 1.3)


def get_comparison(ml: float) -> str:
    """Get a relatable comparison for the water amount."""
    for threshold, description in COMPARISONS:
        if ml <= threshold * 1.5:
            return description
    return f"{ml/1000:.1f} liters"


def format_output(tokens: int, ml: float) -> str:
    """Format the output with context."""
    lines = []
    lines.append(f"Tokens: {tokens:,}")
    lines.append(f"Estimated water: {ml:.1f}ml ({get_comparison(ml)})")
    lines.append("")
    lines.append("Comparisons:")
    lines.append(f"  - Google search: ~0.3ml")
    lines.append(f"  - Cup of coffee (brewing): ~140ml")
    lines.append(f"  - 5-minute shower: ~65,000ml")
    lines.append("")
    lines.append("Note: Estimate uses 0.5ml/1000 tokens (mid-range, includes")
    lines.append("indirect water from electricity). Actual varies ±5x by region.")
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(
        description='Estimate water consumption for LLM usage'
    )
    parser.add_argument('--tokens', type=int, help='Number of tokens')
    parser.add_argument('--words', type=int, help='Number of words (converted to tokens)')

    args = parser.parse_args()

    if args.words:
        tokens = words_to_tokens(args.words)
        print(f"({args.words} words ≈ {tokens} tokens)")
        print()
    elif args.tokens:
        tokens = args.tokens
    else:
        print("Usage: estimate_water.py --tokens N or --words N")
        return

    ml = tokens_to_ml(tokens)
    print(format_output(tokens, ml))


if __name__ == '__main__':
    main()
