# Test Suite

This directory contains comprehensive tests for the validation script.

## Test Structure

- `validate.test.ts` - Main test file containing:
  - Unit tests for `safeTryCatch` utilities
  - Unit tests for `loadVocabulary` function  
  - Integration tests for `validateYAML` with vocabulary validation
- `fixtures/` - Test data files used by the test suite

## Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

The test suite covers:

✅ **Error handling utilities** - safeTryCatch functions  
✅ **Vocabulary loading** - YAML parsing and validation  
✅ **Schema validation** - JSON Schema compliance  
✅ **Vocabulary validation** - Effects and biomarkers field validation  
✅ **DOI validation** - HTTP requests (mocked)  
✅ **File parsing** - YAML file reading and parsing  

## Mocking

- `axios` is mocked for DOI validation tests
- Test fixtures provide controlled test data
- No external API calls are made during testing