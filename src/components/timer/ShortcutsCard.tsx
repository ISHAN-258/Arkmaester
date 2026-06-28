import { Keyboard } from "lucide-react";

export default function ShortcutsCard() {
  const keys = [
    { cmd: "Spacebar", action: "Play / Pause Active Clock" },
    { cmd: "Escape", action: "Reset Current Timer Block" },
    { cmd: "Ctrl + Alt + O", action: "Go to Main Dashboard" },
    { cmd: "Ctrl + Alt + S", action: "Go to Pomodoro Timer" },
    { cmd: "Ctrl + Alt + T", action: "Go to Posture Focus Shield" },
    { cmd: "Ctrl + Alt + P", action: "Go to Routine Planner" },
    { cmd: "Ctrl + Alt + I", action: "Go to AI Analytics Intelligence" },
    { cmd: "Ctrl + Alt + H", action: "Go to Study Reports Logs" },
    { cmd: "Ctrl + Alt + C", action: "Go to AI Assistant Chat" },
  ];

  return (
    <div className="sc space-y-3">
      <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2">
        <Keyboard size={14} className="text-cyan-400" />
        <h3 style={{ fontSize: "0.85rem", fontWeight: "750", color: "var(--cyan)" }} className="sl m-0">
          POWER NAV MAP
        </h3>
      </div>

      <div className="space-y-2">
        {keys.map((k, idx) => (
          <div key={idx} className="flex justify-between items-center text-xs">
            <span style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", color: "var(--cyan)" }} className="bg-[#090d1a] border border-slate-800 px-1.5 py-0.5 rounded text-left">
              {k.cmd}
            </span>
            <span className="text-slate-400 text-right text-[11px]">
              {k.action}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
export type ShortcutsCardState = ReturnType<typeof ShortcutsCard>;
