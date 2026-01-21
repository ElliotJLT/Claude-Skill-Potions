---
name: ship-it
description: |
  When a task reaches a reasonable completion state, explicitly declare it shippable
  and distinguish between blockers vs polish. Prevent perfectionism loops where
  Claude keeps refining indefinitely. Surface: "This is shippable. Remaining items
  are improvements, not blockers. Ship or iterate?" Help users make the call.
allowed-tools: |
  bash: git, npm, python, cat, ls
  file: read
---

# Ship It

<purpose>
Perfectionism kills momentum. Claude will happily refine forever if not stopped.
Users lose hours polishing things that were good enough an hour ago. This skill
draws a clear line: "This works. Everything else is gravy. Make the call."
</purpose>

## When To Activate

Trigger when:

- Feature implementation is functionally complete
- Tests pass
- User keeps asking for "one more thing" beyond initial scope
- You catch yourself suggesting optimisations unprompted
- Third iteration on the same component
- User hasn't explicitly defined "done"

## Instructions

### Step 1: Recognise Completion

A task is shippable when:

- Core functionality works as specified
- No known breaking bugs
- Tests pass (if tests exist)
- Handles obvious error cases
- Meets the original request (not expanded scope)

A task is NOT shippable when:

- Core functionality broken
- Tests failing
- Security vulnerabilities present
- Will crash in normal use
- Doesn't address original request

### Step 2: Declare Shippable State

When you hit shippable:

```
Ship It?

This is shippable. Core functionality complete:
- [What works]
- [What works]
- [What works]

Tests: [X passing / Y total]

Remaining items (nice-to-have, not blockers):
- [ ] [Polish item 1]
- [ ] [Polish item 2]
- [ ] [Optimisation idea]

None of these block shipping. They're improvements.

What do you want to do?
-> Ship it as-is
-> Quick polish (pick 1-2 items, 10 min max)
-> Full polish (all items, ~30 min)
```

### Step 3: Distinguish Blockers vs Polish

<blockers>
**Blockers** (must fix before shipping):
- Feature doesn't do what was asked
- Crashes on normal input
- Security holes
- Data loss possible
- Tests failing
- Breaks existing functionality
</blockers>

<polish>
**Polish** (can ship without):
- Code could be cleaner
- Edge cases not covered (rare ones)
- Performance not optimal (but acceptable)
- No documentation
- Error messages could be friendlier
- UI could be prettier
- Missing nice-to-have features
- Tech debt
</polish>

### Step 4: Scope Check

If user keeps adding requests, call it out:

```
Scope check

Original request: "Add user login"

We've completed:
- Login form
- Authentication
- Session handling
- Error messages

You're now asking about:
- Password reset (new feature)
- Social login (new feature)
- Remember me (enhancement)

The original request is shippable. Want to:
A) Ship login, then start password reset as new task
B) Expand scope (but let's define the new "done")
```

### Step 5: Break Perfectionism Loops

Signs of a perfectionism loop:

- Third refactor of same code
- "Let me just improve..." unprompted
- User says "make it better" without specifics
- Discussing hypothetical edge cases
- Bikeshedding on names/structure

When you spot it:

```
Pause - are we polishing or shipping?

We've iterated on [component] 3 times now. Current state:
- [It works]
- [Code is clean enough]
- [Tests pass]

Honest assessment: Further changes are preference, not improvement.

Ship it?
```

## Definition of Done

If user hasn't defined done, ask early:

```
Before I start: what does "done" look like for you?

Minimum viable:
- [ ] [Core thing 1]
- [ ] [Core thing 2]

Nice to have:
- [ ] [Enhancement 1]
- [ ] [Enhancement 2]

This helps me know when to stop vs when to keep going.
```

## NEVER

- Keep refining without asking if it's shippable
- Add scope without calling it out
- Suggest optimisations when core functionality isn't done
- Let polish items block declaration of "shippable"
- Chase hypothetical edge cases before shipping basics

## ALWAYS

- Declare when something is shippable
- Separate blockers from polish clearly
- Call out scope creep
- Give user the choice: ship or iterate
- Respect their time by drawing the line

## Examples

### Example 1: Feature Complete

```
Ship It?

User authentication is shippable:
- Login/logout working
- Password hashing with bcrypt
- Session management
- Protected routes
- 8 tests passing

Remaining items (polish, not blockers):
- [ ] "Forgot password" flow (new feature, not in original ask)
- [ ] Rate limiting (good idea, can add later)
- [ ] Login attempt logging (nice for debugging)

Original request complete. What do you want to do?
-> Ship it
-> Add forgot password (~20 min)
-> Add rate limiting (~10 min)
```

### Example 2: Scope Creep

```
Scope check

We started with: "Build a todo list"

Completed:
- Add/remove todos
- Mark complete
- Persist to localStorage

Now discussing:
- Categories and tags
- Due dates with reminders
- Sharing with other users
- Mobile app

The todo list works. These are new products, not polish.

Ship the todo list, then decide what's next?
```

### Example 3: Perfectionism Loop

```
Pause - we've been here before.

This is the 3rd time we're restructuring the API handlers.
Each version worked. Current code:
- Handles all endpoints
- Error handling in place
- Tests passing

We're now debating folder structure. This is preference, not progress.

Ship it. Refactor later if it actually causes problems.
```

### Example 4: Declaring Done Early

User: "Build me a blog"

```
Before I start: what does "done" look like?

Minimum viable blog:
- [ ] Create/edit posts
- [ ] Display posts
- [ ] Basic styling

Or full-featured:
- [ ] Above, plus...
- [ ] Comments
- [ ] Categories
- [ ] RSS feed
- [ ] Admin panel

Which are we building? This helps me know where to stop.
```

### Example 5: Honest Assessment

User: "Can you make the code better?"

```
Honest assessment of current code:

Working: Yes
Readable: Yes, clear naming and structure
Tested: 12 tests passing
Performance: Fine for expected load

Could improve:
- Extract 2 functions that are slightly long
- Add JSDoc comments
- Variable naming in one spot

These are real but minor. The code is shippable.

Worth 15 min of polish, or ship and move on?
```
