repo: elite-call/priority-clients-dash
branch: main

## Last sync

date: 2026-08-17T21:12:08Z

### Updated in this project

- Read the repo tree; it is effectively empty (only a stale `data/ohs.json` and a `data/_scratch/` file), so nothing was imported.
- The project's three screens were built here, not from repo source — the repo is the deployment target.
- Project is packaged for the user to commit and serve via GitHub Pages from the repo root.
- `data/ohs.json` in the repo is a leftover from the retired schema-1 feed; the dashboard no longer reads per-client JSON and it can be deleted.

## Screen map

| Screen | Repo files |
|---|---|
| index.html | — (new, deployment landing page) |
| Priority Client Dashboard.dc.html | — (reads data/clients.json, data/all_clients_daily.csv, data/hourly.csv, data/reps.csv, data/branches.csv) |
| Daily Data Ingestion.dc.html | — (writes the browser cache the dashboard reads; exports the data/ CSVs) |
| Call Details Aggregator.dc.html | — (produces data/hourly.csv) |
| campaign-rules.js | — (shared campaign substring + disposition rules) |

## Notes

Deployment layout expected at the repo root:

```
index.html
support.js
campaign-rules.js
Priority Client Dashboard.dc.html
Daily Data Ingestion.dc.html
Call Details Aggregator.dc.html
assets/            agn logo
uploads/           Elite Call + Service Experts logos, speed-to-lead art
data/              clients.json, all_clients_daily.csv, hourly.csv, reps.csv, branches.csv
```

All three screens share one browser's localStorage (`ec_ingest_cache_v1`), so ingesting on a machine
updates the dashboard on that machine. The committed `data/` CSVs are the fallback any other device
(the wall display) reads.
