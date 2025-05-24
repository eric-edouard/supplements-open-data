# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Supplements Open Facts is an open-science catalogue of evidence about dietary supplements. Each claim is backed by a DOI (Digital Object Identifier) and stored in YAML format for both human and machine readability.

## Commands

### Validation
```bash
npm run validate                    # Validate all YAML files against schemas
npm run validate file1.yml file2.yml  # Validate specific files only
```

### Testing
```bash
npm test                # Run tests once
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

### Utilities
```bash
npm run list:supplements         # List all supplement slugs
npm run list:supplements --name  # List all supplement names
```

## Architecture

### Data Structure
The project follows a strict hierarchical structure:
- Each supplement has its own directory under `supplements/<slug>/`
- Metadata is stored in `meta.yml` files
- Claims are organized by type in subdirectories under `claims/`
- All claim files follow the naming convention: `<publication-date>-<claim-subject>.yml`

### Validation System
The validation pipeline (`scripts/validate.ts`) performs:
1. Schema validation using JSON Schema (schemas in `schemas/`)
2. Vocabulary validation for effects and biomarkers against controlled lists in `vocab/`
3. DOI resolution check to ensure paper references are valid
4. Support for validating only changed files when specific paths are provided

### Key Data Types
- **Effects**: Intended/adverse/neutral effects with strength ratings
- **Biomarkers**: Measurable biological markers affected by supplements
- **Cycles**: Usage patterns (none/suggested/recommended)
- **Interactions**: Drug/compound interactions with danger levels
- **Formulations**: Different supplement forms and their effectiveness
- **Toxicity**: Upper limits and adverse effects at high doses
- **Synergies**: Beneficial combinations with other compounds
- **Addiction/Withdrawal**: Dependency and withdrawal symptoms

### Paper Quotes
All claim types support an optional `paper_quotes` field that allows contributors to include verbatim quotes from the research paper:
```yaml
paper_quotes:
  abstract:
    - "Quote from abstract"
  paper_content:
    - "Quote from paper body"
```

### Vocabulary Control
Effects and biomarkers must match entries in:
- `vocab/effects.yml`
- `vocab/biomarkers.yml`

This ensures consistency across all supplement entries.