#!/usr/bin/env python3
"""
Estimate Claude Code task completion time based on scope analysis.

Usage:
    python estimate_task.py --task "Add user authentication" --path ./src
    python estimate_task.py --task "Fix login bug" --path . --files "auth.py,login.py"
"""

import argparse
import os
import re
import sys
from pathlib import Path
from dataclasses import dataclass
from typing import Optional

# Claude Code performance baselines (measured values)
BASELINES = {
    'ttft_seconds': 2,
    'tokens_per_second': 65,  # Average of 50-80
    'tool_call_seconds': 3.5,  # Average of 2-5
    'file_read_seconds': 4,
    'file_write_seconds': 7,
    'test_run_seconds': 20,
    'git_op_seconds': 5,
}

# Task category baselines (in minutes)
TASK_CATEGORIES = {
    'trivial': {'base_minutes': 4, 'iterations': (1, 3)},
    'simple': {'base_minutes': 7, 'iterations': (3, 8)},
    'medium': {'base_minutes': 15, 'iterations': (8, 20)},
    'complex': {'base_minutes': 35, 'iterations': (20, 50)},
    'major': {'base_minutes': 75, 'iterations': (50, 150)},
}

# Keywords that indicate complexity
COMPLEXITY_KEYWORDS = {
    'trivial': ['typo', 'rename', 'config', 'constant', 'string', 'import'],
    'simple': ['fix', 'bug', 'update', 'add test', 'validate', 'single'],
    'medium': ['feature', 'endpoint', 'refactor', 'module', 'migration'],
    'complex': ['authentication', 'auth', 'security', 'architectural', 'cross-cutting', 'full stack'],
    'major': ['migrate', 'rewrite', 'framework', 'upgrade', 'graphql', 'overhaul', 'everything'],
}

# Warning keywords that add buffer
WARNING_KEYWORDS = {
    'vague': ['make it work', 'just fix', 'somehow', 'whatever'],
    'scope_creep': ['everything', 'all', 'entire', 'whole codebase'],
    'external': ['api', 'integration', 'third-party', 'external'],
    'risky': ['production', 'database', 'migration', 'security', 'auth'],
}


@dataclass
class ScopeAnalysis:
    total_files: int
    total_lines: int
    test_files: int
    complexity_markers: int  # TODO, FIXME, HACK count
    languages: list
    largest_file_lines: int


@dataclass
class TaskEstimate:
    category: str
    base_minutes: float
    scope_adjustment: float
    warning_buffer: float
    low_estimate: float
    high_estimate: float
    iterations_low: int
    iterations_high: int
    warnings: list
    breakdown: dict


def analyse_scope(path: str, extensions: list = None) -> ScopeAnalysis:
    """Analyse codebase scope for estimation."""
    if extensions is None:
        extensions = ['.py', '.js', '.ts', '.tsx', '.jsx', '.go', '.rs', '.rb', '.java']

    path = Path(path)
    if not path.exists():
        return ScopeAnalysis(0, 0, 0, 0, [], 0)

    total_files = 0
    total_lines = 0
    test_files = 0
    complexity_markers = 0
    languages = set()
    largest_file_lines = 0

    skip_dirs = {'node_modules', 'venv', '.venv', '__pycache__', '.git', 'dist', 'build'}

    for ext in extensions:
        for file_path in path.rglob(f'*{ext}'):
            # Skip excluded directories
            if any(skip in file_path.parts for skip in skip_dirs):
                continue

            try:
                content = file_path.read_text(encoding='utf-8', errors='ignore')
                lines = content.count('\n') + 1

                total_files += 1
                total_lines += lines
                languages.add(ext)

                if lines > largest_file_lines:
                    largest_file_lines = lines

                # Check for test files
                name = file_path.name.lower()
                if 'test' in name or 'spec' in name:
                    test_files += 1

                # Count complexity markers
                complexity_markers += len(re.findall(r'\b(TODO|FIXME|HACK|XXX)\b', content))

            except Exception:
                continue

    return ScopeAnalysis(
        total_files=total_files,
        total_lines=total_lines,
        test_files=test_files,
        complexity_markers=complexity_markers,
        languages=list(languages),
        largest_file_lines=largest_file_lines
    )


def categorise_task(task_description: str) -> str:
    """Categorise task based on description keywords."""
    task_lower = task_description.lower()

    # Check from most complex to least
    for category in ['major', 'complex', 'medium', 'simple', 'trivial']:
        keywords = COMPLEXITY_KEYWORDS[category]
        if any(kw in task_lower for kw in keywords):
            return category

    # Default to medium if unclear
    return 'medium'


def identify_warnings(task_description: str, scope: ScopeAnalysis) -> list:
    """Identify risk factors that warrant time buffer."""
    warnings = []
    task_lower = task_description.lower()

    for warning_type, keywords in WARNING_KEYWORDS.items():
        if any(kw in task_lower for kw in keywords):
            warnings.append(warning_type)

    # Scope-based warnings
    if scope.total_files > 50:
        warnings.append('large_codebase')
    if scope.test_files == 0 and scope.total_files > 5:
        warnings.append('no_tests')
    if scope.complexity_markers > 20:
        warnings.append('tech_debt')
    if scope.largest_file_lines > 500:
        warnings.append('large_files')

    return warnings


def estimate_task(
    task_description: str,
    scope: ScopeAnalysis,
    files_in_scope: Optional[int] = None
) -> TaskEstimate:
    """Calculate time estimate for a task."""

    category = categorise_task(task_description)
    category_data = TASK_CATEGORIES[category]

    base_minutes = category_data['base_minutes']
    iter_low, iter_high = category_data['iterations']

    # Adjust for scope
    if files_in_scope is None:
        # Estimate files in scope based on category
        files_in_scope = {
            'trivial': 1,
            'simple': 2,
            'medium': 5,
            'complex': 12,
            'major': 25,
        }.get(category, 5)

    # Scope adjustment: each file adds overhead
    scope_adjustment = files_in_scope * 0.5

    # Test overhead
    if 'test' in task_description.lower():
        scope_adjustment += files_in_scope * 1.0

    # Warning buffer
    warnings = identify_warnings(task_description, scope)
    warning_buffer = 0

    if 'vague' in warnings or 'scope_creep' in warnings:
        warning_buffer = base_minutes * 1.0  # +100%
    elif len(warnings) > 2:
        warning_buffer = base_minutes * 0.5  # +50%
    elif len(warnings) > 0:
        warning_buffer = base_minutes * 0.25  # +25%

    # Calculate final estimate
    total = base_minutes + scope_adjustment + warning_buffer

    low_estimate = round(total * 0.7, 1)
    high_estimate = round(total * 1.5, 1)

    # Breakdown
    breakdown = {
        'analysis': round(base_minutes * 0.2, 1),
        'implementation': round(base_minutes * 0.5 + scope_adjustment * 0.7, 1),
        'testing': round(base_minutes * 0.2 + scope_adjustment * 0.3, 1),
        'verification': round(base_minutes * 0.1, 1),
    }

    return TaskEstimate(
        category=category,
        base_minutes=base_minutes,
        scope_adjustment=round(scope_adjustment, 1),
        warning_buffer=round(warning_buffer, 1),
        low_estimate=low_estimate,
        high_estimate=high_estimate,
        iterations_low=iter_low,
        iterations_high=iter_high,
        warnings=warnings,
        breakdown=breakdown
    )


def format_output(task: str, scope: ScopeAnalysis, estimate: TaskEstimate) -> str:
    """Format estimate for display."""
    lines = []

    lines.append("Task Estimate")
    lines.append("")
    lines.append(f"Task: {task}")
    lines.append(f"Category: {estimate.category.title()}")
    lines.append("")

    lines.append("Scope Analysis:")
    lines.append(f"  Files in codebase: {scope.total_files}")
    lines.append(f"  Total lines: {scope.total_lines:,}")
    lines.append(f"  Test files: {scope.test_files}")
    if scope.complexity_markers > 0:
        lines.append(f"  Tech debt markers: {scope.complexity_markers}")
    lines.append("")

    lines.append(f"Expected iterations: {estimate.iterations_low}-{estimate.iterations_high}")
    lines.append("")

    # Main estimate
    if estimate.high_estimate < 60:
        lines.append(f"Estimated time: {estimate.low_estimate:.0f}-{estimate.high_estimate:.0f} minutes")
    else:
        low_hrs = estimate.low_estimate / 60
        high_hrs = estimate.high_estimate / 60
        lines.append(f"Estimated time: {low_hrs:.1f}-{high_hrs:.1f} hours")

    lines.append("")
    lines.append("Breakdown:")
    for phase, minutes in estimate.breakdown.items():
        lines.append(f"  {phase.title()}: ~{minutes:.0f} min")

    if estimate.warnings:
        lines.append("")
        lines.append("Risk factors (buffer added):")
        warning_labels = {
            'vague': 'Vague requirements',
            'scope_creep': 'Scope creep risk',
            'external': 'External dependencies',
            'risky': 'High-risk changes',
            'large_codebase': 'Large codebase',
            'no_tests': 'No existing tests',
            'tech_debt': 'Technical debt present',
            'large_files': 'Large files detected',
        }
        for w in estimate.warnings:
            lines.append(f"  - {warning_labels.get(w, w)}")

    lines.append("")

    # Recommendations for long tasks
    if estimate.high_estimate > 30:
        lines.append("Recommendation: Break into phases with commits between each.")
        lines.append("   I'll checkpoint every 15 minutes.")
    elif estimate.high_estimate > 15:
        lines.append("I'll checkpoint at the halfway point.")

    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description='Estimate Claude Code task completion time')
    parser.add_argument('--task', required=True, help='Task description')
    parser.add_argument('--path', default='.', help='Codebase path to analyse')
    parser.add_argument('--files', type=int, help='Override: number of files in scope')
    parser.add_argument('--json', action='store_true', help='Output as JSON')

    args = parser.parse_args()

    # Analyse scope
    scope = analyse_scope(args.path)

    # Generate estimate
    estimate = estimate_task(
        task_description=args.task,
        scope=scope,
        files_in_scope=args.files
    )

    if args.json:
        import json
        output = {
            'task': args.task,
            'category': estimate.category,
            'estimate_minutes': {
                'low': estimate.low_estimate,
                'high': estimate.high_estimate,
            },
            'iterations': {
                'low': estimate.iterations_low,
                'high': estimate.iterations_high,
            },
            'breakdown': estimate.breakdown,
            'warnings': estimate.warnings,
            'scope': {
                'total_files': scope.total_files,
                'total_lines': scope.total_lines,
                'test_files': scope.test_files,
            }
        }
        print(json.dumps(output, indent=2))
    else:
        print(format_output(args.task, scope, estimate))


if __name__ == '__main__':
    main()
