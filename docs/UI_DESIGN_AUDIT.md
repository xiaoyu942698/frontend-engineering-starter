# UI Design Audit

This project uses the global `ai-ui-design-audit` standard.

## Rules

- Use cards only for independent, actionable, or reusable objects.
- Do not nest UI cards inside other cards.
- Avoid generic AI styling: purple-blue gradients, glow effects, glassmorphism, decorative orbs, and gradient text.
- Keep a restrained palette with one primary accent.
- Make headings, labels, body text, captions, and buttons visually distinct.
- Use left alignment for Agent Studio, workflow details, tables, lists, forms, and inspectors.
- Center alignment is only acceptable for narrow empty states or final confirmation blocks.
- Avoid repeated icon tile, heading, description cards.
- Prefer real product information: agent role, tool risk, node status, approval state, runtime event, artifact.

## Design Tokens

- Theme color, secondary color, text color, muted text, border, background, surface, prompt colors, spacing, radius, and type scale live in `packages/ui/src/styles/tokens.css`.
- Feature code should consume CSS variables instead of hard-coding palettes.
- Element Plus is themed through the same variables; do not create a separate component-library theme path.
- App-specific dark shells, canvas grids, and state colors must still be represented as token variables before use in feature CSS.

## Baseline Components

- Use Element Plus for forms, tables, buttons, drawers, dialogs, messages, notifications, menus, tabs, tags, skeletons, and empty states.
- Use `UiStateBlock` for shared loading, empty, and error panels.
- Use `UiSurfaceFrame`, `UiSurfaceNav`, `UiSection`, `UiTimeline`, and `UiKeyValueList` for reusable product surfaces.
- Use `@element-plus/icons-vue` for common UI actions; do not hand-roll icon SVGs unless the icon is a product asset.

## Component Layers

- Generic framework components live in `packages/ui` as thin wrappers over Element Plus where a mature primitive already exists.
- Agent domain components live in `apps/web/src/features/studio/components`: resource catalog, run timeline mapping, approval gate, artifact panel, and workflow canvas integration.
- The demo page may switch between task-session, workflow, and audit surfaces; none of these shapes should be treated as the only valid product form.

## Acceptance

A UI change is not ready if it relies on decoration to look finished, hides runtime state, uses generic marketing layout, or makes workflow information hard to scan.

Detailed layout, spacing, form, dialog, table, button, icon, theme, and responsive rules are maintained in `docs/FRONTEND_ENGINEERING_STANDARD.md`.
