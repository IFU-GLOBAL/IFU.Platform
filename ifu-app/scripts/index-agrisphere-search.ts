import "dotenv/config";
import {
  agrisphereOpportunities,
  agrisphereSearchIndex,
} from "../src/lib/agrisphere-data";
import { replaceOpenSearchIndex } from "../src/lib/agrisphere-services";

async function main() {
  const result = await replaceOpenSearchIndex(
    agrisphereSearchIndex,
    agrisphereOpportunities,
  );

  console.log(`Indexed ${result.indexed} AgriSphere records into ${result.index}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
