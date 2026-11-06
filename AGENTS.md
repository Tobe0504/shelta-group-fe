<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## SheltaMart v2 frontend rules

- **shadcn/ui first.** Use shadcn components (`components/ui/*`) for every primitive (button, input, select, dialog, sheet, tabs, badge, card, checkbox, radio, etc.). Only hand-build a component when shadcn has no equivalent, and then build it on top of shadcn primitives.
- **Compact and reusable.** No duplicated markup: anything used twice becomes a shared component (`components/*`). Keep components small and single-purpose; keep data and types out of components (`lib/*`). Prefer composition and props over copy-paste variants.
- **Clean code.** Server Components by default; add `"use client"` only where interactivity needs it. No dead code, no unused exports, no one-off inline style objects — use Tailwind classes and theme tokens.
- **Accessible by default.** Semantic HTML, real `<button>`/`<a>`/`<label>`, visible focus states, `aria-label` on icon-only buttons, text contrast ≥ 4.5:1, touch targets ≥ 44px on larger screens and ≥ 32px with spacing on phones, works by keyboard and at phone width.
- **Compact on phones.** Show as many products as possible: use `max-sm:` overrides for tight spacing and small type, and keep desktop styles as the base.
- **Design source.** Visual direction follows the SheltaMart v2 design canvas: Rubik, white ground, blue `#2563EB` for actions, orange `#F97316` for deals, a pastel per category, pill buttons, ~20px card radius.
- **Data layer.** All API calls go through `services/*.service.ts` (axios via `lib/http.ts`). Client components never call a service directly: they use a React Query hook from `hooks/*` (query keys live in `lib/query-keys.ts`). Server Components call services through `load()` from `lib/server-data.ts`, inside `<Suspense>`.
- **Loading states.** Every async boundary shows a skeleton from `components/skeletons.tsx` shaped like the content, never a spinner or "Loading…" text.
- **Auth-dependent UI.** Read the user with `useMe()`, which stays pending until hydration so server and client HTML match.
