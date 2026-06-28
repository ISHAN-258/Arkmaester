import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { playSoundStyle } from "../../utils/audio.js";
import { SOUND_OPTIONS, POMO_PRESETS } from "../../utils/constants.js";

export default function PomoSettings({ onClose }) {
  const { pomoMins, setPomoMins, selectedSound, setSelectedSound } = useApp();
  const [f, setF] = useState(pomoMins.focus);
  const [s, setS] = useState(pomoMins.short);
  const [l, setL] = useState(pomoMins.long);

  const applyPreset = (mins) => { setF(mins); setPomoMins({ ...pomoMins, focus: mins }); };

  const save = () => {
    setPomoMins({ focus: +f || 25, short: +s || 5, long: +l || 15 });
    onClose?.();
  };

  return (
    <div style={{ padding:".2rem 0" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
        <h4 style={{ margin:0, fontSize:".95rem", fontWeight:800 }}>⚙ Timer Settings</h4>
        <button className="modal-close" onClick={onClose} style={{ position:"static" }}>✕</button>
      </div>

      <div className="pomo-row">
        <label>Focus Duration</label>
        <div className="duration-presets">
          {POMO_PRESETS.map((p) => (
            <button key={p} className={`dur-preset${f === p ? " active":""}`} onClick={() => applyPreset(p)}>{p}m</button>
          ))}
        </div>
        <input
          className="pomo-input"
          type="number" min="1" max="120" value={f}
          onChange={(e) => setF(+e.target.value)}
          style={{ marginTop:".5rem" }}
        />
        <span style={{ fontSize:".7rem", color:"var(--muted)", marginLeft:".4rem" }}>min</span>
      </div>

      <div className="pomo-row">
        <label>Short Break</label>
        <input className="pomo-input" type="number" min="1" max="30" value={s} onChange={(e) => setS(+e.target.value)} />
        <span style={{ fontSize:".7rem", color:"var(--muted)", marginLeft:".4rem" }}>min</span>
      </div>

      <div className="pomo-row">
        <label>Long Break</label>
        <input className="pomo-input" type="number" min="5" max="60" value={l} onChange={(e) => setL(+e.target.value)} />
        <span style={{ fontSize:".7rem", color:"var(--muted)", marginLeft:".4rem" }}>min</span>
      </div>

      <div style={{ marginBottom:".85rem" }}>
        <label style={{ display:"block", fontSize:".68rem", color:"var(--muted)", fontFamily:"var(--mono)", letterSpacing:"1px", textTransform:"uppercase", marginBottom:".5rem" }}>
          Completion Sound
        </label>
        {SOUND_OPTIONS.map((opt) => (
          <div
            key={opt.id}
            className={`sound-option${selectedSound === opt.id ? " selected":""}`}
            onClick={() => setSelectedSound(opt.id)}
          >
            <div>
              <div className="sound-label">{opt.label}</div>
              <div className="sound-sub">{opt.sub}</div>
            </div>
            <button
              className="sound-preview"
              onClick={(e) => { e.stopPropagation(); playSoundStyle(opt.id); }}
            >▶ preview</button>
          </div>
        ))}
      </div>

      <button className="btn-p" style={{ width:"100%", marginTop:".25rem" }} onClick={save}>
        Apply Settings
      </button>
    </div>
  );
}
