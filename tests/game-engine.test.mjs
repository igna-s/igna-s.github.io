import test from "node:test";
import assert from "node:assert/strict";
import { cookingScore, cutScore, distributionScore, scoreOrder } from "../lib/game-engine.ts";

test("cooking rewards the sweet spot and punishes burning", () => {
  assert.ok(cookingScore(84) > cookingScore(50));
  assert.ok(cookingScore(84) > cookingScore(125));
});

test("distribution rewards coverage across the pizza", () => {
  const clustered = [
    { id: "react", x: 46, y: 47, rotation: 0 },
    { id: "react", x: 49, y: 48, rotation: 0 },
    { id: "react", x: 51, y: 50, rotation: 0 },
  ];
  const spread = [
    { id: "react", x: 28, y: 28, rotation: 0 },
    { id: "react", x: 72, y: 31, rotation: 0 },
    { id: "react", x: 35, y: 70, rotation: 0 },
    { id: "react", x: 70, y: 68, rotation: 0 },
  ];
  assert.ok(distributionScore(["react"], spread) > distributionScore(["react"], clustered));
});

test("cut score rewards centered, correct-count cuts", () => {
  const ideal = [
    { x1: 3, y1: 50, x2: 97, y2: 50 },
    { x1: 50, y1: 3, x2: 50, y2: 97 },
    { x1: 16, y1: 16, x2: 84, y2: 84 },
  ];
  assert.ok(cutScore(ideal, 6) >= 95);
  assert.ok(cutScore(ideal, 6) > cutScore([{ x1: 5, y1: 10, x2: 95, y2: 10 }], 6));
});

test("complete high-quality order produces three stars", () => {
  const required = ["react", "fastapi"];
  const placements = required.flatMap((id) => [
    { id, x: 25, y: 28, rotation: 0 }, { id, x: 72, y: 30, rotation: 0 },
    { id, x: 30, y: 70, rotation: 0 }, { id, x: 70, y: 68, rotation: 0 },
  ]);
  const result = scoreOrder({ required, placements, sauce: 88, cheese: 86, cook: 84,
    cuts: [{ x1: 3, y1: 50, x2: 97, y2: 50 }, { x1: 50, y1: 3, x2: 50, y2: 97 }],
    targetCuts: 4, patience: 98, mistakes: 0, multiplier: 1 });
  assert.equal(result.stars, 3);
  assert.ok(result.total > 3500);
});
