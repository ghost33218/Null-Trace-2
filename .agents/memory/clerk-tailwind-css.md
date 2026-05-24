---
name: Clerk + Tailwind v4 CSS layer ordering
description: How to configure index.css and vite.config.ts so Clerk's CSS layers don't conflict with Tailwind v4
---

The rule: add `@layer theme, base, clerk, components, utilities;` as the FIRST line of index.css, BEFORE `@import "tailwindcss"`. Then import Clerk's shadcn theme CSS.

In vite.config.ts, change `tailwindcss()` → `tailwindcss({ optimize: false })`.

**Why:** Tailwind v4 uses CSS cascade layers. Without declaring the `clerk` layer explicitly in the right order, Clerk's styles get applied in the wrong cascade layer and break the UI (invisible inputs, wrong colors, missing borders).

**How to apply:** Whenever Clerk is added to a Tailwind v4 project.

Example index.css first 3 lines:
```css
@layer theme, base, clerk, components, utilities;
@import "tailwindcss";
@import '@clerk/themes/shadcn.css';
```
