#!/usr/bin/env python3
"""
Analyse codebase for risk factors before starting a task.

Usage:
    python analyse_risk.py --task "Add payment integration" --path ./src
"""

import argparse
import os
import re
from pathlib import Path
from dataclasses import dataclass
from typing import List, Dict

# Risk indicators in code
RISK_PATTERNS = {
    'database': [r'\.execute\(', r'migration', r'schema', r'ALTER TABLE', r'DROP', r'DELETE FROM'],
    'auth': [r'password', r'token', r'secret', r'api_key', r'credential', r'auth'],
    'payment': [r'stripe', r'payment', r'charge', r'invoice', r'billing', r'price'],
    'external_api': [r'requests\.(get|post|put)', r'fetch\(', r'axios', r'http\.', r'webhook'],
    'file_ops': [r'open\(.*["\']w', r'\.write\(', r'shutil', r'os\.remove', r'unlink'],
    'env_config': [r'\.env', r'environ', r'getenv', r'config\[', r'settings\.'],
}

# Keywords that suggest high-risk tasks
HIGH_RISK_KEYWORDS = [
    'migration', 'payment', 'auth', 'security', 'delete', 'production',
    'database', 'schema', 'refactor', 'upgrade', 'integration', 'api'
]

MEDIUM_RISK_KEYWORDS = [
    'feature', 'endpoint', 'service', 'module', 'component', 'handler'
]


@dataclass
class RiskFinding:
    category: str
    file_path: str
    line_number: int
    pattern_matched: str
    severity: str


def scan_file(path: Path, patterns: Dict[str, List[str]]) -> List[RiskFinding]:
    """Scan a single file for risk patterns."""
    findings = []
    try:
        content = path.read_text(encoding='utf-8', errors='ignore')
        lines = content.split('\n')

        for category, pattern_list in patterns.items():
            for pattern in pattern_list:
                for i, line in enumerate(lines, 1):
                    if re.search(pattern, line, re.IGNORECASE):
                        findings.append(RiskFinding(
                            category=category,
                            file_path=str(path),
                            line_number=i,
                            pattern_matched=pattern,
                            severity='HIGH' if category in ['database', 'auth', 'payment'] else 'MEDIUM'
                        ))
    except Exception:
        pass
    return findings


def analyse_task_risk(task: str) -> Dict[str, str]:
    """Analyse task description for risk keywords."""
    task_lower = task.lower()
    risks = {}

    for keyword in HIGH_RISK_KEYWORDS:
        if keyword in task_lower:
            risks[keyword] = 'HIGH'

    for keyword in MEDIUM_RISK_KEYWORDS:
        if keyword in task_lower and keyword not in risks:
            risks[keyword] = 'MEDIUM'

    return risks


def scan_codebase(path: str, extensions: List[str] = None) -> List[RiskFinding]:
    """Scan codebase for risk patterns."""
    if extensions is None:
        extensions = ['.py', '.js', '.ts', '.tsx', '.jsx', '.go', '.rb', '.java']

    root = Path(path)
    if not root.exists():
        return []

    findings = []
    skip_dirs = {'node_modules', 'venv', '.venv', '__pycache__', '.git', 'dist', 'build'}

    for ext in extensions:
        for file_path in root.rglob(f'*{ext}'):
            if any(skip in file_path.parts for skip in skip_dirs):
                continue
            findings.extend(scan_file(file_path, RISK_PATTERNS))

    return findings


def format_output(task: str, task_risks: Dict, code_findings: List[RiskFinding]) -> str:
    """Format analysis output."""
    lines = []
    lines.append(f"Risk Analysis: {task}")
    lines.append("")

    if task_risks:
        lines.append("Task Risk Indicators:")
        for keyword, severity in sorted(task_risks.items(), key=lambda x: x[1]):
            lines.append(f"  [{severity}] {keyword}")
        lines.append("")

    if code_findings:
        lines.append("Codebase Risk Areas:")
        by_category = {}
        for f in code_findings:
            if f.category not in by_category:
                by_category[f.category] = []
            by_category[f.category].append(f)

        for category, findings in sorted(by_category.items()):
            severity = findings[0].severity
            lines.append(f"  [{severity}] {category}: {len(findings)} occurrences")
            # Show first 3 files
            seen_files = set()
            for f in findings[:5]:
                if f.file_path not in seen_files:
                    lines.append(f"    - {f.file_path}:{f.line_number}")
                    seen_files.add(f.file_path)
        lines.append("")

    if not task_risks and not code_findings:
        lines.append("No obvious risk indicators found.")
        lines.append("Consider manual review for edge cases.")

    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description='Analyse codebase for risk factors')
    parser.add_argument('--task', required=True, help='Task description')
    parser.add_argument('--path', default='.', help='Codebase path to analyse')

    args = parser.parse_args()

    task_risks = analyse_task_risk(args.task)
    code_findings = scan_codebase(args.path)

    print(format_output(args.task, task_risks, code_findings))


if __name__ == '__main__':
    main()
