import { glob } from "glob";
import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

// Unit mapping from old format to new enum values
const UNIT_MAPPING: Record<string, string> = {
  'mg': 'milligram',
  'milligram': 'milligram',
  'milligrams': 'milligram',
  'g': 'gram',
  'gram': 'gram',
  'grams': 'gram',
  'kg': 'kilogram',
  'kilogram': 'kilogram',
  'kilograms': 'kilogram',
  'mcg': 'microgram',
  'microgram': 'microgram',
  'micrograms': 'microgram',
  'μg': 'microgram',
  'iu': 'IU',
  'IU': 'IU',
  'mg/kg': 'mg/kg',
  'g/kg': 'g/kg'
};

interface MigrationStats {
  totalFiles: number;
  migratedFiles: number;
  skippedFiles: number;
  errorFiles: string[];
}

async function loadSupplementMeta(supplementPath: string): Promise<string> {
  try {
    const metaPath = path.join(supplementPath, 'meta.yml');
    const metaContent = await fs.readFile(metaPath, 'utf-8');
    const metaData = YAML.parse(metaContent);
    return metaData.dosage_unit || 'milligram'; // Default to milligram
  } catch (error) {
    console.warn(`Warning: Could not read meta.yml for ${supplementPath}, defaulting to milligram`);
    return 'milligram';
  }
}

function normalizeUnit(unit: string): string {
  const normalized = UNIT_MAPPING[unit.toLowerCase()];
  if (!normalized) {
    throw new Error(`Unknown unit: ${unit}`);
  }
  return normalized;
}

async function migrateClaimFile(filePath: string, defaultUnit: string): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = YAML.parse(content);
    
    // Check if file has old dosage format
    const hasDosageMin = 'dosage_min' in data;
    const hasDosageMax = 'dosage_max' in data;
    const hasNewDosage = 'dosage' in data && typeof data.dosage === 'object';
    
    // Skip if no old dosage fields or already migrated
    if (!hasDosageMin && !hasDosageMax) {
      return false; // No migration needed
    }
    
    if (hasNewDosage) {
      console.warn(`File ${filePath} already has new dosage format, skipping`);
      return false;
    }
    
    // Determine the unit to use
    let unit = defaultUnit;
    if ('dosage_unit' in data) {
      unit = normalizeUnit(data.dosage_unit);
      delete data.dosage_unit; // Remove old unit field
    } else {
      unit = normalizeUnit(unit);
    }
    
    // Create new dosage object
    const newDosage: any = { unit };
    
    if (hasDosageMin && hasDosageMax) {
      // Range format
      newDosage.min = data.dosage_min;
      newDosage.max = data.dosage_max;
      
      // If min == max, use single value format instead
      if (data.dosage_min === data.dosage_max) {
        delete newDosage.min;
        delete newDosage.max;
        newDosage.value = data.dosage_min;
      }
    } else if (hasDosageMin) {
      // Only min value
      newDosage.value = data.dosage_min;
    } else if (hasDosageMax) {
      // Only max value
      newDosage.value = data.dosage_max;
    }
    
    // Replace old fields with new dosage object
    delete data.dosage_min;
    delete data.dosage_max;
    data.dosage = newDosage;
    
    // Write back to file
    const newContent = YAML.stringify(data, {
      lineWidth: 0,
      minContentWidth: 0
    });
    await fs.writeFile(filePath, newContent, 'utf-8');
    
    console.log(`✅ Migrated: ${path.relative(process.cwd(), filePath)}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error);
    throw error;
  }
}

async function migrateDosageFormat(specificFiles?: string[]): Promise<void> {
  const stats: MigrationStats = {
    totalFiles: 0,
    migratedFiles: 0,
    skippedFiles: 0,
    errorFiles: []
  };
  
  console.log('🔄 Starting dosage format migration...\n');
  
  try {
    let filesToProcess: string[];
    
    if (specificFiles && specificFiles.length > 0) {
      // Process specific files
      filesToProcess = specificFiles;
      console.log(`Processing ${specificFiles.length} specific file(s)...\n`);
    } else {
      // Find all claim files
      const claimFiles = await glob('supplements/*/claims/*/*.yml');
      filesToProcess = claimFiles;
      console.log(`Found ${claimFiles.length} claim files to check...\n`);
    }
    
    // Group files by supplement to load meta.yml once per supplement
    const filesBySupplement = new Map<string, string[]>();
    
    for (const file of filesToProcess) {
      const pathParts = file.split('/');
      if (pathParts.length >= 3 && pathParts[0] === 'supplements') {
        const supplementName = pathParts[1];
        if (!filesBySupplement.has(supplementName)) {
          filesBySupplement.set(supplementName, []);
        }
        filesBySupplement.get(supplementName)!.push(file);
      }
    }
    
    // Process files by supplement
    for (const [supplementName, files] of filesBySupplement) {
      console.log(`📦 Processing ${supplementName} (${files.length} files)...`);
      
      // Load default unit from meta.yml
      const supplementPath = path.join('supplements', supplementName);
      const defaultUnit = await loadSupplementMeta(supplementPath);
      
      for (const file of files) {
        stats.totalFiles++;
        
        try {
          const wasMigrated = await migrateClaimFile(file, defaultUnit);
          if (wasMigrated) {
            stats.migratedFiles++;
          } else {
            stats.skippedFiles++;
          }
        } catch (error) {
          stats.errorFiles.push(file);
          console.error(`❌ Failed to migrate ${file}:`, error);
        }
      }
      
      console.log(''); // Empty line for readability
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
  
  // Print summary
  console.log('📊 Migration Summary:');
  console.log(`   Total files processed: ${stats.totalFiles}`);
  console.log(`   Successfully migrated: ${stats.migratedFiles}`);
  console.log(`   Skipped (no migration needed): ${stats.skippedFiles}`);
  console.log(`   Errors: ${stats.errorFiles.length}`);
  
  if (stats.errorFiles.length > 0) {
    console.log('\n❌ Files with errors:');
    for (const file of stats.errorFiles) {
      console.log(`   - ${file}`);
    }
    process.exit(1);
  }
  
  if (stats.migratedFiles > 0) {
    console.log('\n✅ Migration completed successfully!');
    console.log('\n🔍 Next steps:');
    console.log('   1. Run: npm run validate');
    console.log('   2. Review changes: git diff');
    console.log('   3. Commit changes if validation passes');
  } else {
    console.log('\n✅ No files needed migration.');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const specificFiles = args.length > 0 ? args : undefined;

// Run migration
migrateDosageFormat(specificFiles);