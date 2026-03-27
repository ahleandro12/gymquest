import { X, Plus, Check } from "lucide-react";
import { MUSCLE_MAP, EXERCISE_CATEGORIES } from "../data.js";
import { getMusclesFromExercises, calcPoints } from "../utils.js";

function ExerciseInput({ value, onChange, useCustom, onToggleCustom, category }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button onClick={() => onToggleCustom(false)} className={`flex-1 py-1.5 rounded-lg text-xs font-black border ${!useCustom ? "bg-yellow-500 border-yellow-300 text-black" : "bg-gray-800 border-gray-700 text-gray-400"}`}>Lista</button>
        <button onClick={() => onToggleCustom(true)} className={`flex-1 py-1.5 rounded-lg text-xs font-black border ${useCustom ? "bg-yellow-500 border-yellow-300 text-black" : "bg-gray-800 border-gray-700 text-gray-400"}`}>✏️ Escribir</button>
      </div>
      {useCustom ? (
        <input type="text" placeholder="Escribí el ejercicio..." value={value.customExercise} onChange={e => onChange({ ...value, customExercise: e.target.value })} className="w-full px-3 py-2.5 bg-gray-800 text-yellow-400 border border-yellow-700 rounded-xl text-sm outline-none"/>
      ) : (
        <select value={value.exercise} onChange={e => onChange({ ...value, exercise: e.target.value })} className="w-full px-3 py-2.5 bg-gray-800 text-yellow-400 border border-gray-700 rounded-xl text-sm outline-none">
          <option value="">-- Elegí ejercicio --</option>
          {(EXERCISE_CATEGORIES[category] || []).map(ex => <option key={ex} value={ex}>{ex}</option>)}
        </select>
      )}
    </div>
  );
}

export default function CheckModal({ nc, setNc, exIn, setExIn, useCustomEx, setUseCustomEx, char, onSubmit, onClose }) {
  const addEx = () => {
    const exName = useCustomEx ? exIn.customExercise.trim() : exIn.exercise;
    if (!exName || !exIn.reps) { alert("Completá ejercicio y reps"); return; }
    setNc(p => ({ ...p, exercises: [...p.exercises, { id: Date.now(), exercise: exName, weight: exIn.weight || "0", reps: exIn.reps, sets: exIn.sets }] }));
    setExIn({ exercise: "", customExercise: "", weight: "", reps: "", sets: "3" });
    setUseCustomEx(false);
  };

  const activeMuscles = [...getMusclesFromExercises(nc.exercises)];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-end sm:items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border-4 border-yellow-700 rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
        <div className="p-4 border-b-2 border-yellow-800 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
          <h2 className="text-yellow-400 font-black text-lg">⚡ REGISTRAR</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-400"><X className="w-5 h-5"/></button>
        </div>
   <div className="p-4 space-y-4">
          <div>
            <div className="text-yellow-400 font-black text-sm mb-2">📅 FECHA</div>
            <input type="date" value={nc.date || new Date().toISOString().split("T")[0]} max={new Date().toISOString().split("T")[0]} onChange={e => setNc(p => ({ ...p, date: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 text-yellow-400 border border-gray-700 rounded-xl text-sm outline-none"/>
          </div>
          {/* Category */}
          <div>
            <div className="text-yellow-400 font-black text-sm mb-2">¿QUÉ ENTRENASTE?</div>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.keys(EXERCISE_CATEGORIES).map(cat => (
                <button key={cat} onClick={() => setNc(p => ({ ...p, category: cat }))}
                  className={`py-2.5 rounded-xl font-black text-xs border-2 ${nc.category === cat ? (cat === "EMPUJE" ? "bg-red-700 border-red-400 text-white" : cat === "TIRÓN" ? "bg-blue-700 border-blue-400 text-white" : cat === "PIERNA" ? "bg-green-700 border-green-400 text-white" : cat === "CARDIO" ? "bg-orange-700 border-orange-400 text-white" : "bg-purple-700 border-purple-400 text-white") : (cat === "EMPUJE" ? "border-red-900 text-red-500" : cat === "TIRÓN" ? "border-blue-900 text-blue-500" : cat === "PIERNA" ? "border-green-900 text-green-500" : cat === "CARDIO" ? "border-orange-900 text-orange-500" : "border-purple-900 text-purple-500")}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Exercises */}
          <div>
            <div className="text-yellow-400 font-black text-sm mb-2">EJERCICIOS</div>
            {activeMuscles.length > 0 && (
              <div className="mb-2 bg-gray-800 rounded-xl p-2.5">
                <div className="text-xs text-gray-500 font-bold mb-1">💪 Músculos:</div>
                <div className="flex flex-wrap gap-1">{activeMuscles.map(m => <span key={m} className="text-xs px-2 py-0.5 rounded-full border font-bold" style={{ color: MUSCLE_MAP[m]?.color, borderColor: MUSCLE_MAP[m]?.color + "44", backgroundColor: MUSCLE_MAP[m]?.color + "11" }}>{MUSCLE_MAP[m]?.name}</span>)}</div>
              </div>
            )}
            {nc.exercises.map(ex => (
              <div key={ex.id} className="bg-gray-800 rounded-xl p-2.5 mb-1.5 flex items-center gap-2">
                <div className="flex-1"><div className="text-yellow-400 font-bold text-sm">{ex.exercise}</div><div className="text-gray-500 text-xs">{ex.sets}×{ex.reps} · {parseFloat(ex.weight) > 0 ? `${ex.weight}kg` : "PC"}</div></div>
                <button onClick={() => setNc(p => ({ ...p, exercises: p.exercises.filter(e => e.id !== ex.id) }))} className="text-gray-600 hover:text-red-400"><X className="w-4 h-4"/></button>
              </div>
            ))}
            {nc.category ? (
              <>
                <ExerciseInput value={exIn} onChange={setExIn} useCustom={useCustomEx} onToggleCustom={setUseCustomEx} category={nc.category}/>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <input type="number" placeholder="Kg" value={exIn.weight} onChange={e => setExIn(p => ({ ...p, weight: e.target.value }))} className="px-3 py-2 bg-gray-800 text-yellow-400 border border-gray-700 rounded-xl text-sm outline-none"/>
                  <input type="number" placeholder="Reps" value={exIn.reps} onChange={e => setExIn(p => ({ ...p, reps: e.target.value }))} className="px-3 py-2 bg-gray-800 text-yellow-400 border border-gray-700 rounded-xl text-sm outline-none"/>
                  <input type="number" placeholder="Series" value={exIn.sets} onChange={e => setExIn(p => ({ ...p, sets: e.target.value }))} className="px-3 py-2 bg-gray-800 text-yellow-400 border border-gray-700 rounded-xl text-sm outline-none"/>
                </div>
                <button onClick={addEx} className="w-full mt-2 bg-yellow-800 border border-yellow-600 text-white py-2 rounded-xl text-sm font-black flex items-center justify-center gap-2"><Plus className="w-4 h-4"/>Agregar ejercicio</button>
              </>
            ) : <p className="text-gray-600 text-xs text-center py-2">Elegí una categoría primero ☝️</p>}
          </div>

          {nc.exercises.length > 0 && (
            <div className="bg-green-950 border border-green-800 rounded-xl p-2.5 text-center">
              <div className="text-green-400 font-black text-sm">~{calcPoints({ ...nc }, char).exp} EXP estimados</div>
            </div>
          )}

          <textarea value={nc.notes} onChange={e => setNc(p => ({ ...p, notes: e.target.value }))} placeholder="Notas opcionales..." rows={2} className="w-full px-3 py-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-xl text-sm resize-none outline-none"/>
          <button onClick={onSubmit} className="w-full bg-green-600 border-2 border-green-400 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2"><Check className="w-5 h-5"/>COMPLETAR CHECK</button>
        </div>
      </div>
    </div>
  );
}
