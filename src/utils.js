import { MUSCLE_MAP } from "./data.js";

export const storage = {
  get: (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

export const calcLevel = (exp) => Math.floor(Math.sqrt(exp / 50)) + 1;
export const expForLevel = (lv) => Math.pow(lv - 1, 2) * 50;

export const sameDay = (a, b) => {
  const x = new Date(a), y = new Date(b);
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
};

export const getWeekChecks = (checks) => {
  const s = new Date(); s.setDate(s.getDate() - s.getDay()); s.setHours(0,0,0,0);
  return checks.filter(c => new Date(c.timestamp) >= s).length;
};

export const calcStreak = (checks) => {
  if (!checks.length) return 0;
  const sorted = [...checks].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  let streak = 0, cur = new Date(); cur.setHours(0,0,0,0);
  for (const c of sorted) {
    const d = new Date(c.timestamp); d.setHours(0,0,0,0);
    const diff = Math.floor((cur - d) / 86400000);
    if (diff === streak) streak++; else if (diff > streak) break;
  }
  return streak;
};

export function getMusclesFromExercises(exercises) {
  const hit = new Set();
  (exercises || []).forEach(ex => {
    const name = (ex.exercise || "").toLowerCase();
    Object.entries(MUSCLE_MAP).forEach(([id, m]) => {
      if (m.exercises.some(e => e.toLowerCase() === name || name.includes(e.toLowerCase()) || e.toLowerCase().includes(name))) hit.add(id);
    });
  });
  return hit;
}

export function calcPoints(check, char) {
  let base = 50, volume = 0;
  (check.exercises || []).forEach(ex => {
    const w = parseFloat(ex.weight) || 1, r = parseInt(ex.reps) || 0, s = parseInt(ex.sets) || 1;
    volume += w * r * s;
  });
  const volPts = volume > 0 ? Math.floor(Math.log(volume + 1) * 15) : 0;
  let exp = base + volPts + (check.exercises || []).length * 20;
  const { race, archetype } = char || {};
  if (race === "mesomorfo") exp *= 1.15;
  if (race === "ectomorfo" && check.category === "CARDIO") exp *= 1.20;
  if (archetype === "mage") exp *= 1.35;
  if (archetype === "goku") exp *= 1.40;
  if (archetype === "zyzz") exp *= 1.35;
  let gold = 50 + Math.floor(volPts * 0.3);
  if (race === "endomorfo") gold += 30;
  if (archetype === "barbarian") gold += 40;
  return { exp: Math.floor(exp), gold: Math.floor(gold) };
}

export function getMuscleHeat(checks) {
  const heat = {};
  Object.keys(MUSCLE_MAP).forEach(m => { heat[m] = null; });
  checks.forEach(c => {
    const muscles = getMusclesFromExercises(c.exercises || []);
    const date = new Date(c.timestamp);
    muscles.forEach(m => { if (!heat[m] || date > heat[m]) heat[m] = date; });
  });
  const now = new Date(), result = {};
  Object.entries(heat).forEach(([m, d]) => { result[m] = d ? Math.floor((now - d) / 86400000) : 999; });
  return result;
}

export const heatColor = (days, isActive = false) => {
  if (isActive) return "#ef4444";
  if (days === 999) return "#1f2937";
  if (days <= 1) return "#ef4444";
  if (days <= 3) return "#f97316";
  if (days <= 6) return "#eab308";
  if (days <= 13) return "#22c55e";
  return "#6366f1";
};

export const heatLabel = (days) => {
  if (days === 999) return "Nunca";
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days <= 6) return `Hace ${days}d`;
  if (days <= 13) return `${Math.floor(days / 7)}sem`;
  return `${Math.floor(days / 7)}sem ⚠️`;
};

export const rarityColor = r => r === "legendary" ? "text-yellow-400" : r === "epic" ? "text-purple-400" : r === "rare" ? "text-blue-400" : "text-gray-400";
export const rarityBg = r => r === "legendary" ? "border-yellow-700 bg-yellow-950" : r === "epic" ? "border-purple-700 bg-purple-950" : r === "rare" ? "border-blue-800 bg-blue-950" : "border-gray-700 bg-gray-900";
