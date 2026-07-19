# AI Workflow Rules

## Approach

Development on MemeLaunch follows a strict, spec-driven, incremental approach. Build the codebase component by component, verifying that each piece runs correctly before moving on to the next.

## Scoping Rules

- **One Unit at a Time**: Work on a single, isolated build unit from `progress-tracker.md` at a time. Do not begin writing code for Unit 4 while Unit 3 is still incomplete.
- **Isolated Boundaries**: Keep changes restricted to their system boundaries. When updating database schemas, do not bundle visual styling overrides for buttons in the same session.
- **No Speculative Coding**: Do not implement skeleton functions, pages, or helper functions that "might be needed later." Only build what is explicitly required by the active unit.

## When to Split Work

Split a work task into multiple smaller segments if it combines:
- Database schema changes and client-side page layout implementations.
- Writing Edge Functions and writing React UI components.
- Setting up third-party SDK dependencies (like OAuth) and implementing core platform loops.

## Handling Missing Requirements

- **Do Not Guess**: If a design layout, api input, or database column name is unspecified, do not assume or invent.
- **Check the Files**: Search the other 5 context files for references. If none exist, mark the issue as an active item in `progress-tracker.md` under **Open Questions** and request clarification.

## Protected Files

Do not modify the following files without explicit instructions:
- App structure configuration files (`tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`).
- Generated or default utility files at the project root (`tailwind.config.ts`, `.gitignore`).

## Keeping Docs in Sync

- Whenever a database table structure, SDK utility wrapper, or styling theme changes during implementation, immediately reflect those updates in the corresponding context files (`architecture.md`, `code-standards.md`, `ui-context.md`) before submitting changes.
- Ensure `progress-tracker.md` is updated at the start and completion of every build unit.

## Verification Checklist (Before Moving to Next Unit)

Before a unit is marked as complete, the agent must verify:
1. **Compiles Successfully**: Run `npm run build` to ensure there are no TypeScript, syntax, or bundler errors.
2. **Fulfill Specs**: Check off every condition listed in the active unit's verification criteria.
3. **No Drift**: Ensure no previously working features or styling rules have been modified or degraded.
4. **Update Tracker**: Mark the active unit as completed and update the next item to `In Progress` in `progress-tracker.md`.
