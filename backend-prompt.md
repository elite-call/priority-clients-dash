> **Superseded, Aug 17 2026.** The dashboard now reads a hand-maintained CSV
> (`data/all_clients_daily.csv`, contract in `data/README.md`) instead of a generated JSON feed.
> Sections 2, 3 and 5 below still describe what the automated pipeline should eventually produce —
> and section 2's missing-denominator problem is exactly what made conversion read wrong — but the
> nightly chain is not the dashboard's source of truth today.

# Backend → dashboard mapping brief

For the Apps Script / Sheets chat. This is what the dashboard consumes, what it can't get yet, and
the decisions already made on the design side. Full JSON contract: `data/README.md` (schema 2).

## 1. Deliverable: four static JSON files

Add a final step to the nightly chain, after `runCompiledSummary`, that writes and commits:

`ohs.json`, `se.json`, `agn.json`, `a1g.json`

One file per client, each with two arrays:

- **`daily`** — one row per (Date, CampaignSegment), straight from `All_Clients_Daily`. Every headline
  number on the dashboard comes from here.
- **`detail`** — one row per (Date, CampaignSegment, Branch) carrying the 14-bucket hourly breakdown
  and the per-rep rows, from `*_Days` / `*_Reps` / Call Details. Feeds the rep leaderboard, SE's
  branch table, and the heatmap only.

Splitting them this way means branch and rep splits can never double-count a campaign-level figure
like `contactsCampaign`.

## 2. Two columns we need added to `All_Clients_Daily`

The dashboard recomputes both conversion rates itself for every date range, segment combination, and
drill-down. It cannot do that from `ConversionTotals` / `ConversionContacts`, because those are ratios
and the row doesn't carry either denominator. Please add:

- **`ListSize`** — the campaign segment's total record list size, the denominator behind
  `ConversionTotals`. (Likely already available as DialedIn's "Total Leads" column.)
- **`ContactsCampaign`** — DialedIn's campaign-level Contacts figure used for `ConversionContacts`,
  kept as its own column so it stays distinct from the rep-summed `Contacts` already in the row.

Keep `ConversionTotals` / `ConversionContacts` in the sheet for humans reading it; the dashboard
ignores them and divides for itself.

How the dashboard treats them, please confirm this matches your intent:

- `ListSize` is cumulative and static, so it is **never summed across dates** — for a range, the
  latest date's `ListSize` per segment is taken, then summed across the selected segments.
- `ContactsCampaign` **is** summed across dates.
- AGN has neither, so AGN uses `Denom` (quotes) for totals conversion and `Calls` for contacts
  conversion, exactly as section 3 of your brief describes.

## 3. Call Details → heatmap

Decided: the heatmap shows **contacts per hour** by weekday, in **14 buckets from 7:00am to 8:00pm**.
Reachability by time of day is the question worth answering there; raw dial volume isn't.

Send it pre-aggregated, not as raw call rows — one `detail` row per (date, segment, branch) with three
14-element arrays, `hours.calls`, `hours.contacts`, `hours.leads`. Same information for this view,
a file that stays small, and it never grows unbounded. Raw Call Details rows would be megabytes
within a few months.

Open items on our side:

1. **Timezone.** Buckets must be one fixed zone. Assuming **CST** — confirm whether DialedIn's Call
   Details timestamps are already local or UTC and need shifting.
2. **Disposition mapping.** "Contacts per hour" and "leads per hour" need the list of DialedIn
   disposition strings that count as a contact, and the ones that count as a lead. Whatever
   definition the Contacts and Leads columns already use is what we want, applied per call.
3. **Calls outside 7am–8pm.** Clamp them into the first/last bucket rather than dropping them, and
   flag if a meaningful share falls outside the window — we'd widen the grid.
4. **Segment on each call.** Call Details rows need `CampaignSegment`, or a campaign → segment lookup
   we can apply, so the heatmap follows the panel's Campaign dropdown.
5. **Rep on each call**, so the heatmap still responds to rep drill-down.
6. **Retention.** `detail` should be a rolling 90 days. `daily` keeps full history.

## 4. Rep-level views stay

The BY REP tab, rep drill-down, and the top-reps card all stay in the dashboard, so `OHS_Reps` /
`SE_Reps` / `A1G_Reps` need to be exported into the `detail` rows: `[name, calls, contacts, leads]`,
plus a 5th element for that rep's average speed-to-lead where it exists.

## 5. Segments

Dropdown labeled **Campaign** on each panel, independent per client, defaulting to **Both**, which
sums the segments and recomputes ratios from the summed numerators and denominators.

| Client | Option A | Option B |
|---|---|---|
| OHS | FP5 | PROB ENROLL |
| A1G | PRIORITY | STL |
| SE | ACTIVE | RENEW |
| AGN | — | — |

**AGN hides the dropdown entirely.** Its source has no segment breakdown, so a disabled control would
just be furniture. Its single `"stl"` placeholder segment is still what the rows carry.

SE keeps two dimensions: the segment dropdown (ACTIVE / RENEW) and the existing branch drill-down,
which reads `detail` rows' `branch` field.

Pre-2026-08-18 rows with blank `CampaignSegment` are handled: they count toward Both and toward all
totals, and are excluded when a single segment is picked. The dashboard labels this in the UI rather
than silently dropping them.

## 6. Zoho is out

Next Call Date, Most Recent Note, Account Manager, and Main Contact are removed from the dashboard.
`crm.json` is deleted. That footer strip now shows contractual conversion target vs actual, sourced
from `target` in each file:

```
"target": {"label": "FP5 list conversion · 3-pass", "pct": 14, "actualPct": null}
```

`pct` is the contractual target. `actualPct` is the multi-week, all-3-passes conversion from the
**campaign-level tracker** — the backlog connector that measures against a campaign's entire record
list. It is `null` today and the dashboard shows an em dash plus "tracker not yet wired". Wiring that
connector into the nightly chain is the one thing that would light this strip up, and it's the metric
these clients are actually held to, so it's worth pulling forward.

## 7. Payroll hours

No source. The dashboard renders an em dash rather than inventing a number. When a source exists,
add `hours` (a number) to each `daily` row and it will start populating with no UI change.

## 8. Freshness

Each file's `updated` is the timestamp of the pipeline run that produced it. The dashboard header
reads it so a stalled 8pm chain is visible on the wall display instead of silently showing
yesterday's numbers as today's.
