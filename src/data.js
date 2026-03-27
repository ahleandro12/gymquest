export const MUSCLE_MAP = {
  chest:        { name:"Pecho",         color:"#ef4444", exercises:["Press Banca","Press Inclinado","Aperturas Cable","Press Agarre Cerrado","Fondos","Dips con Peso","Aperturas Mancuernas"] },
  shoulders:    { name:"Hombros",       color:"#f97316", exercises:["Press Militar","Press Arnold","Elevaciones Laterales","Elevaciones Frontales","Face Pull","Pájaros","Shoulder Press"] },
  front_delt:   { name:"Deltoides ant", color:"#fb923c", exercises:["Press Militar","Press Arnold","Elevaciones Frontales","Press Banca","Press Inclinado"] },
  side_delt:    { name:"Deltoides lat", color:"#fbbf24", exercises:["Elevaciones Laterales","Face Pull","Pájaros","Remo al Mentón"] },
  rear_delt:    { name:"Deltoides pos", color:"#a3e635", exercises:["Face Pull","Pájaros","Remo en Polea","Pull Apart","Remo al Mentón"] },
  triceps:      { name:"Tríceps",       color:"#22c55e", exercises:["Press Agarre Cerrado","Fondos","Dips con Peso","Press Banca","Extensiones Tríceps","Pushdown","Skull Crusher","Extensión Overhead"] },
  biceps:       { name:"Bíceps",        color:"#10b981", exercises:["Curl Barra","Curl Martillo","Dominadas","Pullover","Curl Concentrado","Curl Inclinado","Curl Cable"] },
  back_upper:   { name:"Espalda alta",  color:"#06b6d4", exercises:["Dominadas","Remo en Polea","Face Pull","Remo con Barra","Pull Apart","Remo Mancuerna","Pullover","Jalón al Pecho"] },
  back_lower:   { name:"Espalda baja",  color:"#3b82f6", exercises:["Peso Muerto","Remo con Barra","Pullover","Hiperextensiones","Buenos Días"] },
  core:         { name:"Core",          color:"#8b5cf6", exercises:["Plancha","Ab Wheel","Crunch Cable","Elevación de Piernas","Deadbug","Pallof Press","Crunch","Sit Up","Dragon Flag","L-Sit"] },
  quads:        { name:"Cuádriceps",    color:"#ec4899", exercises:["Sentadilla","Prensa","Extensiones Cuáds","Estocadas","Sentadilla Búlgara","Hack Squat","Sentadilla Frontal","Sentadilla Goblet"] },
  hamstrings:   { name:"Isquios",       color:"#f43f5e", exercises:["Peso Muerto Rumano","Curl Femoral","Estocadas","Sentadilla Búlgara","Good Morning","Peso Muerto Piernas Rígidas"] },
  glutes:       { name:"Glúteos",       color:"#d946ef", exercises:["Hip Thrust","Peso Muerto Rumano","Sentadilla","Estocadas","Sentadilla Búlgara","Prensa","Abductor","Patada Glúteo"] },
  calves:       { name:"Pantorrillas",  color:"#0ea5e9", exercises:["Correr","Bici","Saltar la Soga","Sentadilla","Gemelos de pie","Gemelos sentado","Prensa punta pies"] },
  forearms:     { name:"Antebrazos",    color:"#64748b", exercises:["Curl Martillo","Curl Barra","Dominadas","Wrist Curl","Farmer Carry"] },
  cardio_muscles:{ name:"Cardio",       color:"#f59e0b", exercises:["Correr","Bici","Remo","Burpees","HIIT","Saltar la Soga","Elíptica","Natación","Caminata","Sprints","Escaladora"] },
};

export const EXERCISE_CATEGORIES = {
  EMPUJE: ["Press Banca","Press Militar","Press Inclinado","Fondos","Aperturas Cable","Press Agarre Cerrado","Dips con Peso","Elevaciones Laterales","Press Arnold","Extensiones Tríceps","Pushdown","Skull Crusher","Extensión Overhead","Elevaciones Frontales","Aperturas Mancuernas","Shoulder Press"],
  TIRÓN:  ["Dominadas","Remo con Barra","Peso Muerto","Pullover","Remo en Polea","Face Pull","Curl Barra","Curl Martillo","Curl Concentrado","Hiperextensiones","Pull Apart","Remo Mancuerna","Pájaros","Jalón al Pecho","Curl Inclinado","Curl Cable","Remo al Mentón","Buenos Días","Farmer Carry"],
  PIERNA: ["Sentadilla","Peso Muerto Rumano","Estocadas","Prensa","Curl Femoral","Extensiones Cuáds","Sentadilla Búlgara","Hip Thrust","Hack Squat","Good Morning","Abductor","Gemelos de pie","Gemelos sentado","Sentadilla Frontal","Sentadilla Goblet","Peso Muerto Piernas Rígidas","Patada Glúteo","Prensa punta pies"],
  CARDIO: ["Correr","Bici","Remo","Burpees","HIIT","Saltar la Soga","Elíptica","Natación","Caminata","Sprints","Escaladora"],
  CORE:   ["Plancha","Ab Wheel","Crunch Cable","Elevación de Piernas","Deadbug","Pallof Press","Crunch","Sit Up","Dragon Flag","L-Sit"],
};

export const RACES = {
  ectomorfo:{ name:"Ectomorfo", icon:"🏃", stats:{str:3,agi:7,vit:5}, bonus:"+20% EXP Cardio" },
  mesomorfo:{ name:"Mesomorfo", icon:"💪", stats:{str:6,agi:6,vit:6}, bonus:"+15% EXP Total" },
  endomorfo:{ name:"Endomorfo", icon:"🐻", stats:{str:8,agi:4,vit:7}, bonus:"+20% Fuerza, +30 Gold" },
};

export const ARCHETYPES = {
  barbarian:{ name:"Guerrero Bárbaro", icon:"⚔️", bonus:"+30% Fuerza, +40 Gold" },
  mage:     { name:"Mago Estratega",   icon:"🧙", bonus:"+35% EXP" },
  paladin:  { name:"Paladín Noble",    icon:"🛡️", bonus:"+20% stats" },
  assassin: { name:"Asesino Veloz",    icon:"🗡️", bonus:"+40% Agi" },
  arnold:   { name:"Arnold",           icon:"👑", bonus:"+15% stats" },
  zyzz:     { name:"Zyzz",             icon:"✨", bonus:"+35% EXP" },
  rocky:    { name:"Rocky Balboa",     icon:"🥊", bonus:"+25% Vit" },
  goku:     { name:"Goku",             icon:"🔥", bonus:"+40% EXP" },
};

export const SHOP_ITEMS = {
  title_iron:      { id:"title_iron",      type:"title", name:"El Hierro",       desc:"Completá 10 entrenamientos", icon:"🔩", cost:0,    rarity:"common" },
  title_consistent:{ id:"title_consistent",type:"title", name:"El Consistente",  desc:"Racha de 7 días",            icon:"🔥", cost:0,    rarity:"rare" },
  title_titan:     { id:"title_titan",     type:"title", name:"Titán",           desc:"Completá 50 entrenamientos", icon:"⚡", cost:0,    rarity:"epic" },
  title_legend:    { id:"title_legend",    type:"title", name:"La Leyenda",      desc:"100 entrenamientos",         icon:"👑", cost:0,    rarity:"legendary" },
  skin_gold:       { id:"skin_gold",       type:"skin",  name:"Marco Dorado",    desc:"Marco épico para tu avatar", icon:"🏅", cost:300,  rarity:"rare" },
  skin_fire:       { id:"skin_fire",       type:"skin",  name:"Aura de Fuego",   desc:"Tu personaje irradia llamas",icon:"🔥", cost:600,  rarity:"epic" },
  skin_shadow:     { id:"skin_shadow",     type:"skin",  name:"Sombra Oscura",   desc:"Skin oscuro estilo Dorian",  icon:"🌑", cost:800,  rarity:"epic" },
  skin_champion:   { id:"skin_champion",   type:"skin",  name:"Campeón Olímpico",desc:"El skin definitivo",         icon:"🏆", cost:1500, rarity:"legendary" },
  medal_first:     { id:"medal_first",     type:"medal", name:"Primer Golpe",    desc:"Primer entrenamiento",       icon:"🥇", cost:0,    rarity:"common" },
  medal_week:      { id:"medal_week",      type:"medal", name:"Semana Perfecta", desc:"7 días seguidos",            icon:"📅", cost:0,    rarity:"rare" },
  medal_bodybuilder:{ id:"medal_bodybuilder",type:"medal",name:"Bodybuilder",    desc:"Entrenaste todos los grupos", icon:"💪", cost:0,    rarity:"epic" },
};

export const COACHES = {
  nippard:{ id:"nippard", name:"Jeff Nippard",    title:"El Científico",   icon:"🔬", unlockLevel:1,  color:"from-cyan-950 to-blue-950",   border:"border-cyan-700",  accent:"text-cyan-300",
    philosophy:"Evidencia científica ante todo.",
    tips:[{icon:"📐",text:"Rango 6-12 reps para hipertrofia óptima.",paper:"Schoenfeld 2017"},{icon:"⏱️",text:"Pausas 2-3 min para fuerza, 60-90s para hipertrofia.",paper:"de Salles 2009"},{icon:"📊",text:"10-20 sets por músculo por semana.",paper:"Krieger 2010"},{icon:"🎯",text:"Ejercicios con carga en estiramiento = más hipertrofia.",paper:"Pedrosa 2022"},{icon:"⚖️",text:"+2.5% carga por semana es suficiente.",paper:"Baz-Valle 2022"}] },
  meadows:{ id:"meadows", name:"John Meadows",    title:"Mountain Dog",    icon:"🐕", unlockLevel:5,  color:"from-orange-950 to-red-950",  border:"border-orange-700",accent:"text-orange-300",
    philosophy:"Llevá cada set al límite absoluto.",
    tips:[{icon:"💥",text:"Drop sets: bajá 20% y continuá sin pausa.",paper:"Schoenfeld 2011"},{icon:"🔄",text:"Rest-pause: fallo, 15s pausa, 2-3 reps más.",paper:"Prestes 2019"},{icon:"🩸",text:"Pump finisher: 20-30 reps con 40% del peso.",paper:"Pearson 2015"}] },
  cbum:   { id:"cbum",    name:"Chris Bumstead",  title:"Classic Physique",icon:"🏆", unlockLevel:8,  color:"from-amber-950 to-yellow-950",border:"border-amber-700", accent:"text-amber-300",
    philosophy:"Equilibrio entre masa y estética.",
    tips:[{icon:"⚖️",text:"V-taper: dominadas anchas crean ilusión de cintura pequeña.",paper:"Perini 2015"},{icon:"💎",text:"70-75% del máximo priorizando conexión mente-músculo.",paper:"Calatayud 2016"}] },
  dorian: { id:"dorian",  name:"Dorian Yates",    title:"The Shadow",      icon:"👁️", unlockLevel:12, color:"from-slate-900 to-gray-950",  border:"border-slate-600", accent:"text-slate-300",
    philosophy:"Un solo set al fallo absoluto.",
    tips:[{icon:"💀",text:"Fallo muscular verdadero requiere spotter.",paper:"Morton 2016"},{icon:"⏳",text:"Cadencia 4-2-1: excéntrico lento, pausa, concéntrico.",paper:"Burd 2012"}] },
  pavel:  { id:"pavel",   name:"Pavel Tsatsouline",title:"El Maestro",     icon:"🎖️", unlockLevel:10, color:"from-red-950 to-rose-950",    border:"border-red-800",   accent:"text-red-300",
    philosophy:"La fuerza es una habilidad neurológica.",
    tips:[{icon:"🎯",text:"Stop 2-3 reps antes del fallo. El SNC se adapta mejor.",paper:"Zatsiorsky 1995"},{icon:"📅",text:"Greasing the groove: mismo movimiento frecuente al 50-60%.",paper:"Sale 1988"}] },
};

export const QUIZ = [
  {q:"¿Tu objetivo principal?",    opts:[{t:"Ser el más fuerte",a:"barbarian"},{t:"Estética perfecta",a:"zyzz"},{t:"Superarme cada día",a:"goku"},{t:"Balance y salud",a:"paladin"}]},
  {q:"¿Cómo preferís entrenar?",   opts:[{t:"Peso pesado, pocas reps",a:"barbarian"},{t:"Planificado, científico",a:"mage"},{t:"Funcional, calistenia",a:"assassin"},{t:"Old school, clásico",a:"rocky"}]},
  {q:"¿Qué te inspira?",           opts:[{t:"Leyendas del bodybuilding",a:"arnold"},{t:"Cultura gym",a:"zyzz"},{t:"Películas de superación",a:"rocky"},{t:"Anime, límites infinitos",a:"goku"}]},
];
