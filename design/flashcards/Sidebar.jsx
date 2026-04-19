function Sidebar() {
  const items = [
    { id: "dashboard", icon: "layout-dashboard", label: "Dashboard", active: true },
    { id: "journal", icon: "book-open", label: "Daily Journal" },
    { id: "study", icon: "graduation-cap", label: "Study Guide" },
    { id: "flash", icon: "layers", label: "Flashcards", count: 12 },
    { id: "vocab", icon: "list", label: "Vocabulary List" },
    { id: "numbers", icon: "hash", label: "Numbers Guide" },
    { id: "grammar", icon: "languages", label: "Grammar Points" },
    { id: "reviews", icon: "clock", label: "Recent Reviews" },
  ];
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });
  return (
    <aside className="sb">
      <div className="sb-logo">
        <div className="tile">汉</div>
        <div className="wm">HanziBit</div>
      </div>
      <div className="eyebrow sb-section-label">Notebook Sections</div>
      <div>
        {items.map(it => (
          <button key={it.id} className={`sb-item ${it.active ? "active" : ""}`}>
            <i data-lucide={it.icon}></i>
            <span>{it.label}</span>
            {it.count && <span className="ct">{it.count}</span>}
          </button>
        ))}
      </div>
      <div className="sb-spacer"></div>
      <div className="sb-cod">
        <div className="eyebrow">Character of the day</div>
        <div className="hz">
          <div className="sq">九</div>
          <div>
            <div className="mn">jiǔ · nine</div>
            <div className="py">HSK 1 · numbers</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
window.Sidebar = Sidebar;
