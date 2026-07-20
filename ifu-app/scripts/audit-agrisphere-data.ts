import { validateAgriSphereCorpus } from "../src/lib/agrisphere-validation";

const result = validateAgriSphereCorpus();

Object.entries(result.counts).forEach(([label, count]) => {
  console.log(`PASS count:${label} - ${count}`);
});

result.warnings.forEach((warning) => {
  console.warn(`WARN ${warning}`);
});

result.errors.forEach((error) => {
  console.error(`FAIL ${error}`);
});

console.log(
  `\nAgriSphere data audit: ${result.errors.length} errors, ${result.warnings.length} warnings.`,
);

process.exit(result.errors.length > 0 ? 1 : 0);
