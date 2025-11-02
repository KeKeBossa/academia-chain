# Monitoring & Security Plan

## Monitoring Scope (F-Admin-3)

- **Metrics**
  - API throughput & error rate per route (`/api/auth/did`, `/api/assets`, `/api/collaboration/posts`).
  - Proposal lifecycle counts (active, succeeded, defeated) via Prisma queries.
  - Research asset submissions & collaboration post volume (7-day rolling).
  - Event sync lag using `EventSyncState.lastProcessedBlock` vs latest RPC block.
- **Integrations**
  - Export Prometheus-style metrics via Next.js API (`/api/admin/metrics` extension) – pending implementation.
  - Push aggregated metrics to Supabase/Postgres via background worker.
  - Hook into DataDog/Prometheus after metrics API is stable.
- **Dashboards**
  - Extend existing AdminDashboardPanel with charts (line chart for submissions, pie for proposal status).
  - Provide Grafana dashboard definitions once Prometheus endpoint exists.

## Security Tooling Roadmap (F-Sec-3)

- **Smart Contracts**
  - Add `npm run audit:slither` running `slither .` via dockerized tool.
  - Integrate `openzeppelin-contracts` compatibility checks.
- **Static Analysis**
  - Introduce `npm run lint:security` leveraging `eslint-plugin-security` for Next.js API.
  - Evaluate `bandit` equivalent for TypeScript (ESLint security rules + dependency audit).
- **CI Integration**
  - Update `.github/workflows/ci.yml` to run security commands (invert to matrix job for lint/test/security).
  - Fail pipeline on high severity findings.
- **Audit Trail**
  - Maintain findings in `docs/security-audit-log.md` with resolution status.

## Next Steps

1. Implement metrics exporter API and Supabase writer.
2. Add Slither container job + ESLint security preset to package scripts.
3. Configure alerts (email/Slack) once metrics sink established.
