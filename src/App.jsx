import { useState, useEffect } from "react";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, provider, db } from "./firebase.js";
import { Flame, Plus, Check, Play, Lock, ChevronDown, ChevronUp, Edit2, Trash2, User, Home, Zap, LogIn, LogOut, Calendar, FileText, X } from "lucide-react";

import { MUSCLE_MAP, EXERCISE_CATEGORIES, RACES, ARCHETYPES, SHOP_ITEMS, COACHES, QUIZ } from "./data.js";
import { storage, calcLevel, expForLevel, calcStreak, sameDay, getWeekChecks, calcPoints, getMuscleHeat, getMusclesFromExercises, heatColor, heatLabel, rarityColor, rarityBg } from "./utils.js";
import BodyMap from "./components/BodyMap.jsx";
import { WeekCalendar, MonthCalendar, DayDetailModal } from "./components/Calendar.jsx";
import CheckModal from "./components/CheckModal.jsx";
import ImportModal from "./components/ImportModal.jsx";

// ── LOGIN ──
function LoginScreen({ onGuest, onGoogle }) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4" style={{ fontFamily: "monospace" }}>
      <div className="max-w-sm w-full">
        <div className="text-center mb-8"><div className="text-7xl mb-3">⚔️</div><h1 className="text-5xl font-black text-yellow-400">GYMQUEST</h1><p className="text-gray-500 text-sm mt-2">Tu aventura fitness comienza acá</p></div>
        <div className="space-y-3">
          <button onClick={onGuest} className="w-full bg-yellow-500 border-4 border-yellow-300 text-black font-black py-4 rounded-2xl text-lg flex items-center justify-center gap-3"><Zap className="w-6 h-6"/>ENTRAR COMO INVITADO</button>
          <button onClick={onGoogle} className="w-full bg-gray-800 border-2 border-gray-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3"><span className="text-xl">🔗</span>SINCRONIZAR CON GOOGLE<span className="text-xs text-gray-500">(próximamente)</span></button>
          <p className="text-center text-gray-700 text-xs mt-4">Como invitado tu progreso se guarda en este dispositivo</p>
        </div>
      </div>
    </div>
  );
}

// ── CHARACTER CREATION ──
function CharCreation({ onDone, showMsg, toast }) {
  const [step, setStep] = useState("race");
  const [race, setRace] = useState(null);
  const [name, setName] = useState("");
  const [quizIdx, setQuizIdx] = useState(0);
  const [votes, setVotes] = useState({});
  const [arch, setArch] = useState(null);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState(3);

  const answerQuiz = a => {
    const v = { ...votes, [a]: (votes[a] || 0) + 1 }; setVotes(v);
    if (quizIdx < QUIZ.length - 1) setQuizIdx(i => i + 1);
    else { setArch(Object.entries(v).reduce((a, b) => a[1] > b[1] ? a : b)[0]); setStep("reveal"); }
  };

  if (step === "race") return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4" style={{ fontFamily: "monospace" }}>
      <div className="max-w-lg w-full">
        <div className="text-center mb-6"><div className="text-6xl mb-2">⚔️</div><h1 className="text-5xl font-black text-yellow-400">GYMQUEST</h1></div>
        <div className="bg-gray-900 border-4 border-yellow-700 rounded-2xl p-5">
          <h2 className="text-lg font-black text-yellow-400 mb-4 text-center">ELEGÍ TU RAZA</h2>
          <div className="grid grid-cols-3 gap-3 mb-4">{Object.entries(RACES).map(([k, r]) => (<button key={k} onClick={() => setRace(k)} className={`border-4 p-4 rounded-xl text-center ${race === k ? "border-yellow-400 bg-yellow-950 scale-105" : "border-gray-700 bg-gray-800"}`}><div className="text-4xl mb-2">{r.icon}</div><div className="text-yellow-400 font-black text-xs">{r.name}</div><div className="text-gray-500 text-xs mt-0.5">{r.bonus}</div></button>))}</div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre de tu guerrero" className="w-full px-4 py-3 bg-gray-800 border-2 border-yellow-700 text-yellow-400 rounded-xl text-center font-black mb-3 outline-none"/>
          <button onClick={() => { if (!race || !name.trim()) { showMsg("Elegí raza y nombre", "err"); return; } setStep("quiz"); }} className="w-full bg-yellow-500 text-black font-black py-3 rounded-xl text-lg">CONTINUAR →</button>
        </div>
      </div>
      {toast && <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl font-black text-sm shadow-2xl ${toast.type === "err" ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>{toast.msg}</div>}
    </div>
  );

  if (step === "quiz") { const q = QUIZ[quizIdx]; return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4" style={{ fontFamily: "monospace" }}>
      <div className="max-w-lg w-full bg-gray-900 border-4 border-purple-700 rounded-2xl p-7">
        <div className="text-center mb-5"><div className="text-4xl mb-2">🔮</div><div className="text-purple-300 font-black text-xl">ARQUETIPO</div><div className="text-gray-600 text-sm">{quizIdx + 1}/{QUIZ.length}</div></div>
        <div className="bg-gray-800 h-1.5 rounded mb-5"><div className="bg-purple-500 h-1.5 rounded" style={{ width: `${(quizIdx / QUIZ.length) * 100}%` }}/></div>
        <p className="text-yellow-300 text-center font-black mb-4">{q.q}</p>
        <div className="space-y-2">{q.opts.map((o, i) => <button key={i} onClick={() => answerQuiz(o.a)} className="w-full text-left bg-gray-800 border-2 border-gray-700 text-white p-3 rounded-xl hover:border-purple-400">{o.t}</button>)}</div>
      </div>
    </div>
  ); }

  if (step === "reveal" && arch) { const a = ARCHETYPES[arch]; return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4" style={{ fontFamily: "monospace" }}>
      <div className="max-w-lg w-full bg-gray-900 border-4 border-yellow-600 rounded-2xl p-8 text-center">
        <div className="text-8xl mb-4 animate-bounce">{a.icon}</div>
        <h2 className="text-3xl font-black text-yellow-400 mb-3">¡ERES {a.name.toUpperCase()}!</h2>
        <div className="bg-green-900 bg-opacity-40 border-2 border-green-700 rounded-xl p-3 mb-5"><div className="text-green-300 font-bold">{a.bonus}</div></div>
        <button onClick={() => setStep("stats")} className="w-full bg-yellow-500 text-black font-black py-3 rounded-xl">CONTINUAR →</button>
      </div>
    </div>
  ); }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4" style={{ fontFamily: "monospace" }}>
      <div className="max-w-lg w-full bg-gray-900 border-4 border-yellow-600 rounded-2xl p-7">
        <h2 className="text-xl font-black text-yellow-400 mb-5 text-center">TUS DATOS</h2>
        <div className="space-y-3">
          <div><label className="text-yellow-400 font-bold text-sm mb-1 block">Altura (cm)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175" className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 text-white rounded-xl outline-none"/></div>
          <div><label className="text-yellow-400 font-bold text-sm mb-1 block">Peso (kg)</label><input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="75" className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 text-white rounded-xl outline-none"/></div>
          <div><label className="text-yellow-400 font-bold text-sm mb-2 block">Días/semana</label><div className="grid grid-cols-7 gap-1">{[1,2,3,4,5,6,7].map(n => <button key={n} onClick={() => setGoal(n)} className={`py-2.5 rounded-xl font-black text-sm border-2 ${goal === n ? "bg-yellow-500 border-yellow-300 text-black" : "bg-gray-800 border-gray-700 text-white"}`}>{n}</button>)}</div></div>
          <button onClick={() => { if (!height || !weight) { showMsg("Completá altura y peso", "err"); return; } onDone({ name, race, archetype: arch || "barbarian", level: 1, exp: 0, gold: 100, stats: { ...RACES[race].stats }, height: parseInt(height), weight: parseFloat(weight), weeklyGoal: goal, createdAt: new Date().toISOString() }); }} className="w-full bg-yellow-500 text-black font-black py-4 rounded-xl text-xl">¡COMENZAR!</button>
        </div>
      </div>
      {toast && <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl font-black text-sm shadow-2xl ${toast.type === "err" ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>{toast.msg}</div>}
    </div>
  );
}

// ── COLD ALERTS ──
function ColdAlertsCard({ alerts }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-indigo-950 border-2 border-indigo-700 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🥶</span>
          <span className="text-indigo-300 font-black text-sm">MÚSCULOS FRÍOS</span>
          <span className="bg-indigo-800 text-indigo-300 text-xs font-black px-2 py-0.5 rounded-full">{alerts.length}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-indigo-500"/> : <ChevronDown className="w-4 h-4 text-indigo-500"/>}
      </button>
      {open && (
        <div className="px-3 pb-3 flex flex-wrap gap-1.5">
          {alerts.map(m => <span key={m} className="bg-indigo-900 text-indigo-200 text-xs px-2.5 py-1 rounded-full font-bold border border-indigo-700">{m}</span>)}
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ──
export default function GymQuest() {
  const [authMode, setAuthMode] = useState(null);
  const [char, setChar] = useState(null);
  const [checks, setChecks] = useState([]);
  const [plans, setPlans] = useState([]);
  const [owned, setOwned] = useState([]);
  const [equippedTitle, setEquippedTitle] = useState(null);
  const [equippedSkin, setEquippedSkin] = useState(null);
  const [coachId, setCoachId] = useState("nippard");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // UI state
  const [tab, setTab] = useState("home");
  const [trainTab, setTrainTab] = useState("check");
  const [profileTab, setProfileTab] = useState("stats");
  const [calView, setCalView] = useState("week");
  const [bodySide, setBodySide] = useState("front");
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showCoachPicker, setShowCoachPicker] = useState(false);

  // Modals
  const [showCheck, setShowCheck] = useState(false);
  const [editingCheck, setEditingCheck] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [showPlanEditor, setShowPlanEditor] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({ name: "", category: "EMPUJE", exercises: [] });
  const [planExIn, setPlanExIn] = useState({ exercise: "", customExercise: "", weight: "", reps: "10", sets: "3" });
  const [usePlanCustomEx, setUsePlanCustomEx] = useState(false);

  // Check state
  const [nc, setNc] = useState({ exercises: [], category: "", notes: "" });
  const [exIn, setExIn] = useState({ exercise: "", customExercise: "", weight: "", reps: "", sets: "3" });
  const [useCustomEx, setUseCustomEx] = useState(false);

  useEffect(() => {
    const auth = storage.get("gq_auth"), c = storage.get("gq_char"), ch = storage.get("gq_checks");
    const co = storage.get("gq_coach"), pl = storage.get("gq_plans"), ow = storage.get("gq_owned"), eq = storage.get("gq_equipped");
    if (auth) setAuthMode(auth); if (c) setChar(c); if (ch) setChecks(ch);
    if (co) setCoachId(co); if (pl) setPlans(pl); if (ow) setOwned(ow);
    if (eq) { setEquippedTitle(eq.title || null); setEquippedSkin(eq.skin || null); }
    setLoading(false);
  }, []);

  const showMsg = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const saveChar = c => { storage.set("gq_char", c); setChar(c); };
  const saveChecks = c => { storage.set("gq_checks", c); setChecks(c); };
  const savePlans = p => { storage.set("gq_plans", p); setPlans(p); };
  const saveOwned = o => { storage.set("gq_owned", o); setOwned(o); };
  const saveEquipped = (title, skin) => { storage.set("gq_equipped", { title, skin }); setEquippedTitle(title); setEquippedSkin(skin); };

const handleGuest = () => { storage.set("gq_auth", "guest"); setAuthMode("guest"); };

const handleGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    storage.set("gq_auth", "google");
    storage.set("gq_uid", user.uid);
    // Si era invitado, migrar datos locales a Firestore
    if (char) {
      await setDoc(doc(db, "users", user.uid), {
        char: { ...char, name: char.name || user.displayName },
        checks,
        plans,
        owned,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } else {
      // Intentar cargar datos existentes de Firestore
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        if (data.char) saveChar(data.char);
        if (data.checks) saveChecks(data.checks);
        if (data.plans) savePlans(data.plans);
        if (data.owned) saveOwned(data.owned);
      }
    }
    setAuthMode("google");
    showMsg(`✅ Bienvenido ${user.displayName}!`);
  } catch (e) {
    showMsg("Error al conectar con Google", "err");
  }
};

const handleLogout = async () => {
  if (authMode === "google") await signOut(auth);
  storage.set("gq_auth", null);
  storage.set("gq_uid", null);
  setAuthMode(null);
};

  const submitCheck = () => {
    if (!nc.category) { showMsg("Elegí una categoría", "err"); return; }
    if (!nc.exercises.length) { showMsg("Agregá al menos un ejercicio", "err"); return; }
    const { exp, gold } = calcPoints(nc, char);
    const obj = { id: Date.now(), timestamp: new Date().toISOString(), ...nc, exp, gold };
    const newChecks = [...checks, obj]; saveChecks(newChecks);
    const newExp = (char.exp || 0) + exp, newLvl = calcLevel(newExp), oldLvl = calcLevel(char.exp || 0);
    const stats = { ...char.stats };
    if (newLvl > oldLvl) { stats.str = (stats.str || 0) + 1; stats.agi = (stats.agi || 0) + 1; stats.vit = (stats.vit || 0) + 1; }
    saveChar({ ...char, exp: newExp, gold: (char.gold || 0) + gold, level: newLvl, stats });
    const no = [...owned]; let changed = false;
    if (newChecks.length >= 1 && !no.includes("medal_first")) { no.push("medal_first"); changed = true; setTimeout(() => showMsg("🥇 ¡Medalla: Primer Golpe!", "badge"), 1000); }
    if (newChecks.length >= 10 && !no.includes("title_iron")) { no.push("title_iron"); changed = true; }
    if (changed) saveOwned(no);
    if (newLvl > oldLvl) showMsg(`🎉 LEVEL UP Nv.${newLvl}! +${exp} EXP`, "level");
    else showMsg(`✅ +${exp} EXP · +${gold}🪙`, "ok");
    setShowCheck(false); setNc({ exercises: [], category: "", notes: "" }); setExIn({ exercise: "", customExercise: "", weight: "", reps: "", sets: "3" }); setUseCustomEx(false);
  };

  const buyItem = item => {
    if (owned.includes(item.id)) { showMsg("Ya lo tenés", "err"); return; }
    if (item.cost > (char.gold || 0)) { showMsg("Sin Gold suficiente 🪙", "err"); return; }
    saveOwned([...owned, item.id]); saveChar({ ...char, gold: (char.gold || 0) - item.cost }); showMsg(`✅ Compraste: ${item.name}`);
  };
  const equipItem = item => { if (item.type === "title") saveEquipped(item.id, equippedSkin); if (item.type === "skin") saveEquipped(equippedTitle, item.id); };

  const deleteCheck = (checkId) => {
    const check = checks.find(c => c.id === checkId);
    if (!check) return;
    const newChecks = checks.filter(c => c.id !== checkId);
    saveChecks(newChecks);
    const newExp = Math.max(0, (char.exp || 0) - (check.exp || 0));
    const newGold = Math.max(0, (char.gold || 0) - (check.gold || 0));
    saveChar({ ...char, exp: newExp, gold: newGold, level: calcLevel(newExp) });
    showMsg("🗑️ Check eliminado");
  };

  const openEditCheck = (check) => {
    setEditingCheck(check.id);
    setNc({ exercises: check.exercises || [], category: check.category, notes: check.notes || "", date: check.timestamp.split("T")[0] });
    setShowCheck(true);
  };

  const submitEditCheck = () => {
    if (!nc.category) { showMsg("Elegí una categoría", "err"); return; }
    if (!nc.exercises.length) { showMsg("Agregá al menos un ejercicio", "err"); return; }
    const oldCheck = checks.find(c => c.id === editingCheck);
    const { exp, gold } = calcPoints(nc, char);
    const updatedCheck = { ...oldCheck, ...nc, timestamp: nc.date ? new Date(nc.date).toISOString() : oldCheck.timestamp, exp, gold };
    const newChecks = checks.map(c => c.id === editingCheck ? updatedCheck : c);
    saveChecks(newChecks);
    const expDiff = exp - (oldCheck.exp || 0);
    const goldDiff = gold - (oldCheck.gold || 0);
    const newExp = Math.max(0, (char.exp || 0) + expDiff);
    const newGold = Math.max(0, (char.gold || 0) + goldDiff);
    saveChar({ ...char, exp: newExp, gold: newGold, level: calcLevel(newExp) });
    showMsg(`✅ Check actualizado · ${expDiff >= 0 ? "+" : ""}${expDiff} EXP`);
    setShowCheck(false); setEditingCheck(null); setNc({ exercises: [], category: "", notes: "" }); setExIn({ exercise: "", customExercise: "", weight: "", reps: "", sets: "3" }); setUseCustomEx(false);
  };

  const handleImport = importedPlans => {
    const newPlans = [...plans, ...importedPlans.map(p => ({ ...p, id: Date.now() + Math.random(), exercises: (p.exercises || []).map((ex, i) => ({ ...ex, id: Date.now() + i })) }))];
    savePlans(newPlans); setShowImport(false); showMsg(`✅ ${importedPlans.length} planes importados`);
  };

  const savePlanForm = () => {
    if (!planForm.name || !planForm.exercises.length) { showMsg("Completá nombre y ejercicios", "err"); return; }
    let updated = editingPlan ? plans.map(p => p.id === editingPlan ? { ...planForm, id: editingPlan } : p) : [...plans, { ...planForm, id: Date.now() }];
    savePlans(updated); setShowPlanEditor(false); showMsg("Plan guardado ✅");
  };

  const addPlanEx = () => {
    const exName = usePlanCustomEx ? planExIn.customExercise.trim() : planExIn.exercise;
    if (!exName || !planExIn.reps) return;
    setPlanForm(p => ({ ...p, exercises: [...p.exercises, { id: Date.now(), exercise: exName, weight: planExIn.weight || "0", reps: planExIn.reps, sets: planExIn.sets }] }));
    setPlanExIn({ exercise: "", customExercise: "", weight: "", reps: "10", sets: "3" }); setUsePlanCustomEx(false);
  };

  // Computed values
  const lvl = calcLevel(char?.exp || 0);
  const totalExp = char?.exp || 0, curLvlExp = expForLevel(lvl), nextLvlExp = expForLevel(lvl + 1);
  const expPct = Math.min(((totalExp - curLvlExp) / (nextLvlExp - curLvlExp)) * 100, 100);
  const streak = calcStreak(checks), heatData = getMuscleHeat(checks);
  const todayMuscles = checks.filter(c => sameDay(c.timestamp, new Date())).reduce((acc, c) => { getMusclesFromExercises(c.exercises || []).forEach(m => acc.add(m)); return acc; }, new Set());
  const coldAlerts = Object.entries(heatData).filter(([, d]) => d > 13).map(([m]) => MUSCLE_MAP[m].name);
  const archData = ARCHETYPES[char?.archetype] || ARCHETYPES.barbarian;
  const titleItem = equippedTitle ? SHOP_ITEMS[equippedTitle] : null;
  const skinItem = equippedSkin ? SHOP_ITEMS[equippedSkin] : null;
  const coachObj = COACHES[coachId] || COACHES.nippard;

  const wizAdv = (() => {
    const cats = ["EMPUJE","TIRÓN","PIERNA","CARDIO"], cat = cats[(checks.length || 0) % cats.length];
    const cc = checks.filter(c => c.category === cat).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const n = cc.length, sType = n > 0 && n % 8 === 0 ? "deload" : n > 0 && n % 4 === 3 ? "variation" : "progress";
    const starters = { EMPUJE:[{exercise:"Press Banca",weight:"50",reps:"10",sets:"3"},{exercise:"Press Militar",weight:"30",reps:"10",sets:"3"}], TIRÓN:[{exercise:"Remo con Barra",weight:"50",reps:"10",sets:"3"},{exercise:"Dominadas",weight:"0",reps:"6",sets:"3"}], PIERNA:[{exercise:"Sentadilla",weight:"50",reps:"10",sets:"3"},{exercise:"Prensa",weight:"90",reps:"12",sets:"3"}], CARDIO:[{exercise:"Correr",weight:"0",reps:"20",sets:"1"}] };
    const lastEx = cc[0]?.exercises || [];
    const exs = n === 0 ? starters[cat] : lastEx.length > 0 ? lastEx.map(ex => ({ ...ex, weight: (parseFloat(ex.weight) + 2.5).toFixed(1), suggested: true })) : starters[cat] || [];
    return { cat, sType, exs, tip: COACHES[coachId]?.tips[n % COACHES[coachId].tips.length] };
  })();

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="text-center"><div className="text-6xl mb-3 animate-pulse">⚔️</div><div className="text-yellow-400 font-black text-2xl" style={{ fontFamily: "monospace" }}>GYMQUEST</div></div></div>;
  if (!authMode) return <LoginScreen onGuest={handleGuest} onGoogle={handleGoogle}/>;
  if (!char) return <CharCreation onDone={saveChar} showMsg={showMsg} toast={toast}/>;

  const ExInputInline = ({ value, onChange, useCustom, onToggleCustom, category }) => (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button onClick={() => onToggleCustom(false)} className={`flex-1 py-1.5 rounded-lg text-xs font-black border ${!useCustom ? "bg-yellow-500 border-yellow-300 text-black" : "bg-gray-800 border-gray-700 text-gray-400"}`}>Lista</button>
        <button onClick={() => onToggleCustom(true)} className={`flex-1 py-1.5 rounded-lg text-xs font-black border ${useCustom ? "bg-yellow-500 border-yellow-300 text-black" : "bg-gray-800 border-gray-700 text-gray-400"}`}>✏️ Escribir</button>
      </div>
      {useCustom ? <input type="text" placeholder="Escribí el ejercicio..." value={value.customExercise} onChange={e => onChange({ ...value, customExercise: e.target.value })} className="w-full px-3 py-2.5 bg-gray-800 text-yellow-400 border border-yellow-700 rounded-xl text-sm outline-none"/> :
        <select value={value.exercise} onChange={e => onChange({ ...value, exercise: e.target.value })} className="w-full px-3 py-2.5 bg-gray-800 text-yellow-400 border border-gray-700 rounded-xl text-sm outline-none"><option value="">-- Elegí ejercicio --</option>{(EXERCISE_CATEGORIES[category] || []).map(ex => <option key={ex} value={ex}>{ex}</option>)}</select>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24" style={{ fontFamily: "monospace" }}>
      {toast && <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl font-black text-sm shadow-2xl pointer-events-none ${toast.type === "err" ? "bg-red-600" : toast.type === "level" ? "bg-yellow-500 text-black" : toast.type === "badge" ? "bg-purple-600" : "bg-green-600"}`}>{toast.msg}</div>}

      {/* HEADER */}
      <div className="bg-gray-900 border-b-4 border-yellow-700 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2"><span className="text-2xl">{RACES[char.race]?.icon}</span><div><div className="flex items-center gap-1.5"><span className="text-yellow-400 font-black">{char.name}</span>{titleItem && <span className="text-xs text-yellow-600 bg-yellow-950 px-1.5 py-0.5 rounded-full border border-yellow-800">{titleItem.icon}</span>}</div><div className="text-green-400 text-xs">Nv.{lvl} · {archData.name}</div></div></div>
          <div className="flex items-center gap-3"><div className="flex items-center gap-1"><Flame className="w-4 h-4 text-orange-500"/><span className="text-orange-400 font-black text-sm">{streak}</span></div><span className="text-yellow-400 font-bold text-sm">{char.gold}🪙</span><button onClick={handleLogout} className="text-gray-600 hover:text-gray-400"><LogOut className="w-4 h-4"/></button></div>
        </div>
        <div className="max-w-xl mx-auto mt-2"><div className="bg-gray-800 h-2 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700" style={{ width: `${expPct}%` }}/></div><div className="flex justify-between text-xs text-gray-600 mt-0.5"><span>{totalExp - curLvlExp} EXP</span><span>Nv.{lvl + 1} en {nextLvlExp - totalExp}</span></div></div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-4">

        {/* ── HOME ── */}
        {tab === "home" && <div className="space-y-4">
          {/* Character card */}
          <div className={`border-4 rounded-2xl p-4 bg-gradient-to-br ${skinItem?.id === "skin_fire" ? "from-orange-950 to-red-950 border-orange-600" : skinItem?.id === "skin_shadow" ? "from-slate-900 to-gray-950 border-slate-600" : skinItem?.id === "skin_champion" ? "from-yellow-950 to-amber-950 border-yellow-500" : "from-blue-950 to-indigo-950 border-blue-700"}`}>
            <div className="flex items-center gap-3"><div className="relative"><div className="text-5xl">{archData.icon}</div>{skinItem?.id === "skin_fire" && <div className="absolute -bottom-1 -right-1 text-base animate-pulse">🔥</div>}</div><div className="flex-1"><div className="flex items-center gap-2 flex-wrap"><span className="text-yellow-400 font-black text-lg">{char.name}</span>{titleItem && <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-800">{titleItem.icon} {titleItem.name}</span>}</div><div className="text-blue-300 text-xs">Nv.{lvl} · {archData.name}</div></div><div className="text-right"><div className="text-yellow-400 font-black">{char.gold}🪙</div><div className="text-orange-400 font-bold text-sm flex items-center gap-1 justify-end"><Flame className="w-3 h-3"/>{streak}d</div></div></div>
          </div>

          {coldAlerts.length > 0 && <ColdAlertsCard alerts={coldAlerts} />}

          {/* Calendar */}
          <div className="bg-gray-900 border-4 border-gray-700 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-yellow-400 font-black flex items-center gap-2"><Calendar className="w-4 h-4"/>CALENDARIO</h2>
              <div className="flex gap-1 bg-gray-800 rounded-xl p-1">
                <button onClick={() => setCalView("week")} className={`px-3 py-1 rounded-lg text-xs font-black ${calView === "week" ? "bg-yellow-500 text-black" : "text-gray-400"}`}>Semana</button>
                <button onClick={() => setCalView("month")} className={`px-3 py-1 rounded-lg text-xs font-black ${calView === "month" ? "bg-yellow-500 text-black" : "text-gray-400"}`}>Mes</button>
              </div>
            </div>
            {calView === "week" ? <WeekCalendar checks={checks} onDayClick={(d, dc) => setSelectedDay({ date: d, checks: dc })}/> : <MonthCalendar checks={checks} onDayClick={(d, dc) => setSelectedDay({ date: d, checks: dc })}/>}
            <div className="mt-3 pt-3 border-t border-gray-800 flex justify-between text-xs text-gray-600"><span>Tocá un día para ver el detalle</span><span className="text-yellow-600">{checks.length} entrenos total</span></div>
          </div>

          {/* Body map */}
          <div className="bg-gray-900 border-4 border-gray-700 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3"><h2 className="text-yellow-400 font-black">🗺️ MAPA MUSCULAR</h2><div className="flex gap-1 bg-gray-800 rounded-xl p-1"><button onClick={() => { setBodySide("front"); setSelectedMuscle(null); }} className={`px-3 py-1 rounded-lg text-xs font-black ${bodySide === "front" ? "bg-yellow-500 text-black" : "text-gray-400"}`}>FRENTE</button><button onClick={() => { setBodySide("back"); setSelectedMuscle(null); }} className={`px-3 py-1 rounded-lg text-xs font-black ${bodySide === "back" ? "bg-yellow-500 text-black" : "text-gray-400"}`}>ESPALDA</button></div></div>
            <div className="flex gap-4"><div style={{ width: "140px", flexShrink: 0 }}><BodyMap heatData={heatData} activeNow={todayMuscles} side={bodySide} onMuscleClick={setSelectedMuscle}/></div><div className="flex-1 space-y-2">{selectedMuscle ? (<div className="rounded-xl p-3 border-2" style={{ borderColor: heatColor(heatData[selectedMuscle], todayMuscles.has(selectedMuscle)), backgroundColor: "#111827" }}><div className="font-black text-white text-sm">{MUSCLE_MAP[selectedMuscle]?.name}</div><div className="text-sm mt-0.5 font-bold" style={{ color: heatColor(heatData[selectedMuscle], todayMuscles.has(selectedMuscle)) }}>{heatLabel(heatData[selectedMuscle])}</div><div className="text-xs text-gray-500 mt-1">{MUSCLE_MAP[selectedMuscle]?.exercises.slice(0,3).join(", ")}</div><button onClick={() => setSelectedMuscle(null)} className="text-xs text-gray-600 mt-1">✕ cerrar</button></div>) : <p className="text-gray-600 text-xs italic mt-2">Tocá un músculo 👆</p>}<div className="space-y-1">{[["#ef4444","Hoy/Ayer"],["#f97316","2-3 días"],["#eab308","4-6 días"],["#22c55e","1-2 sem"],["#6366f1","2+ sem ⚠️"],["#1f2937","Nunca"]].map(([c,l]) => (<div key={l} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full border border-gray-700 flex-shrink-0" style={{ backgroundColor: c }}/><span className="text-xs text-gray-500">{l}</span></div>))}</div></div></div>
            {todayMuscles.size > 0 && <div className="mt-3 pt-3 border-t border-gray-800"><div className="text-xs text-gray-500 font-bold mb-1.5">💪 HOY TRABAJASTE:</div><div className="flex flex-wrap gap-1">{[...todayMuscles].map(m => <span key={m} className="text-xs px-2 py-0.5 rounded-full border font-bold" style={{ color: MUSCLE_MAP[m]?.color, borderColor: MUSCLE_MAP[m]?.color + "44", backgroundColor: MUSCLE_MAP[m]?.color + "11" }}>{MUSCLE_MAP[m]?.name}</span>)}</div></div>}
          </div>

          <div className="bg-gray-900 border-2 border-green-900 rounded-2xl p-4"><div className="flex justify-between items-center mb-2"><span className="text-green-400 font-black text-sm">SEMANA ACTUAL</span><span className="text-green-300 font-black">{getWeekChecks(checks)}/{char.weeklyGoal}</span></div><div className="flex gap-1.5">{Array.from({ length: char.weeklyGoal }, (_, i) => <div key={i} className={`flex-1 h-3 rounded-full ${i < getWeekChecks(checks) ? "bg-green-500" : "bg-gray-800 border border-gray-700"}`}/>)}</div></div>
          <div className="grid grid-cols-3 gap-2">{[{l:"Entrenos",v:checks.length,c:"text-yellow-400"},{l:"Racha",v:`${streak}d`,c:"text-orange-400"},{l:"Semana",v:getWeekChecks(checks),c:"text-green-400"}].map(s => (<div key={s.l} className="bg-gray-900 border-2 border-gray-800 rounded-xl p-3 text-center"><div className={`text-xl font-black ${s.c}`}>{s.v}</div><div className="text-xs text-gray-600">{s.l}</div></div>))}</div>
        </div>}

        {/* ── TRAIN ── */}
        {tab === "train" && <div className="space-y-3">
          <div className="flex gap-1 bg-gray-900 border-2 border-gray-800 rounded-xl p-1">{[{id:"check",l:"⚡ Check"},{id:"wizard",l:"🧙 Coach"},{id:"plans",l:"📋 Planes"}].map(t => (<button key={t.id} onClick={() => setTrainTab(t.id)} className={`flex-1 py-2 rounded-lg text-xs font-black ${trainTab === t.id ? "bg-yellow-500 text-black" : "text-yellow-400"}`}>{t.l}</button>))}</div>

          {trainTab === "check" && <div className="space-y-3">
            <button onClick={() => setShowCheck(true)} className="w-full bg-gradient-to-r from-green-700 to-emerald-700 border-4 border-green-500 text-white font-black py-5 rounded-2xl text-xl flex items-center justify-center gap-3"><Plus className="w-7 h-7"/>REGISTRAR ENTRENAMIENTO</button>
            <div className="bg-gray-900 border-2 border-gray-800 rounded-2xl p-4"><div className="text-gray-500 font-black text-xs mb-3">ÚLTIMAS SESIONES</div>{checks.length === 0 && <p className="text-gray-700 text-sm text-center py-4">Sin entrenamientos aún</p>}{[...checks].sort((a,b) => new Date(b.timestamp)-new Date(a.timestamp)).slice(0,5).map(c => <div key={c.id} className="flex items-center gap-3 py-2.5 border-b border-gray-800 last:border-0"><div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.category==="EMPUJE"?"bg-red-500":c.category==="TIRÓN"?"bg-blue-500":c.category==="PIERNA"?"bg-green-500":c.category==="CARDIO"?"bg-orange-500":"bg-purple-500"}`}/><div className="flex-1"><div className="text-white font-bold text-sm">{c.category}</div><div className="text-gray-600 text-xs">{new Date(c.timestamp).toLocaleDateString("es-AR")} · {c.exercises?.slice(0,2).map(e=>e.exercise).join(", ")||"sin ejercicios"}</div></div><div className="text-green-400 text-xs font-black mr-2">+{c.exp||0} XP</div><button onClick={() => openEditCheck(c)} className="text-gray-600 hover:text-yellow-400 p-1"><Edit2 className="w-3.5 h-3.5"/></button><button onClick={() => deleteCheck(c.id)} className="text-gray-600 hover:text-red-400 p-1"><Trash2 className="w-3.5 h-3.5"/></button></div>)}</div>
          </div>}

          {trainTab === "wizard" && <div className="space-y-3">
            <div className="bg-gray-900 border-2 border-gray-800 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3"><span className="text-gray-400 font-black text-sm">COACH ACTIVO</span><button onClick={() => setShowCoachPicker(p => !p)} className="text-yellow-400 text-xs font-bold flex items-center gap-1">Cambiar {showCoachPicker ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}</button></div>
              {showCoachPicker && <div className="space-y-1.5 mb-3">{Object.entries(COACHES).map(([k,c]) => { const ok = lvl >= c.unlockLevel; return (<button key={k} onClick={() => { if (!ok) { showMsg(`Necesitás Nv.${c.unlockLevel}`, "err"); return; } setCoachId(k); storage.set("gq_coach", k); setShowCoachPicker(false); }} className={`w-full flex items-center gap-2 p-2.5 rounded-xl border-2 text-left ${coachId === k ? "border-yellow-500 bg-yellow-950" : "border-gray-700 bg-gray-800"} ${!ok ? "opacity-40" : ""}`}><span className="text-2xl">{c.icon}</span><div className="flex-1"><div className="text-sm font-black text-white">{c.name}</div><div className="text-xs text-gray-500">{c.title} · Nv.{c.unlockLevel}</div></div>{!ok && <Lock className="w-3 h-3 text-gray-600"/>}{coachId === k && <Check className="w-4 h-4 text-yellow-400"/>}</button>); })}</div>}
              <div className={`rounded-xl p-3 bg-gradient-to-br ${coachObj.color} border ${coachObj.border} flex items-start gap-3`}><span className="text-3xl">{coachObj.icon}</span><div><div className={`font-black ${coachObj.accent}`}>{coachObj.name}</div><p className="text-gray-400 text-xs mt-0.5">{coachObj.philosophy}</p></div></div>
            </div>
            <div className={`rounded-2xl p-4 border-4 bg-gradient-to-br ${wizAdv.sType==="deload"?"from-blue-950 to-slate-950 border-blue-700":wizAdv.sType==="variation"?"from-purple-950 to-indigo-950 border-purple-700":"from-green-950 to-emerald-950 border-green-700"}`}>
              <div className="font-black text-lg mb-1">{wizAdv.sType==="deload"?"🌙 DESCARGA":wizAdv.sType==="variation"?"🔄 VARIANTE":"📈 PROGRESIÓN"}</div>
              <div className="text-yellow-400 font-black mb-3">HOY → {wizAdv.cat}</div>
              {wizAdv.exs.map((ex,i) => <div key={i} className="bg-black bg-opacity-30 rounded-xl p-2.5 flex justify-between mb-1.5"><div><div className="text-white font-bold text-sm">{ex.exercise}</div><div className="text-gray-500 text-xs">{ex.sets} series</div></div><div className="text-right"><div className="text-yellow-400 font-black">{parseFloat(ex.weight)>0?`${ex.weight}kg`:"PC"}</div><div className="text-gray-500 text-xs">{ex.reps} reps{ex.suggested&&<span className="text-green-400 ml-1">↑</span>}</div></div></div>)}
              <button onClick={() => { setNc(p => ({ ...p, category: wizAdv.cat, exercises: wizAdv.exs.map((ex,i) => ({ ...ex, id: Date.now()+i })) })); setShowCheck(true); }} className="w-full mt-2 bg-yellow-500 text-black font-black py-2.5 rounded-xl flex items-center justify-center gap-2"><Play className="w-4 h-4"/>USAR ESTE PLAN</button>
            </div>
            {wizAdv.tip && <div className={`rounded-xl p-4 border-2 bg-gradient-to-br ${coachObj.color} ${coachObj.border}`}><div className="flex items-start gap-2"><span className="text-xl">{coachObj.icon}</span><div><span className={`font-black text-sm ${coachObj.accent}`}>Consejo de hoy:</span><p className="text-gray-300 text-sm mt-0.5">{wizAdv.tip.text}</p><p className="text-gray-600 text-xs mt-1 italic">📄 {wizAdv.tip.paper}</p></div></div></div>}
            <div className="bg-gray-900 border-2 border-gray-800 rounded-2xl p-4"><div className={`font-black text-sm mb-2 ${coachObj.accent}`}>📚 BIBLIOTECA</div>{coachObj.tips.map((tip,i) => <div key={i} className="py-2 border-b border-gray-800 last:border-0"><div className="flex items-start gap-2"><span>{tip.icon}</span><p className="text-gray-300 text-sm">{tip.text}</p></div><p className="text-gray-700 text-xs mt-0.5 pl-6 italic">📄 {tip.paper}</p></div>)}</div>
          </div>}

          {trainTab === "plans" && <div className="space-y-3">
            <div className="flex gap-2">
              <button onClick={() => { setEditingPlan(null); setPlanForm({name:"",category:"EMPUJE",exercises:[]}); setShowPlanEditor(true); }} className="flex-1 bg-green-700 border-2 border-green-500 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2"><Plus className="w-4 h-4"/>NUEVO</button>
              <button onClick={() => setShowImport(true)} className="flex-1 bg-purple-700 border-2 border-purple-500 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2"><FileText className="w-4 h-4"/>IMPORTAR</button>
            </div>
            {plans.length === 0 && <div className="text-gray-600 text-center py-8 text-sm">Sin planes aún.<br/><span className="text-purple-400">Importá tu rutina del bloc de notas ↑</span></div>}
            {plans.map(p => <div key={p.id} className="bg-gray-900 border-2 border-yellow-800 rounded-2xl p-4"><div className="flex justify-between items-start mb-2"><div><div className="text-yellow-400 font-black">{p.name}</div><div className={`inline-block text-xs font-bold px-2 py-0.5 rounded mt-0.5 ${p.category==="EMPUJE"?"bg-red-900 text-red-300":p.category==="TIRÓN"?"bg-blue-900 text-blue-300":p.category==="PIERNA"?"bg-green-900 text-green-300":p.category==="CARDIO"?"bg-orange-900 text-orange-300":"bg-purple-900 text-purple-300"}`}>{p.category}</div></div><div className="flex gap-2"><button onClick={() => { setEditingPlan(p.id); setPlanForm({...p}); setShowPlanEditor(true); }} className="text-gray-500 hover:text-yellow-400"><Edit2 className="w-4 h-4"/></button><button onClick={() => savePlans(plans.filter(x => x.id !== p.id))} className="text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4"/></button></div></div>{(p.exercises||[]).slice(0,3).map((ex,i) => <div key={i} className="text-gray-500 text-xs">• {ex.exercise} {parseFloat(ex.weight)>0?`${ex.weight}kg`:"PC"}×{ex.reps}×{ex.sets}s</div>)}{p.exercises?.length>3&&<div className="text-gray-700 text-xs">+{p.exercises.length-3} más</div>}<button onClick={() => { setNc(pp => ({...pp, category:p.category, exercises:p.exercises.map((ex,i)=>({...ex,id:Date.now()+i}))})); setShowCheck(true); }} className="w-full mt-3 bg-yellow-700 text-yellow-200 font-black py-2 rounded-xl text-sm flex items-center justify-center gap-2"><Play className="w-3 h-3"/>USAR PLAN</button></div>)}
          </div>}
        </div>}

        {/* ── PROFILE ── */}
        {tab === "profile" && <div className="space-y-3">
          <div className="flex gap-1 bg-gray-900 border-2 border-gray-800 rounded-xl p-1">{[{id:"stats",l:"📊 Stats"},{id:"shop",l:"🛒 Tienda"},{id:"badges",l:"🏅 Logros"}].map(t => (<button key={t.id} onClick={() => setProfileTab(t.id)} className={`flex-1 py-2 rounded-lg text-xs font-black ${profileTab === t.id ? "bg-yellow-500 text-black" : "text-yellow-400"}`}>{t.l}</button>))}</div>

          {profileTab === "stats" && <div className="space-y-3">
            <div className="bg-gray-900 border-2 border-gray-800 rounded-2xl p-4"><div className="text-gray-400 font-black text-xs mb-3">TUS NÚMEROS</div><div className="grid grid-cols-2 gap-2">{[{l:"Total",v:checks.length},{l:"Racha",v:`${streak}d`},{l:"Semana",v:getWeekChecks(checks)},{l:"Nivel",v:lvl},{l:"EXP",v:totalExp},{l:"Gold",v:`${char.gold}🪙`}].map(s => (<div key={s.l} className="bg-gray-800 rounded-xl p-3"><div className="text-yellow-400 font-black text-xl">{s.v}</div><div className="text-gray-600 text-xs">{s.l}</div></div>))}</div></div>
            <div className="bg-gray-900 border-2 border-gray-800 rounded-2xl p-4"><div className="text-gray-400 font-black text-xs mb-3">⚔️ STATS RPG</div><div className="grid grid-cols-3 gap-2">{[{l:"FUERZA",v:char.stats?.str||0,c:"text-red-400"},{l:"AGILIDAD",v:char.stats?.agi||0,c:"text-green-400"},{l:"VITALIDAD",v:char.stats?.vit||0,c:"text-blue-400"}].map(s => (<div key={s.l} className="bg-gray-800 rounded-xl p-3 text-center"><div className={`text-2xl font-black ${s.c}`}>{s.v}</div><div className="text-xs text-gray-600">{s.l}</div></div>))}</div></div>
            <div className="bg-gray-900 border-2 border-gray-800 rounded-2xl p-4"><div className="text-gray-400 font-black text-xs mb-3">POR CATEGORÍA</div>{Object.keys(EXERCISE_CATEGORIES).map(cat => { const cnt = checks.filter(c=>c.category===cat).length, mx = Math.max(...Object.keys(EXERCISE_CATEGORIES).map(c=>checks.filter(ch=>ch.category===c).length),1); return <div key={cat} className="mb-2"><div className="flex justify-between text-xs mb-1"><span className="text-gray-400">{cat}</span><span className="text-yellow-400 font-bold">{cnt}</span></div><div className="bg-gray-800 h-2 rounded-full"><div className={`h-2 rounded-full ${cat==="EMPUJE"?"bg-red-500":cat==="TIRÓN"?"bg-blue-500":cat==="PIERNA"?"bg-green-500":cat==="CARDIO"?"bg-orange-500":"bg-purple-500"}`} style={{width:`${(cnt/mx)*100}%`}}/></div></div>; })}</div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 flex items-center justify-between"><div><div className="text-gray-400 text-xs font-black">CUENTA</div><div className="text-white text-sm font-bold">👤 Invitado</div></div><button onClick={() => showMsg("Google login próximamente 🔜")} className="bg-gray-700 border border-gray-600 text-white text-xs font-black px-3 py-2 rounded-xl flex items-center gap-1"><LogIn className="w-3 h-3"/>Sincronizar</button></div>
          </div>}

          {profileTab === "shop" && <div className="space-y-3">
            <div className="bg-yellow-950 border-2 border-yellow-700 rounded-xl p-3 flex items-center gap-3"><span className="text-3xl">🪙</span><div><div className="text-yellow-400 font-black text-xl">{char.gold} Gold</div><div className="text-yellow-700 text-xs">Ganás Gold entrenando</div></div></div>
            <div className="text-gray-500 font-black text-xs">✨ COSMÉTICOS</div>
            {Object.values(SHOP_ITEMS).filter(i=>i.type==="skin").map(item => { const isOwned=owned.includes(item.id),isEquipped=equippedSkin===item.id; return <div key={item.id} className={`border-2 rounded-2xl p-4 ${rarityBg(item.rarity)}`}><div className="flex items-center gap-3"><span className="text-3xl">{item.icon}</span><div className="flex-1"><div className={`font-black ${rarityColor(item.rarity)}`}>{item.name}</div><div className="text-gray-500 text-xs">{item.desc}</div></div>{isOwned?(<button onClick={()=>isEquipped?saveEquipped(equippedTitle,null):equipItem(item)} className={`px-3 py-1.5 rounded-xl text-xs font-black border ${isEquipped?"bg-yellow-500 text-black border-yellow-300":"bg-gray-700 text-gray-300 border-gray-600"}`}>{isEquipped?"Equipado":"Equipar"}</button>):(<button onClick={()=>buyItem(item)} className="px-3 py-1.5 rounded-xl text-xs font-black bg-yellow-600 text-black border border-yellow-400">{item.cost}🪙</button>)}</div></div>; })}
            <div className="text-gray-500 font-black text-xs">🏷️ TÍTULOS</div>
            {Object.values(SHOP_ITEMS).filter(i=>i.type==="title").map(item => { const isOwned=owned.includes(item.id),isEquipped=equippedTitle===item.id; return <div key={item.id} className={`border-2 rounded-2xl p-3 ${isOwned?rarityBg(item.rarity):"border-gray-800 bg-gray-900 opacity-50"}`}><div className="flex items-center gap-3"><span className="text-2xl">{item.icon}</span><div className="flex-1"><div className={`font-black text-sm ${isOwned?rarityColor(item.rarity):"text-gray-600"}`}>{item.name}</div><div className="text-gray-600 text-xs">{item.desc}</div></div>{isOwned?(<button onClick={()=>isEquipped?saveEquipped(null,equippedSkin):equipItem(item)} className={`px-3 py-1.5 rounded-xl text-xs font-black border ${isEquipped?"bg-yellow-500 text-black border-yellow-300":"bg-gray-700 text-gray-300 border-gray-600"}`}>{isEquipped?"Equipado":"Equipar"}</button>):<div className="flex items-center gap-1 text-gray-700"><Lock className="w-3 h-3"/><span className="text-xs">Auto-unlock</span></div>}</div></div>; })}
          </div>}

          {profileTab === "badges" && <div className="space-y-3">
            {Object.values(SHOP_ITEMS).filter(i=>i.type==="medal").map(item => { const isOwned=owned.includes(item.id); return <div key={item.id} className={`border-2 rounded-2xl p-4 flex items-center gap-3 ${isOwned?rarityBg(item.rarity):"border-gray-800 bg-gray-900"}`}><span className={`text-3xl ${!isOwned?"grayscale opacity-30":""}`}>{item.icon}</span><div className="flex-1"><div className={`font-black text-sm ${isOwned?rarityColor(item.rarity):"text-gray-700"}`}>{item.name}</div><div className={`text-xs ${isOwned?"text-gray-400":"text-gray-700"}`}>{item.desc}</div></div>{isOwned&&<Check className="w-5 h-5 text-green-400"/>}</div>; })}
            <div className="text-gray-500 font-black text-xs mt-1">🎯 MISIONES</div>
            {[{t:"Primer golpe",d:"1 entrenamiento",target:1,current:checks.length,xp:100},{t:"Guerrero",d:"10 entrenamientos",target:10,current:checks.length,xp:300},{t:"Racha ardiente",d:"5 días seguidos",target:5,current:streak,xp:400},{t:"Centurión",d:"25 entrenamientos",target:25,current:checks.length,xp:700},{t:"Leyenda",d:"100 entrenamientos",target:100,current:checks.length,xp:2000}].map((m,i) => { const done=m.current>=m.target; return <div key={i} className={`border-2 rounded-2xl p-3 ${done?"border-green-800 bg-green-950":"border-gray-800 bg-gray-900"}`}><div className="flex justify-between items-center mb-1.5"><div><div className={`font-black text-sm ${done?"text-green-400 line-through":"text-white"}`}>{m.t}</div><div className="text-gray-600 text-xs">{m.d}</div></div><div className="text-green-400 text-xs font-black">+{m.xp} XP</div></div><div className="bg-gray-800 h-1.5 rounded-full"><div className={`h-1.5 rounded-full ${done?"bg-green-500":"bg-yellow-500"}`} style={{width:`${Math.min((m.current/m.target)*100,100)}%`}}/></div><div className="text-gray-700 text-xs mt-0.5 text-right">{Math.min(m.current,m.target)}/{m.target}</div></div>; })}
          </div>}
        </div>}
      </div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 inset-x-0 bg-gray-900 border-t-4 border-gray-800 z-40">
        <div className="max-w-xl mx-auto flex">{[{id:"home",icon:Home,l:"Inicio"},{id:"train",icon:Zap,l:"Entrenar"},{id:"profile",icon:User,l:"Perfil"}].map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 flex flex-col items-center py-3 gap-0.5 ${tab === t.id ? "text-yellow-400" : "text-gray-600"}`}><t.icon className="w-5 h-5"/><span className="text-xs font-black">{t.l}</span>{tab === t.id && <div className="w-1 h-1 rounded-full bg-yellow-400"/>}</button>))}</div>
      </div>

      {/* FAB */}
      {tab !== "profile" && <button onClick={() => setShowCheck(true)} className="fixed bottom-20 right-4 bg-yellow-500 border-4 border-yellow-300 rounded-full p-4 shadow-2xl z-50"><Plus className="w-6 h-6 text-black"/></button>}

      {/* MODALS */}
      {showCheck && <CheckModal nc={nc} setNc={setNc} exIn={exIn} setExIn={setExIn} useCustomEx={useCustomEx} setUseCustomEx={setUseCustomEx} char={char} checks={checks} editingCheck={editingCheck} onSubmit={editingCheck ? submitEditCheck : submitCheck} onClose={() => { setShowCheck(false); setEditingCheck(null); setNc({exercises:[],category:"",notes:""}); setExIn({exercise:"",customExercise:"",weight:"",reps:"",sets:"3"}); setUseCustomEx(false); }}/>}
      {showImport && <ImportModal onClose={() => setShowImport(false)} onImport={handleImport} showMsg={showMsg}/>}
      {selectedDay && <DayDetailModal date={selectedDay.date} dayChecks={selectedDay.checks} onClose={() => setSelectedDay(null)}/>}

      {/* PLAN EDITOR */}
      {showPlanEditor && <div className="fixed inset-0 bg-black bg-opacity-95 flex items-end sm:items-center justify-center p-4 z-50">
        <div className="bg-gray-900 border-4 border-green-700 rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
          <div className="p-4 border-b-2 border-green-800 flex justify-between sticky top-0 bg-gray-900"><h2 className="text-green-400 font-black">{editingPlan?"EDITAR":"NUEVO"} PLAN</h2><button onClick={() => setShowPlanEditor(false)} className="text-gray-500"><X className="w-5 h-5"/></button></div>
          <div className="p-4 space-y-3">
            <input value={planForm.name} onChange={e => setPlanForm(p => ({...p,name:e.target.value}))} placeholder="Nombre del plan" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl outline-none"/>
            <div className="grid grid-cols-3 gap-1.5">{Object.keys(EXERCISE_CATEGORIES).map(cat => (<button key={cat} onClick={() => setPlanForm(p=>({...p,category:cat}))} className={`py-2 rounded-xl text-xs font-black border ${planForm.category===cat?"border-green-400 bg-green-900 text-green-300":"border-gray-700 bg-gray-800 text-gray-400"}`}>{cat}</button>))}</div>
            {planForm.exercises.map(ex => <div key={ex.id} className="bg-gray-800 rounded-xl p-2 flex items-center gap-2"><div className="flex-1 text-sm"><span className="text-yellow-400 font-bold">{ex.exercise}</span><span className="text-gray-500 ml-2">{ex.sets}×{ex.reps} {parseFloat(ex.weight)>0?`${ex.weight}kg`:"PC"}</span></div><button onClick={() => setPlanForm(p=>({...p,exercises:p.exercises.filter(e=>e.id!==ex.id)}))} className="text-gray-600 hover:text-red-400"><X className="w-3 h-3"/></button></div>)}
            <ExInputInline value={planExIn} onChange={setPlanExIn} useCustom={usePlanCustomEx} onToggleCustom={setUsePlanCustomEx} category={planForm.category}/>
            <div className="grid grid-cols-3 gap-2"><input type="number" placeholder="Kg" value={planExIn.weight} onChange={e=>setPlanExIn(p=>({...p,weight:e.target.value}))} className="px-3 py-2 bg-gray-800 text-yellow-400 border border-gray-700 rounded-xl text-sm outline-none"/><input type="number" placeholder="Reps" value={planExIn.reps} onChange={e=>setPlanExIn(p=>({...p,reps:e.target.value}))} className="px-3 py-2 bg-gray-800 text-yellow-400 border border-gray-700 rounded-xl text-sm outline-none"/><input type="number" placeholder="Series" value={planExIn.sets} onChange={e=>setPlanExIn(p=>({...p,sets:e.target.value}))} className="px-3 py-2 bg-gray-800 text-yellow-400 border border-gray-700 rounded-xl text-sm outline-none"/></div>
            <button onClick={addPlanEx} className="w-full bg-gray-700 border border-gray-600 text-white py-2 rounded-xl text-sm font-black flex items-center justify-center gap-2"><Plus className="w-4 h-4"/>Agregar</button>
            <button onClick={savePlanForm} className="w-full bg-green-600 border-2 border-green-400 text-white py-3 rounded-2xl font-black text-lg flex items-center justify-center gap-2"><Check className="w-5 h-5"/>GUARDAR PLAN</button>
          </div>
        </div>
      </div>}
    </div>
  );
}
