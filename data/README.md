# Dashboard data feed — manual CSV

The dashboard reads two files:

- **`all_clients_daily.csv`** — the file you maintain. One row per (Date, Client, CampaignSegment).
  Overwrite it and the dashboard picks up the new numbers on reload. Nothing else needs to change.
- **`clients.json`** — static config: display names, the campaign segments each client has, which
  denominator each conversion rate uses, and the contractual target per client. Rarely changes.

## CSV columns

```
Date,Client,CampaignSegment,Calls,Contacts,Leads,Denom,ListSize,AvgSTLsec,PayrollHours
```

| Column | Meaning | Notes |
|---|---|---|
| `Date` | The activity date | `8/4/2026` or `2026-08-04`, both parse |
| `Client` | `OHS` / `SE` / `A1G` / `AGN` | case-insensitive |
| `CampaignSegment` | `FP5`, `PROB ENROLL`, `ACTIVE`, `RENEW`, `PRIORITY`, `STL` | every row is campaign-split; a blank still works and counts toward "Both" |
| `Calls` | Calls placed | |
| `Contacts` | Each client's own contacts convention | **the denominator of the headline conversion rate** — OHS enters net contacts (less Already Completed); see `definitions.md` |
| `Leads` | Leads generated | numerator of every rate |
| `Denom` | Dial attempts (OHS/SE/A1G) or quotes touched (AGN) | drives Leads/Dialed, and AGN's Leads/Quotes |
| `ListSize` | The campaign segment's **total record list size** | static; drives Leads/List |
| `AvgSTLsec` | Average speed-to-lead, in seconds | blank where not measured |
| `PayrollHours` | Payroll hours that day | blank renders an em dash |

Rows where `Calls`, `Contacts` and `Leads` are all blank are ignored, so the file can be
pre-seeded with a skeleton row for every day and filled in as you go.

## Rates are computed here, not in the sheet

Never store a percentage in the CSV. The dashboard divides for itself so every date range, campaign
combination and drill-down stays correct:

- **Leads ÷ ListSize** — the **client-facing** rate, and the headline number on every panel. How much of
  the whole record list has converted. Small and flat by nature. `ListSize` is cumulative, so it is
  never summed across dates: for a range, the latest value per segment is used, then summed across the
  selected segments. AGN uses `Denom` (quotes) instead, which *is* summed across dates.
- **Leads ÷ Contacts** — reported **internally only**, for standardisation across clients, so the panels
  label it "INTERNAL". AGN uses Calls, having no contacts metric. The convention behind Contacts
  differs per client, so each panel prints its own label — set in `clients.json` as `convLabel` /
  `statLabel` / `contactsLabel`, documented in `definitions.md`.
- **Leads ÷ Denom** — leads against dial attempts. Drill-down only, hidden for AGN.

"Both campaigns" sums the segment rows and recomputes each rate from the summed numerator and
denominator. It never averages two percentages.

## hourly.csv — the heatmap feed

Produced by **Call Details Aggregator.dc.html**: drop a DialedIn Call Details export onto that page and
it writes this file out. Nothing uploads; the parse happens in the browser.

```
Date,Client,CampaignSegment,Metric,H07,H08,…,H20
2026-08-04,OHS,FP5,contacts,0,4,17,22,…
2026-08-04,OHS,FP5,calls,2,31,58,61,…
2026-08-04,OHS,FP5,leads,0,0,2,3,…
```

One row per (Date, Client, CampaignSegment, Metric). `Metric` is `contacts`, `calls` or `leads`; the
heatmap reads `contacts` and falls back to `calls`. Hour columns are local time, clamped into the
first and last bucket. The dashboard reads the first 14 `H` columns it finds.

The same page also writes **daily-from-calls.csv** — Calls, Contacts and Leads per day per campaign in
`all_clients_daily.csv`'s exact column order, so those three columns don't have to be typed by hand.
Denom, ListSize, AvgSTLsec and AGN's rows still come from you.

## Which tabs appear

The drill-down only shows a tab once its data exists: OVERVIEW, TREND and CAMPAIGNS run off the daily
CSV alone; HEATMAP appears once `hourly.csv` has rows; BY REP and SE's BRANCHES need per-rep rows,
which nothing produces yet.

## Other files here

- `definitions.md` — what each client's numbers actually mean. Free-form, fill in as you learn.
- `august-prior-values.csv` — the 18 aggregate rows that were in the sheet before August was split by
  campaign. Reference only; the dashboard does not read it.
