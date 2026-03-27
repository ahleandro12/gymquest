import { useState, useEffect, useRef } from "react";
import { doc, setDoc, getDoc, deleteDoc, collection, orderBy, limit, onSnapshot, query, addDoc, updateDoc, where, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { Flame, CheckCircle, XCircle, Users, Crown, UserMinus, Send, MessageCircle } from "lucide-react";
import { ARCHETYPES } from "../data.js";

const ADMIN_UID = "UWneNlnhwlVS3LCpbKGslFrR4462";

function calcLvl(exp) { return Math.floor(Math.sqrt((exp || 0) / 50)) + 1; }
function expPct(exp) {
  const lvl = calcLvl(exp);
  const cur = Math.pow(lvl - 1, 2) * 50;
  const next = Math.pow(lvl, 2) * 50;
  return Math.min(((exp - cur) / (next - cur)) * 100, 100);
}
function getStreak(checks) {
  if (!checks?.length) return 0;
  const sorted = [...checks].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  let streak = 0, cur = new Date(); cur.setHours(0, 0, 0, 0);
  for (const c of sorted) {
    const d = new Date(c.timestamp); d.setHours(0, 0, 0, 0);
    const diff = Math.floor((cur - d) / 86400000);
    if (diff === streak) streak++; else if (diff > streak) break;
  }
  return streak;
}

// ── MEMBER CARD ──
function MemberCard({ member, rank, isYou, isAdmin, onKick }) {
  const { char, checks = [] } = member;
  const lvl = calcLvl(char?.exp || 0);
  const streak = getStreak(checks);
  const pct = expPct(char?.exp || 0);
  const archData = ARCHETYPES[char?.archetype] || ARCHETYPES.barbarian;
  const lastCheck = [...checks].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

  return (
    <div className={`bg-gray-900 border-2 rounded-2xl p-4 ${isYou ? "border-yellow-600" : rank === 1 ? "border-amber-500" : rank === 2 ? "border-gray-400" : rank === 3 ? "border-amber-700" : "border-gray-700"}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <div className="text-3xl">{archData.icon}</div>
          {rank <= 3 && !isYou && <div className="absolute -top-1 -right-1 text-sm">{rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}</div>}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-black">{char?.name}</span>
            {isYou && <span className="text-xs bg-yellow-900 text-yellow-400 px-1.5 py-0.5 rounded-full border border-yellow-800">Vos</span>}
            {member.isGuest && <span className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-full border border-gray-700">Invitado</span>}
          </div>
          <div className="text-gray-500 text-xs">Nv.{lvl} · {archData.name}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-orange-400 text-sm font-black flex items-center gap-1 justify-end">
              <Flame className="w-3 h-3"/>{streak}d
            </div>
            <div className="text-gray-600 text-xs">{checks.length} entrenos</div>
          </div>
          {isAdmin && !isYou && (
            <button onClick={() => onKick(member.uid, char?.name)} className="text-gray-600 hover:text-red-400 p-1 ml-1">
              <UserMinus className="w-4 h-4"/>
            </button>
          )}
        </div>
      </div>
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{char?.exp || 0} EXP</span>
          <span>Nv.{lvl + 1}</span>
        </div>
        <div className="bg-gray-800 h-2 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${pct}%` }}/>
        </div>
      </div>
      {lastCheck && (
        <div className="bg-gray-800 rounded-xl px-3 py-2 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${lastCheck.category === "EMPUJE" ? "bg-red-500" : lastCheck.category === "TIRÓN" ? "bg-blue-500" : lastCheck.category === "PIERNA" ? "bg-green-500" : lastCheck.category === "CARDIO" ? "bg-orange-500" : "bg-purple-500"}`}/>
          <div className="flex-1 text-xs text-gray-400">
            <span className="font-bold text-gray-300">{lastCheck.category}</span>
            <span className="mx-1">·</span>
            {lastCheck.exercises?.slice(0, 2).map(e => e.exercise).join(", ")}
          </div>
          <span className="text-green-400 text-xs font-black">+{lastCheck.exp || 0} XP</span>
        </div>
      )}
    </div>
  );
}

// ── RANKING ──
function RankingTab({ members }) {
  const [rankBy, setRankBy] = useState("exp");
  const sorted = [...members].sort((a, b) => {
    if (rankBy === "exp") return (b.char?.exp || 0) - (a.char?.exp || 0);
    if (rankBy === "streak") return getStreak(b.checks) - getStreak(a.checks);
    return (b.checks?.length || 0) - (a.checks?.length || 0);
  });
  return (
    <div className="space-y-3">
      <div className="flex gap-1 bg-gray-800 rounded-xl p-1">
        {[{id:"exp",l:"⚡ EXP"},{id:"streak",l:"🔥 Racha"},{id:"total",l:"💪 Entrenos"}].map(t => (
          <button key={t.id} onClick={() => setRankBy(t.id)} className={`flex-1 py-1.5 rounded-lg text-xs font-black ${rankBy === t.id ? "bg-yellow-500 text-black" : "text-gray-400"}`}>{t.l}</button>
        ))}
      </div>
      {sorted.map((m, i) => (
        <div key={m.uid} className={`flex items-center gap-3 p-3 rounded-xl border ${i === 0 ? "border-amber-500 bg-amber-950" : i === 1 ? "border-gray-500 bg-gray-900" : i === 2 ? "border-amber-800 bg-gray-900" : "border-gray-800 bg-gray-900"}`}>
          <div className="text-lg font-black w-6 text-center">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}`}</div>
          <div className="text-xl">{ARCHETYPES[m.char?.archetype]?.icon || "⚔️"}</div>
          <div className="flex-1">
            <div className="text-white font-black text-sm">{m.char?.name}</div>
            <div className="text-gray-600 text-xs">Nv.{calcLvl(m.char?.exp || 0)}</div>
          </div>
          <div className={`font-black text-sm ${rankBy === "exp" ? "text-blue-400" : rankBy === "streak" ? "text-orange-400" : "text-green-400"}`}>
            {rankBy === "exp" ? `${m.char?.exp || 0} XP` : rankBy === "streak" ? `${getStreak(m.checks)}d` : `${m.checks?.length || 0}`}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── CHAT ──
function ChatTab({ currentUid, currentChar }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "chat"), orderBy("createdAt", "asc"), limit(50));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsub();
  }, []);

  const sendMsg = async () => {
    if (!text.trim()) return;
    try {
      await addDoc(collection(db, "chat"), {
        text: text.trim(),
        uid: currentUid,
        name: currentChar?.name || "Guerrero",
        archetype: currentChar?.archetype || "barbarian",
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (e) { console.error(e); }
  };

  const handleKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } };

  return (
    <div className="flex flex-col h-[60vh]">
      <div className="flex-1 overflow-y-auto space-y-2 pb-2">
        {messages.length === 0 && <div className="text-gray-600 text-center py-8 text-sm">Sin mensajes aún. ¡Rompé el hielo! 🗡️</div>}
        {messages.map(m => {
          const isMe = m.uid === currentUid;
          const arch = ARCHETYPES[m.archetype] || ARCHETYPES.barbarian;
          return (
            <div key={m.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
              <div className="text-xl flex-shrink-0">{arch.icon}</div>
              <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                {!isMe && <div className="text-xs text-gray-500 mb-0.5 font-bold">{m.name}</div>}
                <div className={`px-3 py-2 rounded-2xl text-sm ${isMe ? "bg-yellow-700 text-white rounded-tr-sm" : "bg-gray-800 text-gray-200 rounded-tl-sm"}`}>
                  {m.text}
                </div>
                <div className="text-xs text-gray-700 mt-0.5">
                  {m.createdAt?.toDate ? m.createdAt.toDate().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) : ""}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>
      <div className="flex gap-2 pt-2 border-t border-gray-800">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Escribí un mensaje..."
          className="flex-1 px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-xl text-sm outline-none"
        />
        <button onClick={sendMsg} disabled={!text.trim()} className="bg-yellow-600 border border-yellow-500 text-black p-2.5 rounded-xl disabled:opacity-40">
          <Send className="w-4 h-4"/>
        </button>
      </div>
    </div>
  );
}

// ── SOLICITUDES ──
function SolicitudesTab({ onAccept, onReject }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "solicitudes"), where("status", "==", "pending"));
    const unsub = onSnapshot(q, snap => {
      setSolicitudes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="text-center py-8 text-gray-600 text-sm">Cargando...</div>;

  return (
    <div className="space-y-3">
      <div className="text-yellow-400 font-black text-sm">📬 SOLICITUDES PENDIENTES</div>
      {solicitudes.length === 0 && <div className="text-gray-600 text-center py-8 text-sm">Sin solicitudes pendientes</div>}
      {solicitudes.map(s => (
        <div key={s.id} className="bg-gray-900 border-2 border-gray-700 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">{ARCHETYPES[s.char?.archetype]?.icon || "⚔️"}</div>
            <div className="flex-1">
              <div className="text-white font-black">{s.char?.name}</div>
              <div className="text-gray-500 text-xs">Nv.{calcLvl(s.char?.exp || 0)} · {s.checks?.length || 0} entrenos</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onReject(s.id)} className="flex-1 bg-red-900 border border-red-700 text-red-300 py-2 rounded-xl text-sm font-black flex items-center justify-center gap-1">
              <XCircle className="w-4 h-4"/>Rechazar
            </button>
            <button onClick={() => onAccept(s)} className="flex-1 bg-green-800 border border-green-600 text-green-300 py-2 rounded-xl text-sm font-black flex items-center justify-center gap-1">
              <CheckCircle className="w-4 h-4"/>Aceptar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MAIN ALDEA ──
export default function AldeaTab({ currentUid, currentChar, currentChecks, authMode, char, checks, showMsg }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aldeaTab, setAldeaTab] = useState("feed");
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const isAdmin = currentUid === ADMIN_UID;
  const isGoogle = authMode === "google";

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("updatedAt", "desc"), limit(30));
    const unsub = onSnapshot(q, snap => {
      setMembers(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const sent = localStorage.getItem("gq_solicitud_sent");
    if (sent) setSolicitudEnviada(true);
  }, []);

  const handleSolicitud = async () => {
    if (!char) return;
    try {
      const id = `guest_${Date.now()}`;
      await setDoc(doc(db, "solicitudes", id), {
        char, checks, status: "pending",
        createdAt: new Date().toISOString(),
        guestId: id,
      });
      localStorage.setItem("gq_solicitud_sent", id);
      setSolicitudEnviada(true);
      showMsg("✅ Solicitud enviada, esperá que el admin la acepte");
    } catch (e) {
      showMsg("Error al enviar solicitud", "err");
    }
  };

  const handleAccept = async (solicitud) => {
    try {
      await setDoc(doc(db, "users", solicitud.id), {
        char: solicitud.char,
        checks: solicitud.checks || [],
        plans: [],
        owned: [],
        isGuest: true,
        updatedAt: new Date().toISOString()
      });
      await updateDoc(doc(db, "solicitudes", solicitud.id), { status: "accepted" });
      showMsg(`✅ ${solicitud.char?.name} aceptado en la aldea`);
    } catch (e) {
      showMsg("Error al aceptar", "err");
    }
  };

  const handleReject = async (id) => {
    try {
      await updateDoc(doc(db, "solicitudes", id), { status: "rejected" });
      showMsg("Solicitud rechazada");
    } catch (e) {
      showMsg("Error", "err");
    }
  };

  const handleKick = async (uid, name) => {
    if (!confirm(`¿Expulsar a ${name} de la aldea?`)) return;
    try {
      await deleteDoc(doc(db, "users", uid));
      showMsg(`⚔️ ${name} fue expulsado de la aldea`);
    } catch (e) {
      showMsg("Error al expulsar", "err");
    }
  };

  const allMembers = [
    ...(currentChar ? [{ uid: currentUid || "me", char: currentChar, checks: currentChecks || [], isYou: true }] : []),
    ...members.filter(m => m.uid !== currentUid)
  ];

  const tabs = [
    { id: "feed", l: "🏰 Feed" },
    { id: "ranking", l: "🏆 Ranking" },
    { id: "chat", l: "💬 Chat" },
    ...(isAdmin ? [{ id: "solicitudes", l: "📬 Solicitudes" }] : []),
  ];

  if (loading) return <div className="text-center py-12 text-gray-600">Cargando aldea...</div>;

  return (
    <div className="space-y-3">
      <div className="bg-gray-900 border-2 border-yellow-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🏰</span>
          <span className="text-yellow-400 font-black text-lg">ALDEA GYMQUEST</span>
          {isAdmin && <Crown className="w-4 h-4 text-yellow-400"/>}
        </div>
        <p className="text-gray-500 text-xs">{allMembers.length} guerrero{allMembers.length !== 1 ? "s" : ""} activo{allMembers.length !== 1 ? "s" : ""}</p>
      </div>

      {!isGoogle && (
        <div className="space-y-3">
          <div className="bg-gray-900 border-2 border-purple-700 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <div className="text-purple-300 font-black text-sm">👁️ Modo observador</div>
              <div className="text-gray-600 text-xs">Conectá con Google para chatear</div>
            </div>
            {solicitudEnviada ? (
              <div className="text-green-400 text-xs font-black">✅ Solicitud enviada</div>
            ) : (
              <button onClick={handleSolicitud} className="bg-purple-700 border border-purple-500 text-white font-black py-1.5 px-3 rounded-xl text-xs flex items-center gap-1">
                <Users className="w-3 h-3"/>Unirme
              </button>
            )}
          </div>
          <div className="flex gap-1 bg-gray-900 border-2 border-gray-800 rounded-xl p-1">
            {[{id:"feed",l:"🏰 Feed"},{id:"ranking",l:"🏆 Ranking"}].map(t => (
              <button key={t.id} onClick={() => setAldeaTab(t.id)} className={`flex-1 py-2 rounded-lg text-xs font-black ${aldeaTab === t.id ? "bg-yellow-500 text-black" : "text-yellow-400"}`}>{t.l}</button>
            ))}
          </div>
          {aldeaTab === "feed" && (
            <div className="space-y-3">
              {allMembers.map((m, i) => (
                <MemberCard key={m.uid} member={m} rank={i + 1} isYou={false} isAdmin={false} onKick={() => {}}/>
              ))}
            </div>
          )}
          {aldeaTab === "ranking" && <RankingTab members={allMembers}/>}
        </div>
      )}

      {isGoogle && (
        <>
          <div className="flex gap-1 bg-gray-900 border-2 border-gray-800 rounded-xl p-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setAldeaTab(t.id)} className={`flex-1 py-2 rounded-lg text-xs font-black ${aldeaTab === t.id ? "bg-yellow-500 text-black" : "text-yellow-400"}`}>{t.l}</button>
            ))}
          </div>

          {aldeaTab === "feed" && (
            <div className="space-y-3">
              {allMembers.length === 1 && (
                <div className="text-gray-600 text-center py-8 text-sm">
                  Sos el primero en la aldea 🥇<br/>
                  <span className="text-gray-700 text-xs">Invitá amigos para ver su progreso acá</span>
                </div>
              )}
              {allMembers.map((m, i) => (
                <MemberCard key={m.uid} member={m} rank={i + 1} isYou={m.isYou} isAdmin={isAdmin} onKick={handleKick}/>
              ))}
            </div>
          )}

          {aldeaTab === "ranking" && <RankingTab members={allMembers}/>}

          {aldeaTab === "chat" && <ChatTab currentUid={currentUid} currentChar={currentChar}/>}

          {aldeaTab === "solicitudes" && isAdmin && (
            <SolicitudesTab onAccept={handleAccept} onReject={handleReject}/>
          )}
        </>
      )}
    </div>
  );
}
