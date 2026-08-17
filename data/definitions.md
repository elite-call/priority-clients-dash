# Metric definitions per client

The denominator for conversion is not standardised across these four clients, so this file records what
each number actually means. Fill in whatever you know, whenever — nothing here breaks the dashboard.
The labels the dashboard prints come from `clients.json` (`convLabel`, `convShort`, `contactsLabel`,
`note`); tell me what to change and I'll move them across.

## OHS — Oncourse Home Solutions

- **Contacts column holds:** a version of Contacts with all *Already Completed* subtracted. Dashboard
  calls this "net contacts".
- **Where it comes from:** the account manager's Google Sheet, updated by hand after a dial is seen.
  No timestamps on the changes, so a given day's figure can move after the fact.
- **Denom:**
- **ListSize:**
- **Anything else:**

## SE — Service Experts

- **Contacts column holds:**
- **Denom:**
- **ListSize:**
- **Anything else:**

## A1G — A1 Garage Door Service

- **Contacts column holds:**
- **Denom:**
- **ListSize:**
- **Speed-to-lead:** company-wide average across all A1G leads, not filtered to the STL campaign.
- **Anything else:**

## AGN — Auto Glass Now

- **Contacts:** not tracked. Conversion uses Calls as the denominator.
- **Denom:** quotes touched.
- **Speed-to-lead:** confirmed correct — 3 to 24 minutes against a 60s target. The dashboard shows it
  in minutes above 120s and colours it over-target, which is accurate rather than flattering.
- **Anything else:**

## Open questions

1. Since OHS's net-contacts figure has no timestamps and can change after the fact, should the
   dashboard show anything about staleness for OHS specifically?
2. Do SE, A1G and AGN each have their own contacts convention too, or is OHS the only exception?
