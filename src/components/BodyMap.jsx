import { MUSCLE_MAP } from "../data.js";
import { heatColor } from "../utils.js";

export default function BodyMap({ heatData, activeNow = new Set(), side = "front", onMuscleClick }) {
  const muscles = side === "front" ? {
    chest:     { d:"M 68,88 Q 80,82 92,88 Q 94,100 88,108 Q 80,111 72,108 Q 66,100 68,88 Z" },
    shoulders: { d:"M 52,78 Q 63,70 70,80 Q 67,90 59,91 Q 51,87 52,78 Z M 108,78 Q 97,70 90,80 Q 93,90 101,91 Q 109,87 108,78 Z" },
    biceps:    { d:"M 46,93 Q 53,88 57,97 Q 56,109 49,113 Q 43,111 44,101 Z M 114,93 Q 107,88 103,97 Q 104,109 111,113 Q 117,111 116,101 Z" },
    forearms:  { d:"M 43,115 Q 49,113 51,121 Q 50,133 46,135 Q 42,133 42,123 Z M 117,115 Q 111,113 109,121 Q 110,133 114,135 Q 118,133 118,123 Z" },
    core:      { d:"M 70,109 Q 80,106 90,109 L 91,132 Q 80,135 69,132 Z" },
    quads:     { d:"M 63,150 Q 72,146 76,152 L 75,180 Q 68,184 62,180 Z M 97,150 Q 88,146 84,152 L 85,180 Q 92,184 98,180 Z" },
    calves:    { d:"M 62,193 Q 69,191 72,197 L 71,220 Q 65,222 61,218 Z M 98,193 Q 91,191 88,197 L 89,220 Q 95,222 99,218 Z" },
  } : {
    back_upper:{ d:"M 65,84 Q 80,79 95,84 L 96,104 Q 80,108 64,104 Z" },
    back_lower:{ d:"M 65,104 Q 80,100 95,104 L 95,122 Q 80,126 65,122 Z" },
    triceps:   { d:"M 46,91 Q 53,87 57,95 Q 57,107 51,111 Q 45,109 45,99 Z M 114,91 Q 107,87 103,95 Q 103,107 109,111 Q 115,109 115,99 Z" },
    glutes:    { d:"M 63,128 Q 80,124 97,128 L 98,148 Q 80,152 62,148 Z" },
    hamstrings:{ d:"M 63,150 Q 72,146 76,153 L 74,180 Q 66,182 62,177 Z M 97,150 Q 88,146 84,153 L 86,180 Q 94,182 98,177 Z" },
    calves:    { d:"M 62,193 Q 69,191 72,197 L 71,220 Q 65,222 61,218 Z M 98,193 Q 91,191 88,197 L 89,220 Q 95,222 99,218 Z" },
  };

  return (
    <svg viewBox="0 0 160 244" style={{ width: "100%", height: "100%", maxHeight: "260px" }}>
      <g opacity="0.12" fill="#94a3b8">
        <ellipse cx="80" cy="34" rx="15" ry="19"/>
        <rect x="74" y="51" width="12" height="11" rx="3"/>
        <path d="M 57,62 Q 50,68 50,90 L 49,142 Q 49,150 57,152 L 71,154 L 71,149 L 89,149 L 89,154 L 103,152 Q 111,150 111,142 L 110,90 Q 110,68 103,62 Z"/>
        <path d="M 51,62 Q 43,67 41,82 L 39,112 Q 39,119 43,121 L 51,121 L 55,91 Z"/>
        <path d="M 109,62 Q 117,67 119,82 L 121,112 Q 121,119 117,121 L 109,121 L 105,91 Z"/>
        <path d="M 43,121 L 41,143 Q 41,149 45,150 L 51,150 L 53,123 Z"/>
        <path d="M 117,121 L 119,143 Q 119,149 115,150 L 109,150 L 107,123 Z"/>
        <ellipse cx="46" cy="154" rx="6" ry="7"/>
        <ellipse cx="114" cy="154" rx="6" ry="7"/>
        <path d="M 57,152 L 55,192 Q 55,202 61,204 L 73,204 L 75,153 Z"/>
        <path d="M 103,152 L 105,192 Q 105,202 99,204 L 87,204 L 85,153 Z"/>
        <path d="M 61,204 L 61,229 Q 61,235 67,236 L 75,236 L 75,204 Z"/>
        <path d="M 99,204 L 99,229 Q 99,235 93,236 L 85,236 L 85,204 Z"/>
        <ellipse cx="70" cy="237" rx="9" ry="4"/>
        <ellipse cx="90" cy="237" rx="9" ry="4"/>
      </g>
      {Object.entries(muscles).map(([id, { d }]) => {
        const days = heatData[id] ?? 999;
        const isNow = activeNow.has(id);
        const color = heatColor(days, isNow);
        return (
          <g key={id} onClick={() => onMuscleClick && onMuscleClick(id)} style={{ cursor: "pointer" }}>
            <path d={d} fill={color} fillOpacity="0.9" stroke="#000" strokeWidth="0.5"/>
            {isNow && <path d={d} fill="none" stroke={color} strokeWidth="2" opacity="0.6"/>}
          </g>
        );
      })}
      <text x="80" y="243" textAnchor="middle" fill="#374151" fontSize="6.5" fontFamily="monospace" fontWeight="bold">
        {side === "front" ? "── FRENTE ──" : "── ESPALDA ──"}
      </text>
    </svg>
  );
}
