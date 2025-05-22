import Ajv, { type ValidateFunction } from "ajv";
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

async function loadSchema(name: string): Promise<object> {
	const schemaPath = path.join(SCHEMA_DIR, `${name}.schema.json`);
	const raw = await fs.readFile(schemaPath, "utf-8");
	return JSON.parse(raw);
}

type ValidationError = {
	filePath: string;
	errors: { message: string }[];
};
async function validateYAML(
	filePath: string,
	validateFn: ValidateFunction,
	validateDOI = false,
): Promise<ValidationError | null> {
	try {
		const raw = await fs.readFile(filePath, "utf-8");
		const data = YAML.parse(raw);

		const valid = validateFn(data);
		if (!valid && validateFn.errors) {
			const errors = validateFn.errors.map((err) => ({
				message: err.message ?? "Unknown schema error",
			}));
			return { filePath, errors };
		}

		if (validateDOI && typeof data === "object" && data && "paper" in data) {
			try {
				const doiUrl = `https://doi.org/${(data as { paper: string }).paper}`;
				const res = await axios.head(doiUrl);
				if (res.status >= 400) {
					return {
						filePath,
						errors: [{ message: `DOI unreachable (${res.status})` }],
					};
				}
			} catch {
				return {
					filePath,
					errors: [{ message: "DOI unreachable" }],
				};
			}
		}

		return null;
	} catch (err: unknown) {
		return {
			filePath,
			errors: [{ message: `Parse error: ${(err as Error).message}` }],
		};
	}
}
async function runValidation() {
	const failures: ValidationError[] = [];

	// Meta files
	const metaSchema = await loadSchema("meta");
	const validateMeta = ajv.compile(metaSchema);
	const metaFiles = await glob(`${SUPP_DIR}/*/meta.yml`);
	for (const file of metaFiles) {
		const result = await validateYAML(file, validateMeta, false);
		if (result) failures.push(result);
	}

	// Claim types
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

	for (const type of types) {
		const schema = await loadSchema(type);
		const validateFn = ajv.compile(schema);
		const files = await glob(`${SUPP_DIR}/*/claims/${type}/*.yml`);
		for (const file of files) {
			const result = await validateYAML(file, validateFn, true);
			if (result) failures.push(result);
		}
	}

	// Output
	if (failures.length === 0) {
		console.log("✅ All files are valid.");
	} else {
		console.error(`❌ Found ${failures.length} invalid file(s):\n`);
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
