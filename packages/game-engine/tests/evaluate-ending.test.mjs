import test from "node:test";
import assert from "node:assert/strict";
import { evaluateEnding } from "../src/index.ts";

test("returns truth when core clues and correct suspect are provided", () => {
  const result = evaluateEnding(
    {
      state: "deduction",
      turn: 5,
      accusation: "mina",
      collectedEvidence: ["a", "b", "c", "d", "x"],
      coreEvidenceKeys: ["a", "b", "c", "d"]
    },
    "mina",
    4
  );
  assert.equal(result, "truth");
});

test("returns timeout when turn is expired", () => {
  const result = evaluateEnding(
    {
      state: "explore",
      turn: 0,
      collectedEvidence: ["a"],
      coreEvidenceKeys: ["a"]
    },
    "mina",
    1
  );
  assert.equal(result, "timeout");
});
