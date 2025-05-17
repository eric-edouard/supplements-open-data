# supplements-open-data

> A public, peer-reviewed database of supplement claims in structured YAML format. Every effect, dosage, and side effect is backed by a scientific source.

## 📖 Overview

This repository is the canonical source of truth for [SupplementsHub](https://supplementshub.io) — an open science project to build the web’s most trustworthy supplement database.

Each supplement lives in its own folder and contains a set of versioned `*.claim.yaml` files. Each file represents a specific claim, backed by a DOI and written in a structured, machine-readable format.

We prioritize transparency, auditability, and community contribution.

---

## 📁 Folder Structure

```
supplements-open-data/
├── creatine/
│   ├── 2024-05-01-lowers-fatigue.yaml
│   └── 2024-05-03-increases-power.yaml
├── ashwagandha/
│   └── 2024-04-28-reduces-cortisol.yaml
└── magnesium/
    └── ...
```

Each `*.yaml` file follows a standard schema and includes:
- `effect` or `side_effect`
- `dose`, `timing` (optional)
- `source`: a resolvable DOI
- `claim`: a brief, abstract-compatible description

---

## ✅ Example Claim File

```yaml
effect: "Improves sleep quality"
supplement: "magnesium"
dose: "400 mg daily"
timing: "Before bed"
source: "10.1016/j.jpsychires.2020.09.007"
claim: "Supplementation with 400 mg magnesium daily improved subjective sleep quality in older adults with insomnia."
```

---

## 🔧 Contributing

Anyone can contribute claims through our form at [supplementshub.io/contribute](https://supplementshub.io/contribute).

Pull requests are auto-generated and validated by CI:
- The DOI must resolve.
- The claim text must match the source abstract.
- YAML must pass schema checks.

All PRs are human-reviewed before merge.

---

## 📜 License

All claim data is published under the [CC BY 4.0 License](https://creativecommons.org/licenses/by/4.0/). You are free to use and remix with attribution.

---

## 💬 Join the Community

Have feedback or want to discuss claims? Join our open discussions in the [Issues](https://github.com/YOUR_ORG/supplements-open-data/issues) section, or contact us at [contact@supplementshub.io](mailto:contact@supplementshub.io).
