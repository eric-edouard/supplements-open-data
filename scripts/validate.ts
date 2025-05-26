import fs from 'node:fs/promises'
import path from 'node:path'
import Ajv, { type ValidateFunction } from 'ajv'
import addFormats from 'ajv-formats'
import axios from 'axios'
import { glob } from 'glob'
import YAML from 'yaml'

export function safeTryCatch<T>(fn: () => T): [Error | null, T | null] {
  try {
    const result = fn()
    return [null, result]
  } catch (error) {
    return [error as Error, null]
  }
}

export async function safeTryCatchAsync<T>(
  fn: () => Promise<T>,
): Promise<[Error | null, T | null]> {
  try {
    const result = await fn()
    return [null, result]
  } catch (error) {
    return [error as Error, null]
  }
}

const SCHEMA_DIR = path.join(process.cwd(), 'schemas')
const SUPP_DIR = path.join(process.cwd(), 'supplements')
const VOCAB_DIR = path.join(process.cwd(), 'vocab')

const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)

export async function loadSchema(name: string): Promise<object> {
  const schemaPath = path.join(SCHEMA_DIR, `${name}.schema.json`)
  const raw = await fs.readFile(schemaPath, 'utf-8')
  return JSON.parse(raw)
}

export async function loadVocabulary(name: string, vocabDir = VOCAB_DIR): Promise<string[]> {
  const vocabPath = path.join(vocabDir, `${name}.yml`)
  const [readError, raw] = await safeTryCatchAsync(() => fs.readFile(vocabPath, 'utf-8'))
  if (readError) {
    throw new Error(`Failed to load vocabulary ${name}: ${readError.message}`)
  }

  if (!raw) {
    throw new Error(`Vocabulary ${name} is empty`)
  }

  const [parseError, data] = safeTryCatch(() => YAML.parse(raw))
  if (parseError) {
    throw new Error(`Failed to parse vocabulary ${name}: ${parseError.message}`)
  }

  if (!Array.isArray(data)) {
    throw new Error(`Vocabulary ${name} must be an array of strings`)
  }

  return data as string[]
}

export type ValidationError = {
  filePath: string
  errors: { message: string }[]
}

export async function validateYAML(
  filePath: string,
  validateFn: ValidateFunction,
  validateDOI = false,
  vocabularyValidation?: { field: string; vocabulary: string[] },
): Promise<ValidationError | null> {
  const [readError, raw] = await safeTryCatchAsync(() => fs.readFile(filePath, 'utf-8'))
  if (readError) {
    return {
      filePath,
      errors: [{ message: `Read error: ${readError.message}` }],
    }
  }

  if (!raw) {
    return {
      filePath,
      errors: [{ message: 'File is empty' }],
    }
  }

  const [parseError, data] = safeTryCatch(() => YAML.parse(raw))
  if (parseError) {
    return {
      filePath,
      errors: [{ message: `Parse error: ${parseError.message}` }],
    }
  }

  const valid = validateFn(data)
  if (!valid && validateFn.errors) {
    const errors = validateFn.errors.map(err => ({
      message: err.message ?? 'Unknown schema error',
    }))
    return { filePath, errors }
  }

  if (
    vocabularyValidation &&
    typeof data === 'object' &&
    data &&
    vocabularyValidation.field in data
  ) {
    const fieldValue = (data as Record<string, unknown>)[vocabularyValidation.field]
    if (typeof fieldValue === 'string' && !vocabularyValidation.vocabulary.includes(fieldValue)) {
      return {
        filePath,
        errors: [
          {
            message: `Invalid ${vocabularyValidation.field}: '${fieldValue}' not found in vocabulary`,
          },
        ],
      }
    }
  }

  if (validateDOI && typeof data === 'object' && data && 'paper' in data) {
    const doiUrl = `https://doi.org/${(data as { paper: string }).paper}`
    const [doiError, res] = await safeTryCatchAsync(() => axios.head(doiUrl))
    if (doiError || (res && res.status >= 400)) {
      return {
        filePath,
        errors: [{ message: 'DOI unreachable' }],
      }
    }
  }

  return null
}

async function runValidation(specificFiles?: string[]) {
  const failures: ValidationError[] = []

  // Load vocabularies
  const effectsVocab = await loadVocabulary('effects')
  const biomarkersVocab = await loadVocabulary('biomarkers')

  // If specific files are provided, only validate those
  if (specificFiles && specificFiles.length > 0) {
    console.log(`Validating ${specificFiles.length} changed file(s)...`)

    for (const filePath of specificFiles) {
      // Determine file type based on path
      if (filePath.includes('/meta.yml')) {
        const metaSchema = await loadSchema('meta')
        const validateMeta = ajv.compile(metaSchema)
        const result = await validateYAML(filePath, validateMeta, false)
        if (result) failures.push(result)
      } else if (filePath.includes('/claims/')) {
        // Extract claim type from path
        const claimTypeMatch = filePath.match(/\/claims\/([^\/]+)\//)
        if (claimTypeMatch) {
          const type = claimTypeMatch[1]
          try {
            const schema = await loadSchema(type)
            const validateFn = ajv.compile(schema)

            // Determine vocabulary validation
            let vocabularyValidation: { field: string; vocabulary: string[] } | undefined
            if (type === 'effects') {
              vocabularyValidation = { field: 'effect', vocabulary: effectsVocab }
            } else if (type === 'biomarkers') {
              vocabularyValidation = {
                field: 'biomarker',
                vocabulary: biomarkersVocab,
              }
            }

            const result = await validateYAML(filePath, validateFn, true, vocabularyValidation)
            if (result) failures.push(result)
          } catch (error) {
            failures.push({
              filePath,
              errors: [{ message: `Unknown claim type: ${type}` }],
            })
          }
        }
      }
    }
  } else {
    // Original full validation logic
    console.log('Running full validation...')

    // Meta files
    const metaSchema = await loadSchema('meta')
    const validateMeta = ajv.compile(metaSchema)
    const metaFiles = await glob(`${SUPP_DIR}/*/meta.yml`)
    for (const file of metaFiles) {
      const result = await validateYAML(file, validateMeta, false)
      if (result) failures.push(result)
    }

    // Claim types
    const types = [
      'effects',
      'biomarkers',
      'cycles',
      'interactions',
      'formulations',
      'toxicity',
      'synergies',
      'addiction-withdrawal',
    ]

    for (const type of types) {
      const schema = await loadSchema(type)
      const validateFn = ajv.compile(schema)
      const files = await glob(`${SUPP_DIR}/*/claims/${type}/*.yml`)

      // Determine vocabulary validation
      let vocabularyValidation: { field: string; vocabulary: string[] } | undefined
      if (type === 'effects') {
        vocabularyValidation = { field: 'effect', vocabulary: effectsVocab }
      } else if (type === 'biomarkers') {
        vocabularyValidation = {
          field: 'biomarker',
          vocabulary: biomarkersVocab,
        }
      }

      for (const file of files) {
        const result = await validateYAML(file, validateFn, true, vocabularyValidation)
        if (result) failures.push(result)
      }
    }
  }

  // Output
  if (failures.length === 0) {
    console.log('✅ All files are valid.')
  } else {
    console.error(`❌ Found ${failures.length} invalid file(s):\n`)
    for (const fail of failures) {
      console.error(`🔴 ${fail.filePath}`)
      for (const err of fail.errors) {
        console.error(`  → ${err.message}`)
      }
    }
    process.exit(1)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const specificFiles = args.length > 0 ? args : undefined

runValidation(specificFiles)
