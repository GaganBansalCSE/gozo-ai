# GOZO AI — Personal AI-Powered Job Hunting Assistant

This repository defines a **clean monolithic architecture** for a personal job-hunting assistant focused on:

- discovering relevant jobs automatically
- ranking jobs with AI-based reasoning
- auto-applying to safe Easy Apply opportunities
- tracking all applications in MongoDB
- avoiding duplicate applications
- managing manual applications in a simple dashboard

---

## 1) Architecture (Monolith, Practical, Maintainable)

Single deployable app with clear internal modules:

- **frontend/**: Next.js dashboard UI
- **backend/**: Express APIs + orchestration endpoints
- **scheduler/**: node-cron daily workflow triggers
- **services/**: job fetchers, dedupe, ranking, apply orchestration
- **automation/**: Playwright scripts for Easy Apply
- **ai/**: OpenAI/Gemini matching adapter
- **db/** + **models/**: MongoDB connection + Mongoose schemas
- **utils/**: logging, retry, validation, constants

### Core Runtime Flow

1. Scheduler triggers daily pipeline
2. Fetch jobs from configured sources
3. Normalize + dedupe (`company + role + url`)
4. AI scoring (match score + reason)
5. Persist/update jobs in MongoDB
6. Attempt Easy Apply for safe candidates only
7. Expose results in Next.js dashboard

---

## 2) Folder Structure

```text
gozo-ai/
├─ frontend/
│  ├─ app/
│  │  ├─ page.tsx
│  │  └─ jobs/page.tsx
│  ├─ components/
│  │  ├─ JobCard.tsx
│  │  └─ Filters.tsx
│  ├─ lib/api.ts
│  └─ styles/
├─ backend/
│  ├─ src/
│  │  ├─ app.js
│  │  ├─ server.js
│  │  ├─ routes/
│  │  │  ├─ jobs.routes.js
│  │  │  ├─ applications.routes.js
│  │  │  └─ workflow.routes.js
│  │  ├─ controllers/
│  │  ├─ services/
│  │  │  ├─ jobSearch.service.js
│  │  │  ├─ matching.service.js
│  │  │  ├─ dedupe.service.js
│  │  │  └─ applyOrchestrator.service.js
│  │  ├─ ai/
│  │  │  └─ llmClient.js
│  │  ├─ automation/
│  │  │  ├─ playwrightClient.js
│  │  │  └─ linkedinEasyApply.js
│  │  ├─ db/
│  │  │  └─ mongoose.js
│  │  ├─ models/
│  │  │  └─ JobApplication.js
│  │  ├─ scheduler/
│  │  │  └─ dailyJobSync.js
│  │  └─ utils/
│  │     ├─ logger.js
│  │     ├─ retry.js
│  │     └─ constants.js
│  └─ package.json
├─ scripts/
│  └─ bootstrap.sh
├─ .env.example
└─ README.md
```

---

## 3) MongoDB Schema (with Duplicate Prevention)

```js
// models/JobApplication.js
const JobApplicationSchema = new Schema(
  {
    company: { type: String, required: true, index: true },
    role: { type: String, required: true, index: true },
    location: { type: String, default: "Unknown", index: true },
    source: {
      type: String,
      enum: ["LINKEDIN", "WELLFOUND", "YC", "GREENHOUSE", "LEVER", "CAREERS_PAGE"],
      required: true,
      index: true,
    },
    applyType: { type: String, enum: ["EASY_APPLY", "MANUAL"], required: true, index: true },
    matchScore: { type: Number, min: 0, max: 100, default: 0, index: true },
    reason: { type: String, default: "" },
    url: { type: String, required: true },
    status: {
      type: String,
      enum: ["NOT_APPLIED", "APPLIED", "INTERVIEW", "REJECTED", "SKIPPED"],
      default: "NOT_APPLIED",
      index: true,
    },
    postedAt: { type: Date },
    appliedAt: { type: Date, default: null },
    techStack: { type: [String], default: [] },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

JobApplicationSchema.index({ company: 1, role: 1, url: 1 }, { unique: true });
```

---

## 4) Backend API Design

### Jobs
- `GET /api/jobs`  
  Query: `status, source, location, role, minScore, maxScore, applyType, page, limit`
- `GET /api/jobs/top-matches`  
  Returns high-score ranked jobs
- `POST /api/jobs/discover`  
  Manual trigger for search + rank + save

### Applications
- `PATCH /api/applications/:id/status`  
  Update status (`NOT_APPLIED/APPLIED/INTERVIEW/REJECTED/SKIPPED`)
- `POST /api/applications/:id/mark-applied`

### Workflow / Automation
- `POST /api/workflow/run-daily`  
  Runs end-to-end daily pipeline
- `POST /api/automation/easy-apply/run`  
  Attempts safe Easy Apply automation for eligible jobs

---

## 5) Playwright Easy Apply Design

### Safety-First Principles
- Reuse saved auth state (`auth.json`)
- Use human-like typing + random delays
- Prefer robust selectors (`getByRole`, labels)
- Skip complex/multi-page/essay-heavy flows
- Skip suspicious or broken pages
- Add retry + browser recovery

### Flow
1. Load persisted LinkedIn session
2. Open job posting URL
3. Detect Easy Apply button
4. Open modal and fill known safe fields
5. Upload resume when required
6. If form is short and safe -> submit (optional toggle)
7. Else save as manual follow-up + status note

---

## 6) AI Matching Workflow

### Input Signals
- user profile (roles, locations, skills)
- job description text
- posting recency
- seniority hints (intern/junior/entry vs senior/staff)

### Output
```json
{
  "score": 87,
  "reason": "Strong match for Java + Spring Boot backend role with REST API experience."
}
```

### Scoring Rules
- prioritize backend roles and fresher-friendly titles
- boost jobs posted in last 7 days
- penalize senior-only positions
- reject clearly irrelevant jobs

---

## 7) Implementation Roadmap (Step-by-Step)

1. **Foundation**
   - initialize Next.js + Express + MongoDB wiring
   - add env loading, logger, error middleware
2. **Data Layer**
   - add `JobApplication` model + unique index
   - add repository/service methods for upsert + status update
3. **Search Adapters**
   - implement source adapters (start with LinkedIn + YC + Lever/Greenhouse feeds where available)
4. **AI Matching**
   - add LLM client wrapper + strict JSON response parser
5. **Automation**
   - build safe LinkedIn Easy Apply runner with recovery
6. **Dashboard**
   - build sections: Top Matches, Easy Apply, Manual, Applied, Skipped, Recent
7. **Scheduler**
   - configure daily cron to run workflow + logs

---

## 8) Setup Guide

1. Install dependencies for frontend and backend
2. Configure `.env` from `.env.example`
3. Start MongoDB
4. Save LinkedIn session to `automation/auth.json` once manually
5. Run backend + frontend
6. Trigger daily workflow manually from API before enabling cron

---

## 9) Environment Variables

A ready template is included in **`.env.example`**.

---

## 10) Starter Code Structure (Minimal Bootstrap)

```js
// backend/src/app.js
const express = require("express");
const app = express();
app.use(express.json());
app.get("/health", (_, res) => res.json({ ok: true }));
module.exports = app;
```

```js
// backend/src/scheduler/dailyJobSync.js
const cron = require("node-cron");
function startDailyJobSync(runWorkflow) {
  cron.schedule(process.env.DAILY_CRON || "0 9 * * *", async () => {
    await runWorkflow();
  });
}
module.exports = { startDailyJobSync };
```

---

## 11) Best Practices

- Keep all business rules in services, not controllers
- Keep automation idempotent and resumable
- Use structured logs with run IDs for traceability
- Add explicit skip reasons for failed or unsafe auto-apply attempts
- Never auto-submit when confidence is low

---

## 12) Debugging Strategy

- Add per-run correlation ID (`workflowRunId`)
- Persist every stage summary (`fetched`, `deduped`, `scored`, `applied`, `skipped`)
- Save automation screenshots for failed apply attempts
- Keep dry-run mode for automation before real submit
- Expose `/api/workflow/run-daily?dryRun=true` for safe testing

---

## Initial Build Scope (as requested)

This repository now includes the requested step-by-step blueprint starting with:

1. architecture
2. folder structure
3. MongoDB schema
4. backend APIs
5. Playwright automation design
6. implementation plan
