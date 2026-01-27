#!/bin/bash
# context-loader-hook.sh
#
# Automatically suggests relevant skills based on file patterns being accessed.
# Unlike forced-eval (which evaluates ALL skills), this hook is selective:
# it only suggests skills that match the context of the current work.
#
# Works with skill-triggers.yaml to map file patterns to skills.
# Example: Working in src/api/** → suggest pre-mortem, trace-it
#          Touching auth code → suggest threat-model, prove-it
#
# This hook runs on UserPromptSubmit and PreToolUse events.

# Configuration
TRIGGERS_FILE="${TRIGGERS_FILE:-.claude/skill-triggers.yaml}"
SKILLS_DIR="${SKILLS_DIR:-skills}"

# Check if we have a triggers file
if [[ ! -f "$TRIGGERS_FILE" ]]; then
    # No triggers file - silently exit
    exit 0
fi

# Function to check if a command mentions certain paths
check_file_context() {
    local prompt="$1"
    local suggested_skills=""

    # Read triggers and check against prompt
    # Format: pattern: skill1, skill2
    while IFS=': ' read -r pattern skills; do
        # Skip comments and empty lines
        [[ "$pattern" =~ ^#.*$ ]] && continue
        [[ -z "$pattern" ]] && continue

        # Check if pattern appears in prompt
        if echo "$prompt" | grep -qiE "$pattern"; then
            suggested_skills="$suggested_skills $skills"
        fi
    done < "$TRIGGERS_FILE"

    echo "$suggested_skills" | tr ',' '\n' | tr ' ' '\n' | sort -u | grep -v '^$'
}

# Get the prompt from stdin or environment
PROMPT="${CLAUDE_PROMPT:-$(cat)}"

# Find matching skills
MATCHING_SKILLS=$(check_file_context "$PROMPT")

if [[ -n "$MATCHING_SKILLS" ]]; then
    cat << EOF

CONTEXT-AWARE SKILL SUGGESTION

Based on the files/patterns in your request, consider these skills:

EOF

    for skill in $MATCHING_SKILLS; do
        skill=$(echo "$skill" | tr -d ' ')
        [[ -z "$skill" ]] && continue

        # Try to get skill description
        skill_file="$SKILLS_DIR/$skill/SKILL.md"
        if [[ -f "$skill_file" ]]; then
            desc=$(grep -A5 "^description:" "$skill_file" | tail -n+2 | head -5 | sed 's/^  //')
            echo "• $skill"
            echo "  $desc" | head -2
            echo ""
        else
            echo "• $skill"
        fi
    done

    cat << 'EOF'
To activate: Use the Skill() tool with the skill name.
These are suggestions based on file context, not mandatory.

EOF
fi
