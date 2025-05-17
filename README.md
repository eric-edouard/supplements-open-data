

# supplements-open-data

> **Supplements Hub Open Data** – a public, peer‑reviewed catalogue of evidence about dietary supplements.  
> Every fact lives in a small, human‑readable text file backed by at least one peer‑reviewed paper.

---

## 🚀 Why this repo exists
* **Transparency** – you can trace any statement on supplementshub.io back to a commit, author and DOI.  
* **Interoperability** – strict JSON Schemas allow effortless reuse in R, Python, or Excel.  
* **Community science** – anyone may contribute through a simple web form **or** a traditional pull‑request.

---

## 📂 Folder layout

```
supplements-open-data/
├─ supplements/            # one folder = one supplement
│   └─ creatine/
│      ├─ meta.yml         # basic identity & goals
│      └─ intro.mdx        # long‑form overview
├─ claims/                 # “evidence cards”, append‑only
│   └─ creatine/
│        ├─ 2022_kreider_strength.yml
│        ├─ 2023_li_dizziness.yml
│        └─ 2024_smith_preworkout_dose.yml
├─ vocab/                  # controlled lists (categories, effects…)
├─ papers/                 # auto‑fetched CSL‑JSON blobs per DOI
├─ schemas/                # JSON Schemas (meta, claim, vocab)
└─ .github/                # CI & templates
```

---

## 🗂️ Supplement metadata — `meta.yml`

| key                     | type        | required | example |
|-------------------------|------------|----------|---------|
| `slug`                  | string      | ✔︎ | `creatine` |
| `name`                  | string      | ✔︎ | `Creatine Monohydrate` |
| `synonyms`              | string[]    | – | `[creatine, creapure]` |
| `health_goals`          | slug[]      | – | `[power, cognition]` |
| `default_dosage.amount` | number\|string | – | `3‑5` |
| `default_dosage.unit`   | slug        | – | `g` |
| `default_dosage.timing` | slug        | – | `any` |
| `created`               | date        | auto | |

*Everything else (effects, alternate dosages, warnings, timings …) lives in **claims** so we always know “what paper says what”.*

---

## 📝 Claim files — the heart of the repo

> **One file = one supplement × one statement × one paper**

```yaml
# claims/creatine/2024_kreider_power.yml
field: effect                # effect | dosage | timing | cycle | interaction
kind: benefit                # benefit | adverse | biomarker   (only for field: effect)
value: ↑ bench‑press 1‑RM
direction: positive          # required for biomarker / benefit
context:                     # optional extra detail
  population: "trained males"
  use_case:  "short‑term power"
paper:
  doi: 10.1080/09637486.2024.2031537
  citation: |
    Kreider RB et al. *J Int Soc Sports Nutr.* 2024;21(2):123‑130.
confidence: 4                # see table below
created: 2024‑05‑17
contributor: alice@lab.edu
```

### Field cheat‑sheet

| `field`        | purpose | required keys in `value` |
|----------------|---------|--------------------------|
| `effect`       | Any physiological outcome. Use `kind` to tag positive benefit, adverse effect, or neutral biomarker. | free string or slug |
| `dosage`       | A numeric amount, unit, and optional schedule & use‑case. Supports *multiple* (sometimes conflicting) doses for different goals. | `amount`, `unit` *(slug)*, `schedule` |
| `timing`       | Best time to ingest; must reference slug in `vocab/timings.yml`. | slug |
| `cycle`        | Advice on continuous vs on/off cycling. | boolean or schedule description |
| `interaction`  | Precautionary warning: interaction with drug/supplement/condition. | `target` (slug), `description` |

### Confidence scale  `1 – 5`

| score | evidence type (highest quality first) |
|-------|---------------------------------------|
| **5** | Meta‑analysis or systematic review |
| **4** | Randomised controlled trial (RCT) |
| **3** | Prospective cohort / case–control |
| **2** | In‑vivo animal or small pilot human |
| **1** | In‑vitro / *in silico* / mechanistic |

CI verifies the paper’s CrossRef `type` and rejects inflated scores.

### Why no “side‑effect” field?

*Everything is an* **effect**, we merely label intent:

* `kind: benefit` – desirable outcome (↑ power, ↓ anxiety).  
* `kind: adverse` – undesirable (dizziness, GI upset).  
* `kind: biomarker` – neutral metric (↑ HDL, ↓ cortisol) whose desirability depends on context.  

Only `benefit` & `biomarker` need a `direction`.

---

## ✅ Contribution paths

### A) Web form (easiest)

1. Click **“Add evidence”** on any supplement page.  
2. Fill required fields; DOI is mandatory.  
3. Pass CAPTCHA → bot opens PR in your name.

### B) Manual pull‑request (power users)

1. Fork, branch, add your `claims/<slug>/YYYY_author_key.yml`.  
2. Use the JSON Schemas in `/schemas` (`npm run validate`).  
3. Commit & PR – template will guide you.  

**CI gates every PR identically**  
✔ Schema passes • DOI resolves • claim ↔ abstract similarity ≥ 0.15 • citation builds.

---

## 📜 Licence

* Data (`supplements‑open‑data` repo) — **Creative Commons BY‑4.0**  
  *Use it, cite it.*  
* All other Supplement Hub code remains proprietary MIT in separate repos.

---

## 💬 Need help?

* Open an Issue • ask a question • propose a schema tweak.  
* Email: [contact@supplementshub.io](mailto:contact@supplementshub.io)

*Thanks for keeping supplement science honest!*  
