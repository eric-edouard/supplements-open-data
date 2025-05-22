import Ajv from "ajv";
import addFormats from "ajv-formats";
import axios from "axios";
import { glob } from "glob";
import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

const SCHEMA_DIR = path.join(process.cwd(), "schemas");
const SUPP_DIR = path.join(process.cwd(), "supplements");

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

async function loadSchema(type: string) {
	const schemaPath = path.join(SCHEMA_DIR, `${type}.schema.json`);
	const raw = await fs.readFile(schemaPath, "utf-8");
	return JSON.parse(raw);
}

async function validateClaim(filePath: string, type: string, validateFn: any) {
	try {
		const raw = await fs.readFile(filePath, "utf-8");
		const data = YAML.parse(raw);

		const valid = validateFn(data);
		if (!valid) {
			return { filePath, errors: validateFn.errors };
		}

		// Validate DOI accessibility
		if (data.paper) {
			const doiUrl = `https://doi.org/${data.paper}`;
			try {
				const res = await axios.head(doiUrl);
				if (res.status >= 400) {
					return {
						filePath,
						errors: [{ message: `DOI unreachable (${res.status})` }],
					};
				}
			} catch {
				return { filePath, errors: [{ message: `DOI unreachable` }] };
			}
		}

		return null;
	} catch (err: any) {
		return { filePath, errors: [{ message: `Parse error: ${err.message}` }] };
	}
}

async function runValidation() {
	const types = [
		"effects",
		"biomarkers",
		"cycles",
		"interactions",
		"formulations",
		"toxicity",
		"synergies",
		"addiction-withdrawal",
	];

	const failures: any[] = [];

	for (const type of types) {
		const files = await glob(`${SUPP_DIR}/*/claims/${type}/*.yml`);
		const schema = await loadSchema(type);
		const validateFn = ajv.compile(schema);

		for (const file of files) {
			const result = await validateClaim(file, type, validateFn);
			if (result) failures.push(result);
		}
	}

	if (failures.length === 0) {
		console.log("✅ All claim files are valid.");
	} else {
		console.error(`❌ Found ${failures.length} invalid files:\n`);
		for (const fail of failures) {
			console.error(`🔴 ${fail.filePath}`);
			for (const err of fail.errors) {
				console.error(`  → ${err.message}`);
			}
		}
		process.exit(1);
	}
}

runValidation();
