import { useState } from "react";
import { X, FileText, Check } from "lucide-react";

export default function ImportModal({ onClose, onImport, showMsg }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const parseRoutine = async () => {
    if (!text.trim()) { showMsg("Pegá tu rutina primero", "err"); return; }
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `Sos un parser de rutinas de gym. El usuario va a pegarte texto libre con su rutina.
Tu tarea: extraer los ejercicios y convertirlos a JSON.
Respondé SOLO con JSON válido, sin texto extra, sin markdown, sin bloques de código.
Formato exacto:
{"plans":[{"name":"Nombre del día/rutina","category":"EMPUJE|TIRÓN|PIERNA|CARDIO|CORE","exercises":[{"exercise":"nombre","sets":"3","reps":"10","weight":"0"}]}]}
Reglas:
- Si no especifica series/reps, usá "3" y "10"
- Si no especifica peso, usá "0"
- Agrupá por día o por grupo muscular
- Máximo 5 planes
- Los nombres de ejercicios en español`,
          messages: [{ role: "user", content: text }]
        })
      });
      const data = await res.json();
      const content = data.content?.[0]?.text || "{}";
      const parsed = JSON.parse(content.replace(/```json|```/g, "").trim());
      setResult(parsed.plans || []);
    } catch (e) {
      showMsg("Error al parsear. Intentá de nuevo.", "err");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-end sm:items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border-4 border-purple-700 rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
        <div className="p-4 border-b-2 border-purple-800 flex justify-between sticky top-0 bg-gray-900">
          <div><div className="text-purple-400 font-black">📋 IMPORTAR RUTINA</div><div className="text-gray-600 text-xs">Pegá tu rutina en texto libre</div></div>
          <button onClick={onClose} className="text-gray-500"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-4 space-y-3">
          {!result ? (
            <>
              <div className="bg-gray-800 rounded-xl p-3 text-xs text-gray-400 space-y-1">
                <p className="font-bold text-gray-300">Ejemplos de formato:</p>
                <p>• "Lunes: Press banca 4x8, Aperturas 3x12"</p>
                <p>• "Día 1 Pecho: press banca, fondos, aperturas"</p>
                <p>• Cualquier formato, lo interpretamos 🧠</p>
              </div>
              <textarea value={text} onChange={e => setText(e.target.value)}
                placeholder={"Pegá tu rutina acá...\n\nEj:\nLunes - Pecho/Tríceps\nPress banca 4x8 80kg\nAperturas 3x12\nFondos 3xfallo\n\nMiércoles - Espalda/Bíceps\nDominadas 4x6\nRemo barra 4x10 60kg"}
                rows={10} className="w-full px-3 py-3 bg-gray-800 text-gray-300 border border-gray-700 rounded-xl text-sm resize-none outline-none focus:border-purple-500"/>
              <button onClick={parseRoutine} disabled={loading || !text.trim()}
                className={`w-full py-3 rounded-xl font-black flex items-center justify-center gap-2 ${loading || !text.trim() ? "bg-gray-700 text-gray-500" : "bg-purple-700 border-2 border-purple-500 text-white"}`}>
                {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Parseando...</> : <><FileText className="w-4 h-4"/>CONVERTIR A PLANES</>}
              </button>
            </>
          ) : (
            <>
              <div className="text-green-400 font-black text-sm">✅ {result.length} plan{result.length !== 1 ? "es" : ""} detectado{result.length !== 1 ? "s" : ""}</div>
              {result.map((p, i) => (
                <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-3">
                  <div className="text-yellow-400 font-black text-sm mb-1">{p.name}</div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${p.category === "EMPUJE" ? "bg-red-900 text-red-300" : p.category === "TIRÓN" ? "bg-blue-900 text-blue-300" : p.category === "PIERNA" ? "bg-green-900 text-green-300" : p.category === "CARDIO" ? "bg-orange-900 text-orange-300" : "bg-purple-900 text-purple-300"}`}>{p.category}</span>
                  <div className="mt-2">{(p.exercises || []).map((ex, j) => <div key={j} className="text-gray-400 text-xs py-0.5">• {ex.exercise} — {ex.sets}×{ex.reps}{parseFloat(ex.weight) > 0 ? ` ${ex.weight}kg` : ""}</div>)}</div>
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
