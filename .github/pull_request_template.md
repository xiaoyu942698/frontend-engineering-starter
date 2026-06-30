## Summary

-

## Package Boundary

-

## Verification

- [ ] `pnpm format:check`
- [ ] `pnpm lint`
- [ ] `pnpm lint:style`
- [ ] `pnpm lint:standards`
- [ ] `pnpm lint:engineering`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] `pnpm check:gates`
- [ ] `pnpm test:coverage` when core shared/contracts/runtime/auth code changed.
- [ ] `pnpm verify:e2e` when visible user journeys changed.

## Naming / Comments / File Size

- [ ] New CSS classes follow approved namespace and kebab/BEM rules.
- [ ] New functions use action-oriented names.
- [ ] Exported public APIs have TSDoc.
- [ ] TODO comments use `TODO(scope): message`.
- [ ] No commented-out old code remains.
- [ ] New or modified source files stay within line and 80KB size limits.

## Codex Review

- [ ] Codex review requested through `@codex review` or automatic review.
- [ ] `Codex Review / codex_review` check passed.
- [ ] P0/P1 findings are fixed or explicitly accepted by maintainers.
- [ ] No AI-assisted commit, push, PR update, or merge used `--no-verify` or bypassed required checks.

## UI Review

- [ ] No nested cards or decorative AI-style gradients/glow.
- [ ] Theme changes use `packages/ui/src/styles/tokens.css`.
- [ ] Screenshots attached for visible UI changes.

## Engineering Review

- [ ] Architecture/API/component/security/performance/accessibility rules were checked for the changed surface.
- [ ] New dependencies follow `docs/DEPENDENCY_POLICY.md`.
- [ ] API responses are validated or mapped before reaching components.

## Contract / Runtime Notes

-
