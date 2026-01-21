# Contributing to Claude Skill Potions

Thanks for your interest in contributing!

## Adding a New Skill

1. **Copy the template**
   ```bash
   cp -r skills/_template skills/your-skill-name
   ```

2. **Edit SKILL.md** following the [writing guide](docs/writing-skills.md)
   - Use kebab-case for the skill name
   - Write a trigger-based description: "When [condition], [actions]"
   - Include NEVER/ALWAYS behavioral overrides
   - Add concrete examples

3. **Add scripts** to `skills/your-skill-name/scripts/`
   - Keep scripts focused and single-purpose
   - Use Python 3.8+ compatible syntax
   - No external dependencies (stdlib only)

4. **Test your skill**
   - Copy SKILL.md to your CLAUDE.md
   - Verify the trigger activates correctly
   - Check that scripts execute without errors

5. **Submit a PR**
   - One skill per PR
   - Include a brief description of what the skill does
   - Mention any testing you've done

## Improving Existing Skills

- Bug fixes welcome
- Keep changes minimal and focused
- Don't change the skill's core behavior without discussion

## Style Guidelines

- No emojis in SKILL.md files
- Use clear, imperative language
- Keep SKILL.md under 5000 tokens
- Scripts should output clean, parseable results

## Questions?

Open an issue if something's unclear.
