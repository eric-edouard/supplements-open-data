
# supplements-open-facts

> **Supplements Open Facts** – an open‑science catalogue of evidence about dietary supplements.  
> Every fact is traceable to a DOI and stored in plain text so humans *and* machines can audit it.

---

## 📖 What’s inside?

* **Transparent** – Each claim is a commit with author, timestamp and paper link.  
* **Structured** – Strict JSON Schemas keep the facts machine‑friendly.  
* **Open** – Licensed CC‑BY‑4.0; fork it, analyse it, improve it.

---

## 📂 Top‑level layout

```
supplements-open-facts/
├─ supplements/
│   └─ <slug>/                  # one folder per supplement
│       ├─ meta.yml             # metadatada
│       └─ claims/
│           ├─ effects/
│           ├─ dosages/
│           ├─ timings/
│           ├─ cycles/
│           ├─ interactions/
│           ├─ formulations/
│           ├─ toxicity/
│           ├─ onset-duration/
│           ├─ population-modifiers/
│           ├─ genetic-interactions/
│           ├─ synergies/
│           ├─ routes/
│           └─ withdrawal/
├─ vocab/                      # controlled term lists
├─ papers/                     # CSL-JSON blobs fetched per DOI
├─ schemas/                    # JSON Schemas used by CI
└─ .github/                    # CI workflows & templates
```

---

## 🗂️ Supplement metadata `meta.yml`

| key | type | required | example |
|-----|------|----------|---------|
| `slug` | string | ✔︎ | `creatine` |
| `name` | string | ✔︎ | `Creatine Monohydrate` |
| `synonyms` | string[] | – | `[creatine, creapure]` |
| `health_goals` | slug[] | – | `[power, cognition]` |
| `created` | date | auto | |

Everything else lives in **claim files** so we always know which paper says what.

---

## 📑 Claim files – common keys

| key | req | notes |
|-----|-----|-------|
| `created` | ✔︎ | date created |
| `contributor` | ✔︎ | email / username |
| `paper` | ✔︎ | DOI |

Example: 
```yaml
created: 2024-05-18
contributor: alice@example.com
paper: 10.1038/s41586-2024-00001 

# --- type‑specific keys follow ---
```

---

## 📚 Type‑specific keys & examples

### 1 Effects `claims/<slug>/effects/*.yml`

| key | req | notes |
|-----|-----|-------|
| `effect` | ✔︎ | slug from vocab/effects.yml |
| `kind` | ✔︎ | intended / adverse / neutral |
| `direction` | ✔︎ | positive / negative / neutral |
| `description` | ✔︎ | strong / moderate / weak / none (refer to the Strength Scale below) |
| `strength` | ✔︎ | intended / adverse / neutral |
| `p_value` | - | positive / negative / neutral |
| `effect_size` | - | free text |

#### Strength scale

| strength | What it means (within this paper) |
|----------|-----------------------------------|
| **strong**   | Primary outcome, p < 0.05, adequate N |
| **moderate** | Significant secondary outcome or trend (0.05–0.10) |
| **weak**     | Non‑significant directional change |
| **none**     | Paper reports “no effect” |

Example: 
```yaml
# ... common keys
TODO
```

---

### 2 Biomarkers`claims/<slug>/biomarkers/*.yml`

| key | req | notes |
|-----|-----|-------|
| `biomarker` | ✔︎ | slug from vocab/biomarkers.yml |
| `direction` | ✔︎ | positive / negative / neutral |


Example: 
```yaml
...common keys
biomarker: blood-pressure
direction: positive
```

---

### 3 Dosages `dosages/`

| key | req | notes |
|-----|-----|-------|
| `unit` | ✔︎ | microgram / milligram / gram / millilitre / IU  |
| `min` | ✔︎ | number |
| `max` | ✔︎ | number |
| `timing` | ✔︎ | [upon-waking / morning / afternoon / evening / bedtime / pre-meal / with-meal / post-meal / between-meals / empty-stomach / pre-exercise / intra-exercise / post-exercise] |
| `targeted_effects` | - | [slugs from vocab/effects.yml] |

Example: 
```yaml
# ... common keys
TODO
```

---

### 4 Cycles `cycles/`

| key | req | notes |
|-----|-----|-------|
| `cycle` | ✔︎ | none / suggested / recommended |
| `days_on` | cond. | number (if suggested or recommended) |
| `days_off` | cond. | number (if suggested or recommended) |

Example:
```yaml
# ... common keys
cycle: "suggested"
days_on: 60
days_off: 30   # meaning approx. 2 months on / 1 month off
```

---

### 5 Interactions `interactions/`

```yaml
target: warfarin  
description: May potentiate anticoagulant effect
```

---

### 6 Formulations `formulations/`

```yaml
formulation: liposomal
metric: AUC
change_percent: 110
```

---

### 7 Toxicity / upper‑limit `toxicity/`

```yaml
threshold_amount: 1000
unit: mg
effect: ↑ gastrointestinal distress
population: adults
```

---

### 8 Onset‑Duration `onset-duration/`

```yaml
goal: endurance
onset_minutes: 90
duration_hours: 6
```

---

### 9 Population modifiers `population-modifiers/`

```yaml
population: elderly
modifier: enhanced              # enhanced | reduced
description: Greater VO₂‑max improvement vs young adults
```

---

### 10 Genetic interactions `genetic-interactions/`

```yaml
genotype: COMT Val/Val
direction: negative
description: Blunted catechol response
```

---

### 11 Synergies `synergies/`

```yaml
with_compound: citrulline
direction: synergy              # synergy | antagonism
effect: ↑ peak power
change_percent: 12
```

---

### 12 Routes `routes/`

```yaml
route: sublingual
metric_change: 2× faster Cmax
```

---

### 13 Withdrawal `withdrawal/`

```yaml
symptom: rebound insomnia
incidence_percent: 20
```

*(Less common claim‑types are collapsed for brevity – see `/schemas` for full spec.)*

---

## 🤝 How to contribute

### 1 Easy mode – web form

1. Visit a supplement page on **supplementshub.io** → click **“Add evidence”.**  
2. Fill the form (DOI required).  
3. Pass CAPTCHA. Our bot opens a pull‑request in this repo; follow the link.

### 2 Power mode – pull request

1. Fork → create a branch.  
2. Drop your `.yml` into the correct sub‑folder.  
3. `npm install && npm run validate` to check against schemas.  
4. Open PR – template walks you through licence checkbox & strength selection.

### CI gates every PR

* JSON Schema ✔︎  
* DOI resolves ✔︎  
* Text–abstract similarity ≥ 0.15 ✔︎  
* CSL‑JSON auto‑fetched & citation compile ✔︎  

Green ticks → human review → merge.

---

## 📜 Licence

* **facts** – Creative Commons [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)  
  Feel free to use & remix; just credit *Supplements Hub*.  
* **Application code** lives in the private `suphub-app` repo (MIT).

---

## 💬 Need help?

* Open an [Issue](https://github.com/YOUR_ORG/supplements-open-facts/issues).  
* Email: [contact@supplementshub.io](mailto:contact@supplementshub.io)

*Thank you for keeping supplement science honest!*  
