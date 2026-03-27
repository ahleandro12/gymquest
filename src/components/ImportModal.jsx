import { useState } from "react";
import { X, FileText, Check } from "lucide-react";
import { EXERCISE_CATEGORIES, MUSCLE_MAP } from "../data.js";

// ── Parser local ──────────────────────────────────────────────────────────────

const ALL_EXERCISES = Object.values(EXERCISE_CATEGORIES).flat();

const CATEGORY_KEYWORDS = {
  EMPUJE: ["pecho", "empuje", "push", "press", "tríceps", "triceps", "hombro", "shoulder"],
  TIRÓN: ["espalda", "tirón", "tiron", "pull", "bíceps", "biceps", "back", "remo", "dominadas"],
  PIERNA: ["pierna", "leg", "cuádriceps", "cuadriceps", "glúteo", "gluteo", "femoral", "sentadilla", "squat"],
  CARDIO: ["cardio", "correr", "bici", "hiit", "aeróbico", "aerobico"],
  CORE: ["core", "abdomen", "abs", "plancha"],
};

function detectCategory(text) {
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  return "EMPUJE";
}

function detectExercise(line) {
  const lower = line.toLowerCase();
  // Buscar ejercicio conocido
  const found = ALL_EXERCISES.find(ex => lower.includes(ex.toLowerCase()));
  if (found) return found;
  // Si no, limpiar la línea de números y devolver lo que queda
  const cleaned = line
    .replace(/\d+\s*x\s*\d+/gi, "")
    .replace(/\d+\s*kg/gi, "")
    .replace(/\d+\s*series?/gi, "")
    .replace(/\d+\s*reps?/gi, "")
    .replace(/[•\-*]/g, "")
    .trim();
  return cleaned.length > 2 ? cleaned : null;
}

function parseSetsReps(line) {
  // Patrones: 4x8, 4X8, 4 x 8, 4 series de 8, 3x10-12
  const match = line.match(/(\d+)\s*[xX×]\s*(\d+)/);
  if (match) return { sets: match[1], reps: match[2] };
  const seriesMatch = line.match(/(\d+)\s*series?\s*(?:de)?\s*(\d+)/i);
  if (seriesMatch) return { sets: seriesMatch[1], reps: seriesMatch[2] };
  return { sets: "3", reps: "10" };
}

function parseWeight(line) {
  const match = line.match(/(\d+(?:\.\d+)?)\s*kg/i);
  return match ? match[1] : "0";
}

function isHeaderLine(line) {
  const lower = line.toLowerCase();
  const dayWords = ["lunes","martes","miércoles","miercoles","jueves","viernes","sábado","sabado","domingo","día","dia","day","semana","week","rutina","entrenamiento"];
  const hasDayWord = dayWords.some(w => lower.includes(w));
  const hasColon = line.includes(":");
  const hasSlash = line.includes("/");
  const isShort = line.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "").trim().split(" ").length <= 4;
  return (hasDayWord || (hasColon && isShort) || (hasSlash && isShort));
}

function parseRoutine(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  const plans = [];
  let currentPlan = null;

  for (const line of lines) {
    if (isHeaderLine(line)) {
      if (currentPlan && currentPlan.exercises.length > 0) plans.push(currentPlan);
      const name = line.replace(/[-:\/]/g, " ").replace(/\s+/g, " ").trim();
      currentPlan = {
        name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
        category: detectCategory(line),
        exercises: [],
      };
    } else {
      // Es una línea de ejercicio
      if (!currentPlan) {
        currentPlan = { name: "Rutina", category: detectCategory(line), exercises: [] };
      }
      const exName = detectExercise(line);
      if (exName) {
        const { sets, reps } = parseSetsReps(line);
        const weight = parseWeight(line);
        currentPlan.exercises.push({
          exercise: exName,
          sets,
          reps,
          weight,
        });
        // Actualizar categoría si encontramos ejercicio más específico
        if (currentPlan.exercises.length === 1) {
          currentPlan.category = detectCategory(line + " " + currentPlan.name);
        }
      }
    }
  }

  if (currentPlan && currentPlan.exercises.length > 0) plans.push(currentPlan);

  // Si no encontró planes, meter todo en uno
  if (plans.length === 0) {
    const exercises = [];
    for (const line of lines) {
      const exName = detectExercise(line);
      if (exName) {
        const { sets, reps } = parseSetsReps(line);
        const weight = parseWeight(line);
        exercises.push({ exercise: exName, sets, reps, weight });
      }
    }
    if (exercises.length > 0) {
      plans.push({ name: "Mi Rutina", category: "EMPUJE", exercises });
    }
  }

  return plans.slice(0, 6);
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function ImportModal({ onClose, onImport, showMsg }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);

  const handleParse = () => {
    if (!text.trim()) { showMsg("Pegá tu rutina primero", "err"); return; }
    const plans = parseRoutine(text);
    if (plans.length === 0) {
      showMsg("No pude detectar ejercicios. Revisá el formato.", "err");
      return;
    }
    setResult(plans);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-end sm:items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border-4 border-purple-700 rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
        <div className="p-4 border-b-2 border-purple-800 flex justify-between sticky top-0 bg-gray-900">
          <div>
            <div className="text-purple-400 font-black">📋 IMPORTAR RUTINA</div>
            <div className="text-gray-600 text-xs">Pegá tu rutina en texto libre</div>
          </div>
          <button onClick={onClose} className="text-gray-500"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-4 space-y-3">
          {!result ? (
            <>
              <div className="bg-gray-800 rounded-xl p-3 text-xs text-gray-400 space-y-1">
                <p className="font-bold text-gray-300">Ejemplos de formato:</p>
                <p>• "Lunes: Press banca 4x8, Aperturas 3x12"</p>
                <p>• "Día 1 Pecho: press banca, fondos, aperturas"</p>
                <p>• "Lunes - Pecho/Tríceps"</p>
              </div>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={"Pegá tu rutina acá...\n\nEj:\nLunes - Pecho/Tríceps\nPress banca 4x8 80kg\nAperturas 3x12\nFondos 3xfallo\n\nMiércoles - Espalda/Bíceps\nDominadas 4x6\nRemo barra 4x10 60kg"}
                rows={10}
                className="w-full px-3 py-3 bg-gray-800 text-gray-300 border border-gray-700 rounded-xl text-sm resize-none outline-none focus:border-purple-500"
              />
              <button
                onClick={handleParse}
                disabled={!text.trim()}
                className={`w-full py-3 rounded-xl font-black flex items-center justify-center gap-2 ${!text.trim() ? "bg-gray-700 text-gray-500" : "bg-purple-700 border-2 border-purple-500 text-white"}`}>
                <FileText className="w-4 h-4"/>CONVERTIR A PLANES
              </button>
            </>
          ) : (
            <>
              <div className="text-green-400 font-black text-sm">✅ {result.length} plan{result.length !== 1 ? "es" : ""} detectado{result.length !== 1 ? "s" : ""}</div>
              {result.map((p, i) => (
                <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-3">
                  <div className="text-yellow-400 font-black text-sm mb-1">{p.name}</div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${p.category === "EMPUJE" ? "bg-red-900 text-red-300" : p.category === "TIRÓN" ? "bg-blue-900 text-blue-300" : p.category === "PIERNA" ? "bg-green-900 text-green-300" : p.category === "CARDIO" ? "bg-orange-900 text-orange-300" : "bg-purple-900 text-purple-300"}`}>{p.category}</span>
                  <div className="mt-2">
                    {(p.exercises || []).map((ex, j) => (
                      <div key={j} className="text-gray-400 text-xs py-0.5">
                        • {ex.exercise} — {ex.sets}×{ex.reps}{parseFloat(ex.weight) > 0 ? ` ${ex.weight}kg` : ""}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <button onClick={() => setResult(null)} className="flex-1 bg-gray-700 border border-gray-600 text-white py-2.5 rounded-xl font-black text-sm">← Editar</button>
                <button onClick={() => onImport(result)} className="flex-1 bg-green-700 border-2 border-green-500 text-white py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2"><Check className="w-4 h-4"/>GUARDAR PLANES</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
