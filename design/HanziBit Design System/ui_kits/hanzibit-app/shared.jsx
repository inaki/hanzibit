function Eyebrow({ icon, children, meta }) {
  return (
    <div className="er">
      {icon && <i data-lucide={icon}></i>}
      <span>{children}</span>
      {meta && <><span className="spacer"></span><span className="meta">{meta}</span></>}
    </div>
  );
}

function Pill({ variant = "pending", icon, children }) {
  return (
    <span className={`pill ${variant}`}>
      {icon && <i data-lucide={icon}></i>}
      {children}
    </span>
  );
}

function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}

window.Eyebrow = Eyebrow;
window.Pill = Pill;
window.Card = Card;
