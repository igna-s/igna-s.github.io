import test from "node:test";
import assert from "node:assert/strict";
import { INGREDIENTS, RECIPES, toppingSpriteById } from "../lib/game-data.ts";
import { gameReducer, initialState, isPrepComplete } from "../lib/game-state.ts";

const reduce = (state, action) => gameReducer(state, action);

test("every technology has a valid recipe and a distinct sprite slot", () => {
  const spriteSlots = new Set();
  for (const ingredient of INGREDIENTS) {
    const sprite = toppingSpriteById.get(ingredient.id);
    assert.ok(sprite, `missing sprite for ${ingredient.id}`);
    const slot = `${sprite.sheet}-${sprite.index}`;
    assert.equal(spriteSlots.has(slot), false, `duplicate sprite for ${ingredient.id}`);
    spriteSlots.add(slot);
  }
  for (const recipe of RECIPES) {
    assert.ok(recipe.ingredientIds.length >= 3);
    recipe.ingredientIds.forEach((id) => assert.ok(INGREDIENTS.some((item) => item.id === id), `${recipe.id} references ${id}`));
  }
});

test("a complete order can travel reception → prep → oven → cut → result", () => {
  let state = reduce(initialState, { type: "START" });
  assert.equal(state.station, "reception");
  state = reduce(state, { type: "ACCEPT" });
  assert.equal(state.station, "prep");

  for (let index = 0; index < 3; index += 1) {
    state = reduce(state, { type: "ADD_SAUCE" });
    state = reduce(state, { type: "ADD_CHEESE" });
  }
  const recipe = RECIPES[state.recipeIndex];
  for (const id of recipe.ingredientIds) {
    for (const [x, y] of [[28, 30], [70, 34], [47, 72]]) {
      state = reduce(state, { type: "PLACE", placement: { id, x, y, rotation: 0 }, correct: true });
    }
  }
  assert.equal(isPrepComplete(state), true);

  state = reduce(state, { type: "BAKE" });
  assert.equal(state.station, "oven");
  while (state.cook < 82) state = reduce(state, { type: "TICK" });
  state = reduce(state, { type: "TAKE_OUT" });
  assert.equal(state.station, "cut");
  state = reduce(state, { type: "AUTO_CUT" });
  assert.equal(state.cuts.length, recipe.targetCuts / 2);
  state = reduce(state, { type: "FINISH" });
  assert.equal(state.station, "result");
  assert.ok(state.result.total > 0);
  assert.ok(state.result.stars >= 2);
  state = reduce(state, { type: "NEXT" });
  assert.equal(state.station, "reception");
  assert.equal(state.recipeIndex, 1);
});

test("quick portfolio returns to the exact running station", () => {
  let state = reduce(initialState, { type: "START" });
  state = reduce(state, { type: "ACCEPT" });
  state = reduce(state, { type: "PORTFOLIO" });
  assert.equal(state.screen, "portfolio");
  state = reduce(state, { type: "CLOSE_PORTFOLIO" });
  assert.equal(state.screen, "game");
  assert.equal(state.station, "prep");
});
