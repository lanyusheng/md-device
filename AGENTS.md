# Repository Guidelines

## Project Structure & Module Organization
- Source lives in `src/`, with the Next.js App Router under `src/app` and shared UI in `src/components/ui`.
- Domain-specific features sit in `src/features`, while request adapters and device APIs are in `src/services`; keep cross-cutting utilities in `src/lib`.
- Configuration constants belong in `src/config` and `src/constants`; hooks reside in `src/hooks` with `use*` naming.
- Static assets (logos, i18n resources) belong in `public/`. Mirror new routes with co-located server/client components to keep data and UI paired.

## Build, Test, and Development Commands
- `pnpm install` ensures packages align with the checked-in `pnpm-lock.yaml`.
- `pnpm dev` starts Next.js with Turbopack; use it for daily work and verify hot reload.
- `pnpm build` compiles production assets; run before release branches to surface SSR issues.
- `pnpm start` serves the built bundle locally for smoke testing.
- `pnpm lint` and `pnpm lint:fix` enforce ESLint rules, while `pnpm format` runs Prettier and the Tailwind plugin over the repo.

## Coding Style & Naming Conventions
- TypeScript is mandatory; enable strictness by default and prefer typed helpers in `src/lib`.
- Prettier (2-space indent, single quotes off) and ESLint (`next` config) define formatting; never hand-format around these rules.
- Component files follow `kebab-case.tsx` but export `PascalCase` symbols; hooks use `useThing` camelCase; constants use `UPPER_SNAKE_CASE`.
- Stick to Tailwind utility-first classes, keeping variant definitions in `class-variance-authority` helpers where reuse is needed.

## Testing Guidelines
- No test runner is wired yet; when adding tests, co-locate them as `<name>.test.ts(x)` beside the source and update `package.json` with a `pnpm test` script.
- Prioritize coverage of form logic in `src/features/**/forms` and service adapters in `src/services`, mocking network dependencies via Axios interceptors.
- Always run `pnpm lint` after writing tests to catch unused imports and type drift.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat:`, `fix:`, `chore:`) as seen in recent history; scope with a short noun when it aids clarity (e.g., `feat(device): ...`).
- Each PR should include: a concise summary, verification steps (`pnpm dev`, `pnpm build`, or lint runs), linked Jira/GitHub issues, and screenshots for UI-visible changes.
- Ensure branches are rebased on the latest `main` before requesting review, and allow CI linting to pass before assigning reviewers.
