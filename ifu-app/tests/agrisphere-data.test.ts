import assert from "node:assert/strict";
import test from "node:test";
import {
  agrisphereSearchIndex,
  searchAgriSphere,
  searchCategories,
} from "../src/lib/agrisphere-data";
import { validateAgriSphereCorpus } from "../src/lib/agrisphere-validation";

test("the representative AgriSphere corpus satisfies its validation contract", () => {
  const result = validateAgriSphereCorpus();
  assert.deepEqual(result.errors, []);
});

test("all seven search categories contain records", () => {
  assert.equal(searchCategories.length, 7);

  searchCategories.forEach((category) => {
    assert.ok(
      agrisphereSearchIndex.some((record) => record.category === category.id),
      `${category.id} should have at least one record`,
    );
  });
});

test("search normalizes queries and ranks an exact title first", () => {
  const result = searchAgriSphere({ query: "  Coffee  ", limit: 10 });

  assert.equal(result.query, "coffee");
  assert.equal(result.results[0]?.title, "Coffee");
});

test("search enforces category filters and the maximum result limit", () => {
  const result = searchAgriSphere({ category: "countries", limit: 5_000 });

  assert.ok(result.results.length <= 50);
  assert.ok(result.results.every((record) => record.category === "countries"));
});

test("invalid categories safely fall back to the all-category contract", () => {
  const result = searchAgriSphere({ category: "not-a-category", limit: 10 });

  assert.equal(result.category, "all");
});
