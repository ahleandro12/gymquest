import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { MUSCLE_MAP } from "../data.js";
import { sameDay, getMusclesFromExercises } from "../utils.js";

export function WeekCalendar({ checks, onDayClick }) {
  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(today); d.setDate(today.getDate() - i); days.push(d); }
  const DIAS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((d, i) => {
        const dayChecks = checks.filter(c => sameDay(c.timestamp, d));
        const muscles = [...new Set(dayChecks.flatMap(c => [...getMusclesFromExercises(c.exercises || [])]))];
        const isToday = sameDay(d, today);
        const topColor = muscles[0] ? MUSCLE_MAP[muscles[0]]?.color : null;
        return (
          <button key={i} onClick={() => onDayClick(d, dayChecks)} className={`flex flex-col items-center py-2 rounded-xl border transition-all ${isToday ? "border-yellow-500 bg-yellow-950" : dayChecks.length ? "border-gray-600 bg-gray-800" : "border-gray-800 bg-gray-900"}`}>
            <span className="text-gray-500 text-xs">{DIAS[d.getDay()]}</span>
            <span className={`font-black text-sm ${isToday ? "text-yellow-400" : dayChecks.length ? "text-white" : "text-gray-600"}`}>{d.getDate()}</span>
            <div className="w-2 h-2 rounded-full mt-0.5" style={{ backgroundColor: topColor || "transparent", border: topColor ? "none" : "1px solid #374151" }}/>
            {muscles.length > 1 && <div className="flex gap-0.5 mt-0.5">{muscles.slice(1, 3).map(m => <div key={m} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: MUSCLE_MAP[m]?.color }}/>)}</div>}
          </button>
        );
      })}
    </div>
  );
}

export function MonthCalendar({ checks, onDayClick }) {
  const [offset, setOffset] = useState(0);
  const ref = new Date(); ref.setMonth(ref.getMonth() + offset);
  const year = ref.getFullYear(), month = ref.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const DIAS = ["D","L","M","M","J","V","S"];
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  const today = new Date();

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setOffset(o => o - 1)} className="text-gray-500 hover:text-white p-1"><ChevronLeft className="w-4 h-4"/></button>
        <span className="text-yellow-400 font-black text-sm">{MESES[month]} {year}</span>
        <button onClick={() => setOffset(o => o + 1)} disabled={offset >= 0} className="text-gray-500 hover:text-white p-1 disabled:opacity-30"><ChevronRight className="w-4 h-4"/></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">{DIAS.map(d => <div key={d} className="text-center text-gray-600 text-xs font-bold py-1">{d}</div>)}</div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i}/>;
          const dayChecks = checks.filter(c => sameDay(c.timestamp, d));
          const muscles = [...new Set(dayChecks.flatMap(c => [...getMusclesFromExercises(c.exercises || [])]))];
          const isToday = sameDay(d, today);
          const topColor = muscles[0] ? MUSCLE_MAP[muscles[0]]?.color : null;
          return (
            <button key={i} onClick={() => onDayClick(d, dayChecks)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-bold border transition-all ${isToday ? "border-yellow-500 bg-yellow-950 text-yellow-400" : dayChecks.length ? "border-gray-600 bg-gray-800 text-white" : "border-transparent text-gray-600"}`}
              style={topColor && !isToday ? { borderColor: topColor + "44", backgroundColor: topColor + "11" } : {}}>
              {d.getDate()}
              {muscles.length > 0 && <div className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ backgroundColor: topColor }}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DayDetailModal({ date, dayChecks, onClose }) {
  const muscles = [...new Set(dayChecks.flatMap(c => [...getMusclesFromExercises(c.exercises || [])]))];
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-end sm:items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border-4 border-yellow-700 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b-2 border-yellow-800 flex justify-between sticky top-0 bg-gray-900">
          <div>
            <div className="text-yellow-400 font-black">{date.toLocaleDateString("es-AR", { weekday:"long", day:"numeric", month:"long" })}</div>
            <div className="text-gray-500 text-xs">{dayChecks.length} sesión{dayChecks.length !== 1 ? "es" : ""}</div>
          </div>
          <button onClick={onClose} className="text-gray-500"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-4 space-y-3">
          {dayChecks.length === 0 && <p className="text-gray-600 text-center py-4">Día de descanso 😴</p>}
          {muscles.length > 0 && <div className="flex flex-wrap gap-1.5">{muscles.map(m => <span key={m} className="text-xs px-2 py-1 rounded-full font-bold border" style={{ color: MUSCLE_MAP[m]?.color, borderColor: MUSCLE_MAP[m]?.color + "44", backgroundColor: MUSCLE_MAP[m]?.color + "11" }}>{MUSCLE_MAP[m]?.name}</span>)}</div>}
          {dayChecks.map(c => (
            <div key={c.id} className="bg-gray-800 rounded-xl p-3">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-black px-2 py-0.5 rounded ${c.category === "EMPUJE" ? "bg-red-900 text-red-300" : c.category === "TIRÓN" ? "bg-blue-900 text-blue-300" : c.category === "PIERNA" ? "bg-green-900 text-green-300" : c.category === "CARDIO" ? "bg-orange-900 text-orange-300" : "bg-purple-900 text-purple-300"}`}>{c.category}</span>
                <span className="text-green-400 text-xs font-black">+{c.exp || 0} XP</span>
              </div>
              {(c.exercises || []).map((ex, i) => <div key={i} className="text-gray-400 text-xs py-0.5">• {ex.exercise} — {parseFloat(ex.weight) > 0 ? `${ex.weight}kg` : "PC"} × {ex.reps} × {ex.sets}s</div>)}
              {c.notes && <p className="text-gray-600 text-xs mt-1 italic">"{c.notes}"</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
