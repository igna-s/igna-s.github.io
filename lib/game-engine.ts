export type Placement = { id: string; x: number; y: number; rotation: number };
export type Cut = { x1: number; y1: number; x2: number; y2: number };

export type ScoreInput = {
  required: string[];
  placements: Placement[];
  sauce: number;
  cheese: number;
  cook: number;
  cuts: Cut[];
  targetCuts: number;
  patience: number;
  mistakes: number;
  multiplier: number;
};

export type ScoreBreakdown = {
  order: number;
  distribution: number;
  bake: number;
  cut: number;
  service: number;
  total: number;
  stars: number;
};

export function distributionScore(required: string[], placements: Placement[]) {
  if (!required.length) return 0;
  const perIngredient = required.map((id) => {
    const points = placements.filter((point) => point.id === id);
    if (!points.length) return 0;
    const quadrants = new Set(points.map((point) => `${point.x >= 50 ? 1 : 0}${point.y >= 50 ? 1 : 0}`)).size;
    const meanRadius = points.reduce((sum, point) => sum + Math.hypot(point.x - 50, point.y - 50), 0) / points.length;
    const countQuality = Math.min(1, points.length / 3);
    const spreadQuality = Math.min(1, quadrants / Math.min(4, points.length));
    const radiusQuality = meanRadius > 12 && meanRadius < 40 ? 1 : 0.72;
    return 100 * countQuality * (0.58 + spreadQuality * 0.3 + radiusQuality * 0.12);
  });
  return Math.round(perIngredient.reduce((sum, value) => sum + value, 0) / perIngredient.length);
}

export function cutScore(cuts: Cut[], targetSlices: number) {
  const expectedLines = Math.max(1, targetSlices / 2);
  if (!cuts.length) return 0;
  const count = Math.max(0, 100 - Math.abs(cuts.length - expectedLines) * 22);
  const centered = cuts.reduce((sum, cut) => {
    const distance = pointToSegmentDistance(50, 50, cut.x1, cut.y1, cut.x2, cut.y2);
    return sum + Math.max(0, 100 - distance * 5);
  }, 0) / cuts.length;
  return Math.round(count * 0.45 + centered * 0.55);
}

export function cookingScore(cook: number) {
  if (cook < 55) return Math.max(0, Math.round(cook));
  if (cook <= 100) return Math.round(82 + (1 - Math.abs(84 - cook) / 29) * 18);
  return Math.max(0, Math.round(100 - (cook - 100) * 4));
}

export function scoreOrder(input: ScoreInput): ScoreBreakdown {
  const coverage = Math.round(Math.max(0, 100 - Math.abs(88 - input.sauce) * 1.2 - Math.abs(86 - input.cheese) * 1.1));
  const componentCoverage = input.required.filter((id) => input.placements.some((point) => point.id === id)).length / input.required.length;
  const order = Math.round(Math.max(0, coverage * 0.42 + componentCoverage * 58 - input.mistakes * 8));
  const distribution = distributionScore(input.required, input.placements);
  const bake = cookingScore(input.cook);
  const cut = cutScore(input.cuts, input.targetCuts);
  const service = Math.round(Math.max(0, Math.min(100, input.patience - input.mistakes * 4)));
  const raw = order * 0.25 + distribution * 0.25 + bake * 0.25 + cut * 0.15 + service * 0.1;
  const total = Math.round(raw * 40 * input.multiplier);
  const stars = raw >= 90 ? 3 : raw >= 72 ? 2 : 1;
  return { order, distribution, bake, cut, service, total, stars };
}

function pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (!dx && !dy) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}
