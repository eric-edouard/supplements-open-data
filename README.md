# supplements-open-facts

> **Supplements Open Facts** – an open‑science catalogue of evidence about dietary supplements.  
> Every fact is traceable to a DOI and stored in plain text so humans *and* machines can audit it.

---

## 📖 What's inside?

* **Transparent** – Each claim is a commit with author, timestamp and paper link.  
* **Structured** – Strict JSON Schemas keep the facts machine‑friendly.  
* **Open** – Licensed CC‑BY‑4.0; fork it, analyse it, improve it.

---

## 📂 Top‑level layout

```
supplements-open-facts/
├─ supplements/
│   └─ <slug>/                  # one folder per supplement
│       ├─ meta.yml             # metadata
│       └─ claims/
│           ├─ effects/
│           ├─ biomarkers/
│           ├─ cycles/
│           ├─ interactions/
│           ├─ formulations/
│           ├─ toxicity/
│           ├─ synergies/
│           └─ addiction-withdrawal/
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
| `dosage_unit` | ✔︎ | microgram / milligram / gram / millilitre / IU  | `gram` |
| `created` | date | auto | |

Everything else lives in **claim files** so we always know which paper says what.

Example:
```yaml
slug: l-theanine
name: L-Theanine
synonyms: [theanine, suntheanine, liposomal theanine]
health_goals: [relaxation, focus]
dosage_unit: milligram
created: 2024-01-15
```

---

## 📑 Claim files – common keys

| key | req | notes |
|-----|-----|-------|
| `created` | ✔︎ | date created |
| `contributor` | ✔︎ | email / username |
| `paper` | ✔︎ | DOI |
| `misc` | - | free text |


Example: 
```yaml
created: 2024-05-18
contributor: alice@example.com
paper: 10.1038/s41586-2024-00001


# --- type‑specific keys follow ---
```

---

## 📚 Type‑specific keys & examples

### Effects `supplements/<slug>/claims/effects/*.yml`

| key | req | notes |
|-----|-----|-------|
| `effect` | ✔︎ | slug from vocab/effects.yml |
| `kind` | ✔︎ | intended / adverse / neutral |
| `direction` | ✔︎ | positive / negative / neutral |
| `description` | - | Free text describing the effect observed. |
| `strength` | ✔︎ | strong / moderate / weak / none (see Strength scale) |
| `p_value` | - | positive / negative / neutral |
| `effect_size` | - | free text |
| `dosage_min` | ✔︎ | number, must be lower than or equal to dosage_max |
| `dosage_max` | ✔︎ | number, must be higher than or equal to dosage_min |
| `timing` | - | [upon-waking / morning / afternoon / evening / bedtime / pre-meal / with-meal / post-meal / between-meals / empty-stomach / pre-exercise / intra-exercise / post-exercise] |

#### Strength scale

| strength | What it means (within this paper) |
|----------|-----------------------------------|
| **strong**   | Primary outcome, p < 0.05, adequate N |
| **moderate** | Significant secondary outcome or trend (0.05–0.10) |
| **weak**     | Non‑significant directional change |
| **none**     | Paper reports "no effect" |

Example: 
```yaml
# Common keys
created: 2024-05-18
contributor: alice@example.com
paper: 10.1038/s41586-2024-00001

# Effect keys
effect: muscle-strength
kind: intended
direction: positive
description: "Increases maximal voluntary contraction force"
strength: strong
p_value: 0.02
effect_size: "Cohen's d = 0.8"

# Effect Dosage keys
dosage_min: 3
dosage_max: 5
timing: pre-exercise

```

---

### Biomarkers `supplements/<slug>/claims/biomarkers/*.yml`

| key | req | notes |
|-----|-----|-------|
| `biomarker` | ✔︎ | slug from vocab/biomarkers.yml |
| `direction` | ✔︎ | positive / negative / neutral |
| `strength` | - | If applicable: strong / moderate / weak / none (see Strength scale) |
| `dosage_min` | ✔︎ | number, must be lower than or equal to dosage_max |
| `dosage_max` | ✔︎ | number, must be higher than or equal to dosage_min |
| `timing` | - | [upon-waking / morning / afternoon / evening / bedtime / pre-meal / with-meal / post-meal / between-meals / empty-stomach / pre-exercise / intra-exercise / post-exercise] |

Example: 
```yaml
# Common keys
created: 2024-05-18
contributor: alice@example.com
paper: 10.1038/s41586-2024-00001

# Biomarker keys
biomarker: blood-pressure
direction: positive

# Biomarker Dosage keys
min: 3
max: 5
timing: pre-exercise

```

---

### Cycles `supplements/<slug>/claims/cycles/*.yml`

| key | req | notes |
|-----|-----|-------|
| `cycle` | ✔︎ | none / suggested / recommended |
| `days_on_off` | cond. | number-number (if suggested or recommended) |
| `weeks_on_off` | cond. | number-number (if suggested or recommended) |
| `months_on_off` | cond. | number-number (if suggested or recommended) |

Example:
```yaml
# Common keys
created: 2024-05-18
contributor: alice@example.com
paper: 10.1038/s41586-2024-00001

# Cycle keys
cycle: suggested
days_on_off: 5-2 # weekdays, stop of week-ends
```

---

### Interactions  `supplements/<slug>/claims/interactions/*.yml`

| key | req | notes |
|-----|-----|-------|
| `target` | ✔︎ | compound it interacts with |
| `danger_level` | ✔︎ | low / mild / severe |
| `description` | - | free text |

```yaml
# Common keys
created: 2024-05-18
contributor: alice@example.com
paper: 10.1038/s41586-2024-00001

# Interaction keys
target: warfarin
danger_level: mild
description: May potentiate anticoagulant effect
```

---

### Formulations `supplements/<slug>/claims/formulations/*.yml`

| key | req | notes |
|-----|-----|-------|
| `formulation` | ✔︎ | interacts with |
| `change` | cond. | negative / slightly-negative / neutral / slightly-positive / positive /  |
| `change_percent` | cond. | change of effect strength |

> Either one of change or change_percent must be defined 

```yaml
# Common keys
created: 2024-05-18
contributor: alice@example.com
paper: 10.1038/s41586-2024-00001

# Formulation keys
formulation: liposomal
change_percent: 120
```


---

### Toxicity / upper‑limit `supplements/<slug>/claims/toxicity/*.yml`

| key | req | notes |
|-----|-----|-------|
| `threshold_amount` | ✔︎ | in the sam unit descrribted in <supplement>/meta.yml |
| `change` | cond. | negative / slightly-negative / neutral / slightly-positive / positive /  |
| `change_percent` | cond. | change of effect strength |


```yaml
threshold_amount: 1000
effect: ↑ gastrointestinal distress
population: adults
```

---

### Synergies `supplements/<slug>/claims/synergies/*.yml`

| key | req | notes |
|-----|-----|-------|
| `with_compound` | ✔︎ | with other supplement or free text |
| `strength` | cond | light / mild / strong |
| `change_percent` | cond | number |

> At least one of `strength` or `change_percent` must be defined

```yaml
with_compound: citrulline
strength: light
```

---

### Addiction / Withdrawal `supplements/<slug>/claims/addiction-withdrawal/*.yml`

| key | req | notes |
|-----|-----|-------|
| `symptom` | ✔︎ | free text describing the withdrawal symptom |
| `incidence_percent` | - | percentage of users experiencing the symptom |

Example:
```yaml
# Common keys
created: 2024-05-18
contributor: alice@example.com
paper: 10.1038/s41586-2024-00001

# Addiction / Withdrawal keys
symptom: rebound insomnia
incidence_percent: 20
```

---

## 🤝 How to contribute

### 1 Easy mode – web form

1. Visit a supplement page on **supplementshub.io** → click **"Add evidence".**  
2. Fill the form (DOI required).  
3. Our bot opens a pull‑request in this repo; follow the link.

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
