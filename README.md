# supplements-open-data

> **Supplements Hub** – an open‑science effort to record *every* evidence–backed fact about dietary supplements in a fully auditable, machine‑readable format.

---

## 📖 What lives here

This repo is the **canonical dataset** for [supplementshub.io](https://supplementshub.io).  
Everything you read on the public site is built from these text files – no hidden database, no opaque edits.

*   **Open:** data licensed CC‑BY‑4.0, forkable and script‑friendly.  
*   **Traceable:** each claim is its own commit; every edit carries an author, timestamp, and DOI link.  
*   **Structured:** strict JSON Schemas let machines validate and re‑mix the data.

---

## 📂 Folder map

```
supplements-open-data/
├─ supplements/            # one folder = one supplement
│   └─ creatine/
│      ├─ meta.yml         # rigid identity fields
│      ├─ intro.mdx        # long‑form overview w/ footnotes
│      └─ images/
├─ claims/                 # append‑only evidence cards
│   └─ creatine/
│        ├─ 2022_kreider_strength.yml
│        └─ 1999_smith_dizziness.yml
├─ vocab/                  # controlled lists – categories, effects, timings…
│   ├─ categories.yml
│   └─ side-effects.yml
├─ papers/                 # auto‑fetched CSL‑JSON per DOI
│   └─ 10.1519_JSC.0b013e31825bb4f3.json
├─ schemas/                # JSON Schemas used in CI
│   ├─ meta.schema.json
│   ├─ claim.schema.json
│   └─ vocab.schema.json
└─ .github/
    ├─ PULL_REQUEST_TEMPLATE.md
    └─ workflows/
        └─ validate.yml
```

---

## 🗃️ Core file formats

### 1. `meta.yml`

| key            | type        | required | example                                    |
|----------------|------------|----------|--------------------------------------------|
| `slug`         | string      | ✔︎       | `creatine`                                 |
| `name`         | string      | ✔︎       | `Creatine Monohydrate`                     |
| `synonyms`     | string[]    | –       | `[creatine, creapure]`                     |
| `categories`   | slug[]      | –       | `[power, cognition]`                       |
| `default_dosage.amount` | number or string | – | `3–5` |
| `default_dosage.unit`   | slug        | – | `g`                                        |
| `default_dosage.timing` | slug        | – | `any`                                      |
| `cycle`        | boolean     | –       | `false`                                    |

### 2. `claims/*.yml`

```yaml
field: effect            # effect | dosage | sideEffect | timing | biomarker
kind: benefit | adverse | biomarker
value: ↑ bench‑press 1 RM
direction: positive      # omit when kind = adverse
paper: 10.1080/09637486.2022.2031537
confidence: 4           # meta=5, RCT=4, cohort=3…
contributor: "alice@lab.edu"
created: 2024‑05‑15
```

One file = **one supplement × one attribute × one paper**.  
Never edit in place – add a new file if a new study appears.

Schemas live in `schemas/` and are enforced by CI.

---

## ➡️ How to contribute

### 1. Via the web form (no Git skills)

1. Visit the supplement page and click **“Add evidence”**.  
2. Fill in the guided form (autocomplete for effects / side‑effects).  
3. Pass the CAPTCHA and submit.  
4. Our bot opens a pull request on your behalf; you’ll get a link for follow‑up.

### 2. Manually with a pull request

If you prefer raw Git or need batch edits:

1. Fork → create a branch.  
2. Add your claim file under `claims/<slug>/YYYY_author_key.yml`.  
3. If you introduce a brand‑new category/effect, append it to the relevant `vocab/*.yml`.  
4. Run `npm run validate` locally *(optional)*.  
5. Open a PR.  
   The template reminds you of required fields and licence checkbox.

### CI gate (applies to *every* PR)

* **Schema check** – AJV must pass.  
* **DOI resolve** – CrossRef 4xx fails.  
* **Text similarity** – MiniLM embedding vs paper abstract must score ≥ 0.15.  
* **Citations build** – Manubot renders footnotes without error.

Green checks = a maintainer reviews and merges.

---

## 🔍 Search & downstream use

* The public site mirrors this repo into Postgres nightly, generates a `tsvector`
  for fast full‑text search, and publishes JSON at `/api/supplements/{slug}`.  
* Feel free to scrape, clone, or periodically pull – just keep the CC‑BY attribution.

---

## 🛡️ Licence

* **Data** – [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (free to use with attribution).  
* **Code** – MIT in separate repos; not covered here.

---

## 💬 Get help / discuss

* Open an [Issue](https://github.com/YOUR_ORG/supplements-open-data/issues).  
* File PR comments inline – we’re friendly.  
* Email: [contact@supplementshub.io](mailto:contact@supplementshub.io)

*Building an evidence ecosystem together – thanks for contributing!*  
