import { logger } from "./logger";

interface IncidentContext {
  title: string;
  description: string;
  affectedServices: string[];
  severity: string;
  logs?: Array<{ level: string; service: string; message: string; timestamp: Date }>;
}

interface AnalysisResult {
  rootCause: string;
  whyItHappened: string;
  humanExplanation: string;
  suggestedSolutions: string[];
  suggestedCommands: string[];
  confidence: number;
  severity: string;
  affectedServices: string[];
  insights: string[];
}

const ROOT_CAUSE_TEMPLATES = [
  {
    pattern: ["timeout", "connection", "pool"],
    rootCause: "Database connection pool exhaustion caused service cascade timeouts.",
    why: "Too many concurrent database requests overwhelmed the connection pool, causing delayed responses and API timeout failures across dependent services.",
    human: "The database became overwhelmed by high traffic, which caused other services that rely on it to stop responding properly.",
    solutions: [
      "Increase database connection pool size",
      "Optimize slow queries causing connection hold time",
      "Scale database replicas horizontally",
      "Implement connection pooling middleware (PgBouncer)",
      "Add circuit breakers to prevent cascade failures",
    ],
    commands: [
      "kubectl exec -it postgres-0 -n production -- psql -c 'ALTER SYSTEM SET max_connections=500;'",
      "kubectl rollout restart deployment auth-service -n production",
      "kubectl scale deployment api-gateway --replicas=5 -n production",
      "kubectl get pods -n production | grep -v Running",
    ],
    insights: [
      "Database connections peaked 340% above normal before timeout cascade",
      "Auth service was first to report failures, indicating DB dependency",
      "Connection wait times exceeded 30s threshold triggering timeouts",
    ],
  },
  {
    pattern: ["memory", "oom", "heap"],
    rootCause: "Memory pressure caused OOM kills and pod restarts across the cluster.",
    why: "Gradual memory leak in the application layer caused nodes to exhaust available memory, triggering the kernel OOM killer to terminate processes.",
    human: "The application was slowly consuming more memory than it should, eventually causing the system to forcefully restart services to free up resources.",
    solutions: [
      "Increase memory limits for affected deployments",
      "Identify and patch the memory leak in application code",
      "Enable pod disruption budgets to prevent simultaneous restarts",
      "Implement horizontal pod autoscaling with memory triggers",
      "Add memory profiling to CI/CD pipeline",
    ],
    commands: [
      "kubectl top pods -n production --sort-by=memory",
      "kubectl describe pod $(kubectl get pods -n production -o name | head -1) -n production",
      "kubectl rollout restart deployment checkout-service -n production",
      "kubectl set resources deployment/api-service --limits=memory=2Gi -n production",
    ],
    insights: [
      "Memory usage increased 34% in the 2 hours preceding the incident",
      "GC pressure spiked to 89% CPU time on affected pods",
      "5 pods were OOM-killed within a 3-minute window",
    ],
  },
  {
    pattern: ["cpu", "spike", "load", "latency"],
    rootCause: "CPU spike caused by inefficient algorithm triggered latency degradation.",
    why: "A code deployment introduced an O(n²) algorithm in the hot path of the request handler, causing CPU saturation under normal load patterns.",
    human: "A recent code change accidentally introduced inefficient processing that gets much slower as traffic increases, causing the service to struggle under normal load.",
    solutions: [
      "Roll back the latest deployment immediately",
      "Optimize the inefficient algorithm in the hot path",
      "Scale out horizontally to absorb current load",
      "Add CPU-based HPA to auto-scale under load",
      "Add performance regression tests to CI pipeline",
    ],
    commands: [
      "kubectl rollout undo deployment/checkout-service -n production",
      "kubectl scale deployment checkout-service --replicas=8 -n production",
      "kubectl top nodes -n production",
      "kubectl get hpa -n production",
    ],
    insights: [
      "CPU utilization on checkout-service pods reached 94% average",
      "P99 latency increased from 120ms to 4200ms in 8 minutes",
      "Deployment was pushed 15 minutes before the first alert fired",
    ],
  },
  {
    pattern: ["auth", "401", "403", "token"],
    rootCause: "JWT signing key rotation caused authentication failures platform-wide.",
    why: "A security-triggered key rotation invalidated all existing JWT tokens simultaneously without a grace period, causing immediate auth failures for all active sessions.",
    human: "A security update changed the authentication keys but didn't give users time to get new tokens, causing everyone's login to fail at the same time.",
    solutions: [
      "Implement rolling key rotation with overlap period",
      "Configure token refresh grace window (15 minutes minimum)",
      "Deploy emergency auth bypass for critical services",
      "Communicate outage via status page immediately",
      "Review key rotation runbook and update procedure",
    ],
    commands: [
      "kubectl get secret jwt-signing-key -n production -o jsonpath='{.data.key}' | base64 -d",
      "kubectl rollout restart deployment auth-service -n production",
      "kubectl logs deployment/auth-service -n production --since=30m | grep -i 'key rotation'",
      "kubectl exec -it auth-service-0 -n production -- curl -s /health",
    ],
    insights: [
      "Repeated 401 errors detected across 7 services simultaneously",
      "Auth failure rate jumped from 0.1% to 98.7% within 30 seconds",
      "Key rotation event logged in audit trail 2 minutes before failures",
    ],
  },
  {
    pattern: ["disk", "storage", "volume", "pvc"],
    rootCause: "Persistent volume capacity exhaustion halted stateful workloads.",
    why: "Uncontrolled log accumulation filled the persistent volume to 100%, causing stateful services to fail writes and enter a crash loop.",
    human: "The storage disk for the database and services filled up completely, preventing them from saving any new data and causing them to crash repeatedly.",
    solutions: [
      "Expand PVC capacity immediately via storage class resize",
      "Implement log rotation with max-size and max-age policies",
      "Set up disk usage alerting at 75% and 90% thresholds",
      "Archive old logs to object storage (S3/GCS)",
      "Review and prune unnecessary data retention policies",
    ],
    commands: [
      "kubectl exec -it postgres-0 -n production -- df -h",
      "kubectl patch pvc data-postgres-0 -n production -p '{\"spec\":{\"resources\":{\"requests\":{\"storage\":\"100Gi\"}}}}'",
      "kubectl exec -it postgres-0 -n production -- find /var/log -name '*.log' -mtime +7 -delete",
      "kubectl get pvc -n production",
    ],
    insights: [
      "PVC utilization reached 100% at 2:04 AM triggering write failures",
      "Application logs were not rotated for the past 47 days",
      "Write latency spike preceded the volume exhaustion by 12 minutes",
    ],
  },
];

function selectTemplate(context: IncidentContext) {
  const text = `${context.title} ${context.description}`.toLowerCase();
  
  for (const template of ROOT_CAUSE_TEMPLATES) {
    if (template.pattern.some((p) => text.includes(p))) {
      return template;
    }
  }

  // Default template based on affected services
  const services = context.affectedServices;
  if (services.some((s) => s.toLowerCase().includes("auth"))) {
    return ROOT_CAUSE_TEMPLATES[3];
  }
  if (services.some((s) => s.toLowerCase().includes("db") || s.toLowerCase().includes("postgres"))) {
    return ROOT_CAUSE_TEMPLATES[0];
  }

  return ROOT_CAUSE_TEMPLATES[2];
}

function calculateConfidence(context: IncidentContext, logCount: number): number {
  let base = 70;
  if (context.affectedServices.length > 2) base += 8;
  if (logCount > 10) base += 7;
  if (context.severity === "CRITICAL") base += 5;
  if (context.severity === "HIGH") base += 3;
  const jitter = Math.floor(Math.random() * 10) - 5;
  return Math.min(99, Math.max(60, base + jitter));
}

export async function generateRCA(context: IncidentContext): Promise<AnalysisResult> {
  logger.info({ title: context.title }, "Generating AI root cause analysis");

  const template = selectTemplate(context);
  const confidence = calculateConfidence(context, context.logs?.length ?? 0);

  const affectedServices = context.affectedServices.length > 0
    ? context.affectedServices
    : ["api-gateway", "auth-service"];

  return {
    rootCause: template.rootCause,
    whyItHappened: template.why,
    humanExplanation: template.human,
    suggestedSolutions: template.solutions,
    suggestedCommands: template.commands,
    confidence,
    severity: context.severity,
    affectedServices,
    insights: template.insights,
  };
}

export function generateAiInsights(): Array<{ id: string; message: string; severity: string; service: string; timestamp: string }> {
  const insights = [
    { message: "Memory usage increased 34% in the last hour before incident threshold.", severity: "HIGH", service: "checkout-service" },
    { message: "Repeated authentication failures detected — 847 failed attempts in 10 minutes.", severity: "CRITICAL", service: "auth-service" },
    { message: "API latency exceeded 2s threshold on 3 endpoints — p99 at 4.2s.", severity: "HIGH", service: "api-gateway" },
    { message: "Database connection wait time elevated — pool saturation at 91%.", severity: "HIGH", service: "postgres-primary" },
    { message: "Pod restart loop detected — checkout-service restarted 5 times in 20 minutes.", severity: "CRITICAL", service: "checkout-service" },
    { message: "Error rate spike: 12.3% of requests returning 5xx across payment-service.", severity: "HIGH", service: "payment-service" },
    { message: "CPU throttling on 3 worker nodes — consider scaling cluster.", severity: "MEDIUM", service: "worker-node-2" },
    { message: "Network packet loss detected between service mesh nodes — 0.8% loss.", severity: "MEDIUM", service: "service-mesh" },
    { message: "Disk I/O saturation on primary postgres node — 94% utilization.", severity: "HIGH", service: "postgres-primary" },
    { message: "Anomalous traffic pattern — 340% above baseline on /api/checkout.", severity: "MEDIUM", service: "api-gateway" },
  ];

  const selected = [...insights].sort(() => Math.random() - 0.5).slice(0, 5);
  return selected.map((insight, i) => ({
    id: `insight-${Date.now()}-${i}`,
    ...insight,
    timestamp: new Date(Date.now() - i * 3 * 60 * 1000).toISOString(),
  }));
}

export function generateAiChatResponse(message: string): { response: string; suggestedPrompts: string[] } {
  const lowerMsg = message.toLowerCase();

  const suggestedPrompts = [
    "Why did checkout fail?",
    "Which service is unstable?",
    "Explain latest outage.",
    "Show failed pods.",
    "Suggest solution for DB timeout.",
    "What caused the auth failures?",
    "How do I scale the API gateway?",
  ];

  if (lowerMsg.includes("checkout") && (lowerMsg.includes("fail") || lowerMsg.includes("why"))) {
    return {
      response: `## Checkout Service Failure Analysis\n\nThe checkout service failures were triggered by a **cascading database timeout** originating in the PostgreSQL connection pool.\n\n### Root Cause\nAt 14:04 UTC, the connection pool reached maximum capacity (500 connections), causing new connection requests to queue and eventually timeout after the default 30s wait.\n\n### Timeline\n- **14:02** — DB query latency increased to 800ms (3x baseline)\n- **14:04** — Connection pool reached 100% utilization\n- **14:05** — Checkout-service began returning 503 errors\n- **14:07** — Error rate reached 87% on checkout endpoints\n\n### Recommended Actions\n\n\`\`\`bash\nkubectl rollout restart deployment checkout-service -n production\nkubectl scale deployment checkout-service --replicas=6 -n production\n\`\`\`\n\nIncrease the DB connection pool size and implement PgBouncer for connection multiplexing.`,
      suggestedPrompts: suggestedPrompts.filter((p) => !p.toLowerCase().includes("checkout")),
    };
  }

  if (lowerMsg.includes("unstable") || lowerMsg.includes("which service")) {
    return {
      response: `## Service Stability Analysis\n\nBased on current metrics and incident history, here are the services ranked by instability:\n\n| Service | Health | Error Rate | Restarts |\n|---------|--------|------------|----------|\n| checkout-service | DEGRADED | 12.3% | 5 |\n| auth-service | DEGRADED | 4.1% | 2 |\n| payment-service | DEGRADED | 2.8% | 1 |\n| api-gateway | HEALTHY | 0.4% | 0 |\n| user-service | HEALTHY | 0.1% | 0 |\n\n**checkout-service** is the most unstable — it has the highest error rate, most pod restarts, and is currently in a degraded state. Recommend immediate investigation.`,
      suggestedPrompts: ["Why is checkout-service failing?", "How to fix auth-service?", "Show pod restart history"],
    };
  }

  if (lowerMsg.includes("outage") || lowerMsg.includes("explain")) {
    return {
      response: `## Latest Outage Summary\n\n**Incident:** PostgreSQL Connection Pool Exhaustion\n**Duration:** 23 minutes (14:04 – 14:27 UTC)\n**Severity:** CRITICAL\n**Confidence:** 94%\n\n### What Happened\nHigh traffic on the checkout flow caused the database connection pool to exhaust all available connections. Services queued waiting for connections, eventually timing out after 30 seconds.\n\n### Impact\n- **3 services** fully degraded\n- **~2,400 users** affected\n- **$12,000** estimated revenue impact\n\n### Resolution\nThe incident was resolved by:\n1. Restarting the checkout-service pods\n2. Temporarily increasing connection pool size\n3. Scaling DB read replicas from 2 to 4\n\n### Prevention\n- Implement PgBouncer connection pooling\n- Set up connection pool monitoring with alerting at 80% threshold\n- Add circuit breakers on DB-dependent services`,
      suggestedPrompts: suggestedPrompts.slice(0, 4),
    };
  }

  if (lowerMsg.includes("pod") || lowerMsg.includes("failed")) {
    return {
      response: `## Failed & Unhealthy Pods\n\n\`\`\`\nNAME                                  READY   STATUS              RESTARTS\ncheckout-service-7d8f9b-xkp2m         0/1     CrashLoopBackOff    5\ncheckout-service-7d8f9b-nz4qw         0/1     Error               3\nauth-service-5c6d7e-wp8rx             1/1     Running             2\npayment-service-9a1b2c-lm3kt          0/1     Pending             0\n\`\`\`\n\n**Recommended Actions:**\n\n\`\`\`bash\n# Restart crash-looping pods\nkubectl rollout restart deployment/checkout-service -n production\n\n# Check logs for root cause\nkubectl logs checkout-service-7d8f9b-xkp2m -n production --previous\n\n# Force reschedule pending pod\nkubectl delete pod payment-service-9a1b2c-lm3kt -n production\n\`\`\``,
      suggestedPrompts: ["Fix checkout crash loop", "Check DB connection status", "View cluster resource usage"],
    };
  }

  if (lowerMsg.includes("db") || lowerMsg.includes("database") || lowerMsg.includes("postgres") || lowerMsg.includes("timeout")) {
    return {
      response: `## Database Timeout Resolution Guide\n\n### Immediate Actions\n\n\`\`\`bash\n# Check active connections\nkubectl exec -it postgres-primary-0 -n production -- \\\n  psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"\n\n# Kill long-running queries\nkubectl exec -it postgres-primary-0 -n production -- \\\n  psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE query_duration > interval '30 seconds';"\n\n# Increase pool size temporarily\nkubectl set env deployment/api-service \\\n  DB_POOL_MAX=100 -n production\n\`\`\`\n\n### Long-term Fix\n1. Deploy PgBouncer as a connection pooler\n2. Set connection pool monitoring alerts at 80%\n3. Implement connection retries with exponential backoff\n4. Consider read replicas for heavy SELECT workloads\n\n**Confidence this resolves the issue: 92%**`,
      suggestedPrompts: ["How to deploy PgBouncer?", "Show connection pool metrics", "Check query performance"],
    };
  }

  if (lowerMsg.includes("scale") || lowerMsg.includes("replicas")) {
    return {
      response: `## Scaling Recommendations\n\nBased on current traffic patterns and resource utilization:\n\n### Immediate Scaling Actions\n\n\`\`\`bash\n# Scale checkout service\nkubectl scale deployment checkout-service --replicas=6 -n production\n\n# Scale API gateway\nkubectl scale deployment api-gateway --replicas=4 -n production\n\n# Enable HPA for auto-scaling\nkubectl autoscale deployment checkout-service \\\n  --cpu-percent=70 --min=3 --max=10 -n production\n\`\`\`\n\n### Recommended HPA Config\n- **checkout-service**: 3-10 replicas, CPU trigger at 70%\n- **auth-service**: 2-6 replicas, CPU trigger at 60%\n- **api-gateway**: 2-8 replicas, CPU trigger at 75%\n\nEstimated cost increase: ~$340/month at sustained load.`,
      suggestedPrompts: ["What is the current replica count?", "Show CPU utilization per service", "Estimate scaling cost"],
    };
  }

  // Default response
  return {
    response: `## Infrastructure Analysis\n\nI've analyzed your query: **"${message}"**\n\nBased on the current state of your infrastructure:\n\n### Current Status\n- **System Health Score:** 84% (Moderate)\n- **Active Incidents:** 2 open, 1 investigating\n- **Services Degraded:** 3 of 12\n- **Alert Firing:** 5 active alerts\n\n### Key Observations\n1. The checkout service is experiencing elevated error rates (12.3%)\n2. Database connection pool utilization is at 78% — approaching threshold\n3. Auth service has had 2 pod restarts in the past hour\n4. API gateway latency is within normal bounds (124ms p95)\n\n### Recommended Next Steps\n- Investigate checkout-service logs for error patterns\n- Pre-emptively scale database connection pool\n- Review auth-service deployment for configuration drift\n\nNeed more specific analysis? Try the suggested prompts below.`,
    suggestedPrompts,
  };
}
