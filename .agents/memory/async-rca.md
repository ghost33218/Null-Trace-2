---
name: Async RCA generation pattern
description: How root cause analysis is triggered and stored for incidents
---

`generateRCA(context: IncidentContext): Promise<AnalysisResult>` in `lib/ai-analysis.ts` calls Groq and returns the analysis — it does NOT save to DB.

Two places that trigger RCA:
1. **monitoring.ts simulate endpoint**: fire-and-forget after returning the incident (saves rootCause/aiAnalysis/confidence/suggestedCommands via `db.update`)
2. **IncidentDetailPage**: `useEffect` auto-calls `analyzeMutation.mutate({ id })` if `incident.rootCause` is null; refetches on success

The `/incidents/:id/analyze` route is the user-triggered path; it also saves to DB.

**Why:** Incident creation is fast (must return <100ms). RCA via Groq takes 500-2000ms. Async pattern keeps the API responsive while ensuring incidents have RCA data shortly after creation.
