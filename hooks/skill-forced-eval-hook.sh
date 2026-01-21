#!/bin/bash
# skill-forced-eval-hook.sh
#
# Forces Claude to explicitly evaluate each installed skill before proceeding.
# Research shows this increases skill activation from ~20% to ~84%.
#
# Based on testing by spences10 (github.com/spences10/svelte-claude-skills)
# - Simple instruction hook: 20% activation
# - Forced evaluation hook: 84% activation
#
# The key insight: creating a "commitment mechanism" where Claude must
# explicitly state YES/NO for each skill before implementing.

cat << 'EOF'
SKILL ACTIVATION PROTOCOL - MANDATORY

Before implementing ANY request, you MUST complete these steps IN ORDER:

Step 1 - EVALUATE: For each available skill, explicitly state:
  - Skill name
  - YES or NO (does this prompt need this skill?)
  - One-sentence reason

Step 2 - ACTIVATE: For every skill you marked YES, use the Skill() tool NOW.
  - Do not skip this step
  - Do not proceed to implementation without activation

Step 3 - IMPLEMENT: Only after activation, proceed with the task.

CRITICAL: The evaluation in Step 1 is WORTHLESS unless you ACTIVATE in Step 2.
Do not just list skills and then ignore them. Activation is MANDATORY.

Format your evaluation as:
```
SKILL EVALUATION:
- skill-name-1: YES - [reason]
- skill-name-2: NO - [reason]
...
ACTIVATING: skill-name-1
```
EOF
