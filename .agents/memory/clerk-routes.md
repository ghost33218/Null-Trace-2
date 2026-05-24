---
name: Clerk protected route pattern (Wouter)
description: How to protect routes with Clerk in a Wouter-based React app
---

Pattern for protecting routes with `<Show>` from @clerk/react:

```tsx
function Protected({ component: Page }) {
  return (
    <>
      <Show when="signed-in"><Page /></Show>
      <Show when="signed-out"><Redirect to="/sign-in" /></Show>
    </>
  );
}
```

Home redirect pattern (landing if signed-out, dashboard if signed-in):
```tsx
function HomeRedirect() {
  return (
    <>
      <Show when="signed-in"><Redirect to="/dashboard" /></Show>
      <Show when="signed-out"><LandingPage /></Show>
    </>
  );
}
```

ClerkProvider needs `routerPush` and `routerReplace` wired to Wouter's `setLocation`. Use `publishableKeyFromHost` from `@clerk/react/internal` for the publishable key.

**Why:** Wouter doesn't use React Router's history API, so Clerk's built-in routing doesn't work without explicit push/replace callbacks.
