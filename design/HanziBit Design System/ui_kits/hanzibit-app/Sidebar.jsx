const { useState, useEffect } = React;

function Sidebar({ active, onNav }) {
  const items = [
    { id: "dashboard", icon: "layout-dashboard", label: "Dashboard" },
    { id: "journal", icon: "book-open", label: "Daily Journal" },
    { id: "study", icon: "graduation-cap", label: "Study Guide" },
    { id: "flash", icon: "layers", label: "Flashcards", count: 12 },
    { id: "vocab", icon: "list", label: "Vocabulary List" },
    { id: "teacher", icon: "users", label: "With Teacher" },
  ];
  useEffect(() => { if (window.lucide) window.lucide.createIcons(); });
  return (
    <aside className="sb">
      <div className="sb-logo">
        <div className="tile">汉</div>
        <div className="wm">HanziBit</div>
      </div>
      <div className="eyebrow">Notebook Sections</div>
      {items.map(it => (
        <button key={it.id} className={`sb-item ${active === it.id ? "active" : ""}`} onClick={() => onNav(it.id)}>
          <i data-lucide={it.icon}></i>
          <span>{it.label}</span>
          {it.count && <span className="ct">{it.count}</span>}
        </button>
      ))}
      <div className="sb-cod">
        <div className="eyebrow" style={{ marginBottom: 8 }}>Character of the day</div>
        <div className="hz">
          <div className="sq">学</div>
          <div>
            <div className="mn">xué · to learn</div>
            <div className="py">Radical: 子 (child)</div>
            <div className="en">14-day streak</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
window.Sidebar = Sidebar;
