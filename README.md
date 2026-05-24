# NullTrace — AI-Powered DevOps Observability Platform

NullTrace is an AI-powered DevOps observability and incident intelligence platform built for modern SRE and engineering teams.

The platform helps teams monitor infrastructure, analyze production incidents, identify probable root causes using AI, and accelerate debugging workflows through real-time observability and intelligent automation.

Inspired by modern observability platforms such as Grafana and Datadog.

---

# Features

## Incident Management

* Real-time incident feed with severity levels
* AI-generated Root Cause Analysis (RCA)
* Suggested remediation commands
* Incident timeline tracking
* Service correlation per incident
* Incident status management

---

## AI Root Cause Analysis

NullTrace analyzes infrastructure logs, metrics, incidents, and service failures to generate AI-powered Root Cause Analysis (RCA).

The AI engine identifies:

* probable root causes
* affected services
* anomaly patterns
* infrastructure instability
* suggested remediation actions

The platform also generates human-readable explanations to simplify debugging during production incidents.

---

## Dashboard & Observability

* Live system health score
* AI anomaly insight feed
* Service dependency heatmap
* Active incident overview
* Pod health monitoring
* Infrastructure visibility dashboard

---

## Service Monitoring

* Microservice health tracking
* Service latency metrics
* Error rate analysis
* Request throughput monitoring
* Pod replica monitoring

---

## Metrics & Analytics

* Time-series monitoring charts
* Historical trend analysis
* Per-service performance breakdown
* Infrastructure health monitoring

---

## Logs & Analysis

* Searchable log streams
* Log filtering by severity
* AI-powered log analysis
* Pattern and anomaly detection

---

## AI Assistant

* Natural language infrastructure assistant
* Context-aware AI responses
* Infrastructure debugging support
* Incident investigation assistance

---

## Authentication

* Secure sign-in simulation
* Authentication workflow integration

---

# Tech Stack

| Layer         | Technology                               |
| ------------- | ---------------------------------------- |
| Frontend      | React 19, Vite, TypeScript, Tailwind CSS |
| UI Components | shadcn/ui, Radix UI, Lucide Icons        |
| Data Fetching | TanStack React Query                     |
| Routing       | Wouter                                   |
| Backend       | Express.js, Node.js, TypeScript          |
| Database      | PostgreSQL + Drizzle ORM                 |
| Validation    | Zod                                      |
| API Contract  | OpenAPI 3.0                              |
| Build Tools   | esbuild, Vite                            |
| Monorepo      | pnpm workspaces                          |

---

# Project Structure

```bash
/
├── artifacts/
│   ├── nulltrace/          # Frontend application
│   └── api-server/         # Backend server
├── lib/
│   ├── db/                 # Database schema and configuration
│   ├── api-spec/           # OpenAPI specification
│   └── api-client-react/   # Generated API hooks
└── scripts/                # Utility scripts
```

---

# Core API Endpoints

| Method | Endpoint               | Description           |
| ------ | ---------------------- | --------------------- |
| GET    | /api/healthz           | Health check          |
| GET    | /api/incidents         | List incidents        |
| POST   | /api/incidents         | Create incident       |
| GET    | /api/services          | Service health data   |
| GET    | /api/metrics           | Metrics data          |
| GET    | /api/logs              | Logs endpoint         |
| POST   | /api/logs/analyze      | AI log analysis       |
| POST   | /api/incidents/:id/rca | Generate AI RCA       |
| POST   | /api/ai/chat           | AI assistant endpoint |

---

# Getting Started

## Prerequisites

* Node.js 24+
* pnpm
* PostgreSQL database

---

# Environment Variables

```env
DATABASE_URL=your_postgresql_url

GROQ_API_KEY=your_groq_api_key

SESSION_SECRET=your_secret

VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

CLERK_SECRET_KEY=your_clerk_secret_key

PORT=8080

NODE_ENV=development
```

---

# Run Locally

## Install dependencies

```bash
pnpm install
```

## Push database schema

```bash
pnpm --filter @workspace/db run push
```

## Start backend server

```bash
pnpm --filter @workspace/api-server dev
```

## Start frontend

```bash
pnpm --filter @workspace/nulltrace dev
```

---

# Pages

| Route      | Description         |
| ---------- | ------------------- |
| /          | Landing Page        |
| /signin    | Authentication      |
| /dashboard | System Dashboard    |
| /incidents | Incident Monitoring |
| /services  | Service Monitoring  |
| /metrics   | Metrics Dashboard   |
| /logs      | Log Analysis        |
| /ai-chat   | AI Assistant        |

---

# Design System

* Dark futuristic observability UI
* Neon blue and purple accents
* Glassmorphism card styling
* Responsive dashboard layouts
* Real-time monitoring indicators

---

# Architecture Decisions

## Contract-First API

OpenAPI specification acts as the single source of truth for API generation and validation.

## Drizzle ORM

Used for lightweight and TypeScript-friendly database interactions.

## Lightweight Routing

Wouter used for minimal client-side routing overhead.

## Modern UI System

Tailwind CSS and shadcn/ui used for scalable component architecture.

---

# Hackathon Submission

This project was developed as part of a 2-day AI/DevOps Hackathon focused on solving real-world infrastructure and observability challenges using intelligent automation.

Submission includes:

* GitHub Repository
* 3-Minute Demo Video
* AI-powered incident analysis workflows
* Real-time observability dashboard

---

# Contributors

* Anandi Mahajan
* Tanmay Tripathi
  
---

# License

MIT License

---

**Due to free-tier/cloud limitations, the project is demonstrated locally in the demo video**

Built with React, Express, PostgreSQL, and AI-powered observability workflows.
