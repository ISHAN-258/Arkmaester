import { useAmbientSound } from "../../hooks/useAmbientSound";
import { Play, Pause, Compass, CloudRain, Disc, Music } from "lucide-react";

export default function AmbientPanel() {
  const { isPlaying, soundName, togglePlay, changeSound } = useAmbientSound();

  const presets = [
    { id: "piano", icon: <Music size={14} />, name: "Tranquil Chord", desc: "Randomized Cmaj7 synth chimes" },
    { id: "rain", icon: <CloudRain size={14} />, name: "Muffled Rain", desc: "Lowpass synthesized white noise" },
    { id: "waves", icon: <Disc size={14} />, name: "Theta Waves", desc: "Binaural swells for focus flow" },
    { id: "focus", icon: <Compass size={14} />, name: "Deep Focus", desc: "Steady triangle frequency wave" },
  ];

  return (
    <div className="sc space-y-4">
      
      <div className="flex justify-between items-center">
        <h3 style={{ fontSize: "0.85rem", fontWeight: "750", color: "var(--cyan)" }} className="sl m-0">
          AMBIENT SOUND
        </h3>
        
        {/* Play/Mute toggle button */}
        <button 
          onClick={togglePlay}
          style={{
            padding: "0.45rem 1rem",
            fontSize: "0.78rem",
            fontWeight: "700",
            backgroundColor: isPlaying ? "rgba(255, 68, 68, 0.1)" : "rgba(0, 229, 255, 0.08)",
            borderColor: isPlaying ? "rgba(255, 68, 68, 0.3)" : "var(--cyan)",
            color: isPlaying ? "var(--red)" : "var(--cyan)",
            cursor: "pointer",
            border: "1px solid",
            borderRadius: "6px"
          }}
          className="flex items-center gap-1.5 hover:scale-[1.02] active:scale-95 transition"
        >
          {isPlaying ? (
            <>
              <Pause size={12} fill="currentColor" /> Unkey Sound
            </>
          ) : (
            <>
              <Play size={12} fill="currentColor" /> Key Sound
            </>
          )}
        </button>
      </div>

      {/* Preset List Selection */}
      <div className="space-y-2">
        {presets.map((p) => {
          const selected = soundName === p.id;
          return (
            <div 
              key={p.id}
              onClick={() => changeSound(p.id)}
              style={{
                backgroundColor: selected ? "rgba(15, 22, 40, 0.6)" : "transparent",
                borderColor: selected ? "var(--cyan)" : "transparent",
                cursor: "pointer",
              }}
              className="p-2 border.5 border rounded-lg flex items-center justify-between transition-all hover:bg-slate-900 border-transparent text-slate-300"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div style={{
                  width: "26px", height: "26px",
                  borderRadius: "50%",
                  backgroundColor: selected ? "rgba(0, 229, 255, 0.08)" : "rgba(10, 15, 30, 0.5)",
                  color: selected ? "var(--cyan)" : "var(--muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {p.icon}
                </div>
                <div className="min-w-0">
                  <h4 style={{ fontSize: "0.78rem", fontWeight: "bold", color: selected ? "var(--text)" : "slate-400" }}>
                    {p.name}
                  </h4>
                  <p style={{ fontSize: "0.65rem", color: "var(--muted)" }} className="truncate">
                    {p.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
export type AmbientPanelState = ReturnType<typeof AmbientPanel>;
