---
description: "Use when writing or modifying Python code. Covers scope control, behavior preservation, reversibility, dependency choices, documentation placement, testing discipline, and file cleanliness."
applyTo: "**/*.py"
---

# Python Coding Instructions

These instructions apply to Python changes in this repository.

## Core Principles

- Keep it simple. Prefer the smallest correct solution over cleverness.
- Do not repeat yourself. Reuse existing helpers, constants, and patterns when they already fit the task.
- Prefer explicit, readable code over dense abstractions.
- Optimize for maintainability first, then convenience.

## Scope Control

- Minimize scope of change.
- Identify the smallest unit that can satisfy the requirement: function, class, or module.
- Do not modify unrelated code.
- Avoid refactors unless they are required for correctness or explicitly requested.
- Do not "clean up" adjacent code as part of an unrelated task.
- If the task can be solved with a local edit, do not widen the change into a structural rewrite.

## Explicit Non-Goals

- Do not reformat code unless required for correctness or to match nearby edits.
- Do not reorder imports, functions, or constants without a functional reason.
- Do not upgrade syntax unless it is already used nearby or explicitly requested.
- Do not modernize code for style alone.
- Do not introduce concurrency, async, or parallelism unless explicitly requested.

## Behavior Preservation

- Preserve existing behavior unless the task explicitly requires a behavior change.
- Assume current callers depend on current interfaces, side effects, and error handling.
- Keep public function names, parameter names, return shapes, and file boundaries stable unless change is necessary.
- When behavior must change, change only the requested behavior and leave surrounding behavior untouched.

## Ambiguity Handling

- Handle ambiguity safely.
- If requirements are unclear, prefer the least destructive interpretation.
- Do not invent hidden product requirements.
- Do not silently widen behavior based on assumptions.
- If there are multiple plausible implementations, prefer the one with the smallest surface area and lowest regression risk.

## Reversibility

- Ensure reversibility.
- Write changes so they are easy to understand, review, and revert.
- Avoid cascading edits across many files when one or two files are sufficient.
- Avoid tightly coupled changes that make rollback difficult.
- Favor isolated helpers and small call-site updates over broad rewrites.

## Change Hygiene

- Make code easy to read in one pass.
- Prefer clear names over short names.
- Keep functions focused on one job.
- Avoid introducing a new layer of abstraction unless duplication or complexity clearly justifies it.
- Add a short comment immediately before functions to describe what the function does.
- Keep these function comments concise and practical; they should orient the reader, not restate every line.
- Add additional inline comments sparingly and only where the intent is not obvious from the code itself.
- Use Python comments, not C-style examples. If a note is needed, use a Python comment like:

```python
# NOTE: This function could be further optimized by caching results.
```

## Out-of-Scope Ideas

- Log, do not implement, unscoped ideas.
- If you identify an improvement outside the requested scope, do not implement it automatically.
- Prefer leaving a brief comment or note near the relevant code only if it helps a future maintainer and does not add noise.
- Keep these notes short, factual, and non-blocking.

## Documentation Placement

- Keep the workspace organized and avoid adding new clutter to the repository root.
- Documentation intended for the application's users should go under `documentation/`.
- Documentation created for repository maintainers, future AI sessions, implementation notes, or internal development guidance should go under `documentation/ai-documentation/`.
- Do not place new documentation files in the repository root unless explicitly requested.
- When adding documentation, choose the narrowest relevant location instead of creating broad top-level files by default.

## Documentation

- Update documentation when behavior, parameters, workflows, or expectations materially change.
- Prefer updating existing documentation over creating parallel explanations.
- Do not add docstrings or prose that merely restate obvious code.
- For routine function-level explanation, prefer the short leading Python comment described in Change Hygiene over verbose docstrings.
- Place new documentation according to the Documentation Placement section.

## Temporary Files

- If temporary files are needed, place them under `temp/` rather than the repository root.
- Avoid scattering scratch files, debug outputs, exported intermediates, or one-off artifacts across the workspace.
- Clean up temporary files when they are no longer needed, unless the task explicitly requires preserving them.

## Existing Patterns

- Follow existing repository patterns before introducing new ones.
- Match the surrounding code style, naming conventions, typing style, and error-handling approach.
- Prefer existing library choices already in the repo over adding new dependencies.
- If a helper already exists nearby, use it instead of duplicating logic.

## Dependencies

- Prefer the standard library when it is sufficient, but do not avoid dependencies purely on principle.
- A new dependency is acceptable if it clearly makes the code simpler, more maintainable, or less error-prone.
- Prefer well-established libraries when they remove cumbersome low-level implementation work.
- If a dependency would materially improve the solution, suggest it before implementation instead of adding it silently.
- Keep the justification narrow and task-specific.
- Avoid dependencies that add framework weight without a meaningful reduction in complexity.

## Python Version Compatibility

- Assume the repository targets the currently configured Python version unless explicitly stated otherwise.
- Do not introduce syntax or standard-library features that are incompatible with the current runtime.
- If a newer Python feature would simplify the solution, call it out before using it.

## Functions and Modules

- Keep modules cohesive and functions small.
- Prefer pure functions when practical.
- Pass data in explicitly rather than relying on hidden global state.
- Avoid side effects during import.
- Avoid mixing parsing, transformation, I/O, and orchestration in the same function when a small separation makes the code clearer.

## Naming and Semantics

- Do not rename symbols for style alone.
- Treat established names as part of the code's contract.
- Preserve semantic meaning even when changing implementation details.
- Avoid introducing synonyms that create conceptual duplication.

## I/O and Side Effects

- Avoid file system, network, environment, or subprocess I/O unless the task requires it.
- Keep I/O at the edges so core logic remains easy to test.
- Do not add logging, printing, or metrics unless requested or already established nearby.

## Error Handling

- Fail clearly and predictably.
- Raise or return errors in the style already used by nearby code.
- Do not swallow exceptions without a clear reason.
- Add context to errors when it materially improves debugging.
- Validate external inputs at boundaries.

## File Cleanliness

- When modifying a file, fix the problems in that file to the best practical extent.
- Prefer leaving a touched file cleaner than you found it, especially for syntax errors, obvious type issues, and straightforward lint problems.
- Do not widen scope into unrelated refactoring just to satisfy every warning.
- If an issue cannot be fixed safely, or the fix would be too cumbersome relative to the task, call it out explicitly instead of forcing a risky change.
- When leaving an issue unresolved, be clear whether it is blocked by scope, ambiguity, missing context, or disproportionate implementation cost.

## Diff Awareness

- Minimize diff size.
- Prefer targeted edits over large block replacements.
- Avoid changes that make code review harder without functional benefit.

## Data and Types

- Keep data shapes simple and stable.
- Prefer explicit dictionaries, dataclasses, or typed objects only when they improve clarity.
- Use type hints when they help readers and match the surrounding codebase.
- Do not add overly complex typing that makes the code harder to read than the implementation itself.

## Testing Mindset

- Test the changed behavior as narrowly as possible.
- Prefer the smallest test that proves the change.
- Do not rewrite unrelated tests.
- If no tests exist for the touched area, add focused coverage only if it materially improves confidence and stays within scope.

## Performance

- Do not optimize prematurely.
- Preserve existing performance characteristics unless the task is explicitly about performance.
- If a performance issue is obvious but outside scope, note it instead of expanding the change.

## Unknown Context Defaults

- Assume the code may have callers outside the visible repository.
- Assume behavior changes may have downstream effects even when local usage looks limited.
- Do not remove code, parameters, or branches solely because they appear unused locally.

## Clarification Threshold

- Ask for clarification if a choice would materially change behavior, public interfaces, or data shape.
- Do not ask for clarification when a safe, local default exists.
- Prefer acting on low-risk implementation details and escalating only real tradeoffs.

## Review Checklist

Before finalizing a Python change, verify:

- The change is the smallest unit that satisfies the request.
- Unrelated behavior has not changed.
- The code is easy to read and reason about.
- New logic follows existing patterns.
- Any ambiguity was resolved conservatively.
- The change would be easy to revert.
- Any touched file-level issues that could be fixed safely were fixed, and any remaining issues were called out.

## Final Instruction

If following these instructions would prevent completing the task correctly, stop and explain the conflict before proceeding.