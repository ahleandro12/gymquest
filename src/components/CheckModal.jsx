import { useState } from "react";
import { X, Plus, Check, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { MUSCLE_MAP, EXERCISE_CATEGORIES } from "../data.js";
import { getMusclesFromExercises, calcPoints } from "../utils.js";

function getLastRecord(checks, exerciseName) {
  if (!exerciseName || !checks?.length) return null;
  for (const c of [...checks].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))) {
    const found = (c.exercises || []).find(e => e.exercise.toLowerCase() === exerciseName.toLowerCase());
    if (found) return found;
  }
  return null;
}

// Fila de ejercicio: compacta por defecto, se expande al tocar
function ExerciseRow({ ex, onDelete, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-gray-800 rounded-xl mb-1.5 overflow-hidden">
      {/* Fila compacta */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button onClick={() => setExpanded(e => !e)} className="flex-1 flex items-center gap-2 text-left">
          <div className="flex-1">
            <span className="text-yellow-400 font-bold text-sm">{ex.exercise}</span>
            <span className="text-gray-500 text-xs ml-2">
              {parseFloat(ex.weight) > 0 ? `${ex.weight}kg` : "PC"} × {ex.reps} × {ex.sets}s
            </span>
          </div>
          {expanded ? <ChevronUp className="w-3 h-3 text-gray-600"/> : <ChevronDown className="w-3 h-3 text-gray-600"/>}
        </button>
        <button onClick={onDelete} className="text-gray-600 hover:text-red-400 pl-1"><X className="w-4 h-4"/></button>
      </div>
      {/* Acordeón de edición */}
      {expanded && (
        <div className="px-3 pb-3 grid grid-cols-3 gap-2 border-t border-gray-700 pt-2">
          <div>
            <div className="text-gray-500 text-xs mb-1">Kg</div>
            <input type="number" value={ex.weight} onChange={e => onUpdate({ weight: e.target.value })} className="w-full px-2 py-1.5 bg-gray-700 text-yellow-400 border border-gray-600 rounded-lg text-sm outline-none"/>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-1">Reps</div>
            <input type="number" value={ex.reps} onChange={e => onUpdate({ reps: e.target.value })} className="w-full px-2 py-1.5 bg-gray-700 text-yellow-400 border border-gray-600 rounded-lg text-sm outline-none"/>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-1">Series</div>
            <input type="number" value={ex.sets} onChange={e => onUpdate({ sets: e.target.value })} className="w-full px-2 py-1.5 bg-gray-700 text-yellow-400 border border-gray-600 rounded-lg text-sm outline-none"/>
          </div>
        </div>
      )}
    </div>
  );
}

function ExerciseInput({ value, onChange, useCustom, onToggleCustom, category, checks }) {
  const handleExerciseChange = (exName) => {
    const last = getLastRecord(checks, exName);
    onChange({
      ...value,
      exercise: exName,
      weight: last?.weight || "",
      reps: last?.reps || "",
      sets: last?.sets || "3",
      _hasHistory: !!last,
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button onClick={() => onToggleCustom(false)} className={`flex-1 py-1.5 rounded-lg text-xs font-black border ${!useCustom ? "bg-yellow-500 border-yellow-300 text-black" : "bg-gray-800 border-gray-700 text-gray-400"}`}>Lista</button>
        <button onClick={() => onToggleCustom(true)} className={`flex-1 py-1.5 rounded-lg text-xs font-black border ${useCustom ? "bg-yellow-500 border-yellow-300 text-black" : "bg-gray-800 border-gray-700 text-gray-400"}`}>✏️ Escribir</button>
      </div>
      {useCustom ? (
        <input type="text" placeholder="Escribí el ejercicio..." value={value.customExercise} onChange={e => onChange({ ...value, customExercise: e.target.value })} className="w-full px-3 py-2.5 bg-gray-800 text-yellow-400 border border-yellow-700 rounded-xl text-sm outline-none"/>
      ) : (
        <select value={value.exercise} onChange={e => handleExerciseChange(e.target.value)} className="w-full px-3 py-2.5 bg-gray-800 text-yellow-400 border border-gray-700 rounded-xl text-sm outline-none">
          <option value="">-- Elegí ejercicio --</option>
          {(EXERCISE_CATEGORIES[category] || []).map(ex => <option key={ex} value={ex}>{ex}</option>)}
        </select>
      )}
      {value._hasHistory && (
        <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-950 border border-blue-800 rounded-lg px-2.5 py-1.5">
          <Clock className="w-3 h-3"/>
          <span>Último registro precargado</span>
        </div>
      )}
    </div>
  );
}

export default function CheckModal({ nc, setNc, exIn, setExIn, useCustomEx, setUseCustomEx, char, checks, onSubmit, onClose }) {
  const addEx = () => {
    const exName = useCustomEx ? exIn.customExercise.trim() : exIn.exercise;
    if (!exName || !exIn.reps) { alert("Completá ejercicio y reps"); return; }
    setNc(p => ({ ...p, exercises: [...p.exercises, { id: Date.now(), exercise: exName, weight: exIn.weight || "0", reps: exIn.reps, sets: exIn.sets }] }));
    setExIn({ exercise: "", customExercise: "", weight: "", reps: "", sets: "3", _hasHistory: false });
    setUseCustomEx(false);
  };

  const updateEx = (id, fields) => setNc(p => ({ ...p, exercises: p.exercises.map(x => x.id === id ? { ...x, ...fields } : x) }));
  const deleteEx = (id) => setNc(p => ({ ...p, exercises: p.exercises.filter(e => e.id !== id) }));
  const activeMuscles = [...getMusclesFromExercises(nc.exercises)];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-end sm:items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border-4 border-yellow-700 rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
        <div className="p-4 border-b-2 border-yellow-800 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
          <h2 className="text-yellow-400 font-black text-lg">⚡ REGISTRAR</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-400"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-4 space-y-4">

          {/* Fecha */}
          <input type="date" value={nc.date || new Date().toISOString().split("T")[0]} max={new Date().toISOString().split("T")[0]} onChange={e => setNc(p => ({ ...p, date: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 text-yellow-400 border border-gray-700 rounded-xl text-sm outline-none"/>

          {/* Categoría */}
          <div>
            <div className="text-yellow-400 font-black text-sm mb-2">¿QUÉ ENTRENASTE?</div>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.keys(EXERCISE_CATEGORIES).map(cat => (
                <button key={cat} onClick={() => setNc(p => ({ ...p, category: cat }))}
                  className={`py-2.5 rounded-xl font-black text-xs border-2 ${nc.category === cat
                    ? (cat === "EMPUJE" ? "bg-red-700 border-red-400 text-white" : cat === "TIRÓN" ? "bg-blue-700 border-blue-400 text-white" : cat === "PIERNA" ? "bg-green-700 border-green-400 text-white" : cat === "CARDIO" ? "bg-orange-700 border-orange-400 text-white" : "bg-purple-700 border-purple-400 text-white")
                    : (cat === "EMPUJE" ? "border-red-900 text-red-500" : cat === "TIRÓN" ? "border-blue-900 text-blue-500" : cat === "PIERNA" ? "border-green-900 text-green-500" : cat === "CARDIO" ? "border-orange-900 text-orange-500" : "border-purple-900 text-purple-500")}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Ejercicios */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-yellow-400 font-black text-sm">EJERCICIOS</div>
              {activeMuscles.length > 0 && (
                <div className="flex gap-1 flex-wrap justify-end">
                  {activeMuscles.slice(0, 3).map(m => (
                    <span key={m} className="text-xs px-1.5 py-0.5 rounded-full border font-bold" style={{ color: MUSCLE_MAP[m]?.color, borderColor: MUSCLE_MAP[m]?.color + "44", backgroundColor: MUSCLE_MAP[m]?.color + "11" }}>
                      {MUSCLE_MAP[m]?.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {nc.exercises.map(ex => (
              <ExerciseRow
                key={ex.id}
                ex={ex}
                onDelete={() => deleteEx(ex.id)}
                onUpdate={(fields) => updateEx(ex.id, fields)}
              />
            ))}

            {nc.category ? (
              <>
                <ExerciseInput value={exIn} onChange={setExIn} useCustom={useCustomEx} onToggleCustom={setUseCustomEx} category={nc.category} checks={checks}/>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <input type="number" placeholder="Kg" value={exIn.weight} onChange={e => setExIn(p => ({ ...p, weight: e.target.value }))} className="px-3 py-2 bg-gray-800 text-yellow-400 border border-gray-700 rounded-xl text-sm outline-none"/>
                  <input type="number" placeholder="Reps" value={exIn.reps} onChange={e => setExIn(p => ({ ...p, reps: e.target.value }))} className="px-3 py-2 bg-gray-800 text-yellow-400 border border-gray-700 rounded-xl text-sm outline-none"/>
                  <input type="number" placeholder="Series" value={exIn.sets} onChange={e => setExIn(p => ({ ...p, sets: e.target.value }))} className="px-3 py-2 bg-gray-800 text-yellow-400 border border-gray-700 rounded-xl text-sm outline-none"/>
                </div>
                <button onClick={addEx} className="w-full mt-2 bg-yellow-700 border border-yellow-500 text-white py-2 rounded-xl text-sm font-black flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4"/>Agregar ejercicio
                </button>
              </>
            ) : <p className="text-gray-600 text-xs text-center py-2">Elegí una categoría primero ☝️</p>}
          </div>

          {nc.exercises.length > 0 && (
            <div className="bg-green-950 border border-green-800 rounded-xl p-2.5 text-center">
              <div className="text-green-400 font-black text-sm">~{calcPoints({ ...nc }, char).exp} EXP estimados</div>
            </div>
          )}

          <textarea value={nc.notes} onChange={e => setNc(p => ({ ...p, notes: e.target.value }))} placeholder="Notas opcionales..." rows={2} className="w-full px-3 py-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-xl text-sm resize-none outline-none"/>
          <button onClick={onSubmit} className="w-full bg-green-600 border-2 border-green-400 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2">
            <Check className="w-5 h-5"/>COMPLETAR CHECK
          </button>
        </div>
      </div>
    </div>
  );
}
