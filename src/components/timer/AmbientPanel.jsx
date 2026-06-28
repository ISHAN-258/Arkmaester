import { useAmbientSound, SOUNDS } from "../../hooks/useAmbientSound.js";

export default function AmbientPanel() {
  const { active, volume, play, setVolume } = useAmbientSound();

  return (
    <div className="ambient-panel">
      <h4>🎧 Ambient Sound</h4>
      <div style={{ display:"flex", gap:".4rem", flexWrap:"wrap", marginBottom:".75rem" }}>
        {Object.entries(SOUNDS).map(([id, { label }]) => (
          <button
            key={id}
            className={`ambient-btn${active===id?" active":""}`}
            onClick={() => play(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {active !== "off" && (
        <div style={{ display:"flex", alignItems:"center", gap:".6rem" }}>
          <span style={{ fontSize:".7rem", color:"var(--muted)", flexShrink:0, fontFamily:"var(--mono)" }}>Vol</span>
          <input
            type="range" min="0" max="1" step="0.05"
            value={volume}
            onChange={(e) => setVolume(+e.target.value)}
            className="volume-slider"
          />
          <span style={{ fontSize:".7rem", color:"var(--cyan)", fontFamily:"var(--mono)", minWidth:28, textAlign:"right" }}>
            {Math.round(volume*100)}%
          </span>
        </div>
      )}
    </div>
  );
}
