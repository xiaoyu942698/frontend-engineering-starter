# Dependency Policy

## Package Manager

Use pnpm only. Commit `pnpm-lock.yaml`.

## Core Dependencies

- Vue 3 and Vite for the web app.
- Element Plus as the only base UI component library.
- `packages/ui` for local design tokens and framework-level Vue components.
- Vue Flow for graph and workflow canvas behavior.
- Pinia for client UI state.
- TanStack Vue Query and Axios for server state and HTTP.
- Fastify for the mock API.
- Zod for contracts.
- Vitest and Playwright for verification.
- ESLint, Stylelint, Prettier, Commitlint, Husky, lint-staged, and GitHub Actions for code style, naming, comment, file-size, commit, and quality gates.

## Rules

- Do not add a second UI component framework.
- Do not scatter theme colors in feature code; add or override design variables in `packages/ui/src/styles/tokens.css`.
- Do not rebuild mature Element Plus controls. Use Element Plus for buttons, inputs, menus, tabs, timeline, descriptions, tags, empty states, drawers, dialogs, forms, tables, and notifications.
- Put only thin design-system adapters, layout shells, and cross-project composition helpers in `packages/ui`.
- Use Vue Flow for graph and workflow canvas behavior instead of hand-rolled canvas logic.
- Use TanStack Vue Query and Axios for server state and HTTP instead of custom fetch caches.
- Use Zod for runtime schema validation instead of handwritten validators.
- Use Commitlint for commit message validation, Husky for Git hook wiring, and lint-staged for staged-file checks instead of custom hook scripts.
- Use ESLint and Prettier for code style instead of custom formatting scripts.
- Use Stylelint and `scripts/check-naming-and-comments.mjs` for class naming, function naming, TSDoc, TODO, comment-density, and file-size gates.
- Use `scripts/check-engineering-rules.mjs` for architecture boundary, style token, and duplicate dependency gates.
- Do not add decorative animation or styling libraries for polish.
- Do not put framework-specific Agent SDK types in web components.
- Put runtime-specific integration code behind adapter modules.
- Add new dependencies only when they solve a clear shared starter problem.
