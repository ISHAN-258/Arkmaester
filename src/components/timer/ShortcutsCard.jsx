export default function ShortcutsCard() {
  const SHORTCUTS = [
    ["Space",  "Play / Pause timer"],
    ["R",      "Reset timer"],
    ["S",      "Skip mode"],
    ["1–7",    "Navigate pages"],
  ];
  return (
    <div className="sc">
      <h4>⌨ Keyboard Shortcuts</h4>
      {SHORTCUTS.map(([k, v]) => (
        <div className="shortcut-row" key={k}>
          <span>{v}</span>
          <span className="kbd">{k}</span>
        </div>
      ))}
    </div>
  );
}
