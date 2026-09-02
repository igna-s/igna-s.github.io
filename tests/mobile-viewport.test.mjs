import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../app/game-v2.css", import.meta.url), "utf8");
const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("the mobile kitchen is locked to one dynamic viewport", () => {
  assert.match(css, /\.classic-game\{height:100dvh;min-height:100svh;display:grid/);
  assert.match(css, /html:has\(\.classic-game\),body:has\(\.classic-game\)\{height:100%;overflow:hidden/);
  assert.match(css, /\.classic-floor\{height:auto;min-height:0;overflow:hidden/);
  assert.match(css, /\.classic-work\{height:100%;min-height:0;overflow:hidden/);
  assert.match(css, /padding-top:env\(safe-area-inset-top\);padding-bottom:env\(safe-area-inset-bottom\)/);
});

test("portrait and landscape layouts keep every station action visible", () => {
  assert.match(css, /max-height:700px[^}]+orientation:portrait/);
  assert.match(css, /max-height:620px[^}]+orientation:landscape/);
  assert.match(css, /\.v2-prep\{display:grid;grid-template-rows:/);
  assert.match(css, /\.v2-ovens\{display:grid;grid-template-rows:/);
  assert.match(css, /\.v2-cut-scene\{display:grid;grid-template-rows:/);
  assert.match(css, /\.work-action\{height:38px;min-height:38px/);
});

test("the sound engine includes gameplay and ambient feedback cues", () => {
  for (const cue of ["ARRIVAL", "OVEN_PROGRESS", "OVEN_READY", "OVEN_BURNING", "RESULT_LOW", "RESULT_HIGH"]) {
    assert.match(page, new RegExp(`\\b${cue}\\b`), `missing sound cue ${cue}`);
  }
  assert.match(page, /sharedAudioContext/);
  assert.match(page, /playNoise/);
});
