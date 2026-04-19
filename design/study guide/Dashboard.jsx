// Shared bits
function Eyebrow({ icon, children, meta }) {
  return (
    <div className="eyebrow-row">
      {icon && <i data-lucide={icon}></i>}
      <span>{children}</span>
      {meta && <span className="meta">{meta}</span>}
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

// ========== HERO — Today's focus + loop ==========
function Hero({ layout }) {
  const steps = [
    {
      id: "review",
      verb: "Review",
      done: false,
      current: true,
      title: "12 due flashcards",
      desc: "Clear due cards first — this keeps 九 and older words active.",
      action: "Start review",
      icon: "layers",
    },
    {
      id: "study",
      verb: "Study",
      done: false,
      current: false,
      title: "How 九 (jiǔ) appears in context",
      desc: "Two sentences and a grammar note on numbers.",
      action: "Open study",
      icon: "book-open",
    },
    {
      id: "write",
      verb: "Write",
      done: false,
      current: false,
      title: "Short entry using 九",
      desc: "3–5 sentences about your day. Include at least one HSK 1 pattern.",
      action: "Start draft",
      icon: "pen-line",
    },
  ];

  return (
    <section className="hero">
      <div className="hero-bg-hanzi">九</div>
      <div className="hero-inner">
        <div className="hero-focus">
          <Eyebrow icon="target">Today's Focus Word</Eyebrow>
          <div className="hero-focus-hanzi">九</div>
          <div className="hero-focus-meta">
            <span className="py">jiǔ</span>
            <span className="en">nine</span>
            <span className="tone">Tone 3 · HSK 1</span>
          </div>
          <p className="hero-focus-hint">
            Cycle <strong>九</strong> through all three steps today — review it, see it in context, then use it in your own writing.
          </p>
          {layout !== "minimal" && (
            <div className="hero-cta-row">
              <button className="btn btn-primary lg">
                <i data-lucide="play"></i>
                Start today's practice
              </button>
              <button className="btn btn-ghost">
                <i data-lucide="skip-forward"></i>
                Change focus word
              </button>
            </div>
          )}
        </div>

        <div className="loop-wrap">
          <div className="loop-header">
            <div className="loop-title">Daily Practice Loop</div>
            <div className="loop-progress-text"><b>0 of 3</b> steps · ~22 min</div>
          </div>
          <div className="loop-steps">
            {steps.map((s, i) => (
              <div key={s.id} className={`lstep ${s.done ? "done" : ""} ${s.current ? "current" : ""}`}>
                <div className="lstep-num">
                  {s.done ? <i data-lucide="check"></i> : i + 1}
                </div>
                <div className="lstep-body">
                  <div className="lstep-title">
                    <span className="lstep-verb">{s.verb}</span>
                    <span>{s.title}</span>
                  </div>
                  <div className="lstep-desc">{s.desc}</div>
                </div>
                <a className="lstep-action">
                  {s.action}
                  <i data-lucide="arrow-right" style={{ width: 12, height: 12 }}></i>
                </a>
              </div>
            ))}
          </div>
          {layout === "minimal" && (
            <div className="hero-cta-row">
              <button className="btn btn-primary lg">
                <i data-lucide="play"></i>
                Start today's practice
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ========== Stat cards ==========
function StatCards() {
  return (
    <div className="grid-3">
      <div className="stat orange">
        <div className="stat-eye">
          <i data-lucide="flame"></i>
          <span>Streak</span>
        </div>
        <div className="stat-val">0 <span className="unit">days</span></div>
        <div className="stat-sub">Finish today's loop to start your streak.</div>
        <div className="stat-spark">
          {[0,0,0,0,0,0,0].map((v, i) => (
            <div key={i} className={`bar`} style={{ height: "25%" }}></div>
          ))}
        </div>
      </div>
      <div className="stat sky">
        <div className="stat-eye">
          <i data-lucide="pen-line"></i>
          <span>Entries this month</span>
        </div>
        <div className="stat-val">5 <span className="unit">/ 30</span></div>
        <div className="stat-sub">Avg. 47 characters per entry.</div>
        <div className="stat-spark">
          {[30,0,45,20,60,0,0].map((v, i) => (
            <div key={i} className={`bar ${v > 0 ? "filled" : ""}`} style={{ height: `${Math.max(v, 15)}%` }}></div>
          ))}
        </div>
      </div>
      <div className="stat emerald">
        <div className="stat-eye">
          <i data-lucide="rotate-ccw"></i>
          <span>Reviews completed</span>
        </div>
        <div className="stat-val">15 <span className="unit">total</span></div>
        <div className="stat-sub">78% retention · 6 cards mature.</div>
        <div className="stat-spark">
          {[40,20,60,30,50,20,0].map((v, i) => (
            <div key={i} className={`bar ${v > 0 ? "filled" : ""}`} style={{ height: `${Math.max(v, 15)}%` }}></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== HSK Progress card ==========
function HskCard() {
  // 148 words in HSK 1; 18 encountered
  const total = 148;
  const encountered = 18;
  const pct = Math.round((encountered / total) * 100);
  const segments = 30;
  const filled = Math.round((encountered / total) * segments);
  return (
    <div className="card progress-card pad-lg">
      <div className="head">
        <div>
          <Eyebrow icon="trending-up">HSK 1 Progress</Eyebrow>
          <div className="title" style={{ marginTop: 10 }}>You've met <b>{encountered}</b> of {total} HSK 1 words.</div>
        </div>
        <div className="pct">{pct}%</div>
      </div>
      <div className="progress-segmented">
        {Array.from({ length: segments }).map((_, i) => (
          <div key={i} className={`seg ${i < filled ? "filled" : ""}`}></div>
        ))}
      </div>
      <div className="progress-row-meta">
        <span><b>{encountered}</b> encountered · <b>6</b> in flashcards · <b>5</b> retained</span>
        <a className="btn-link">Open study guide <i data-lucide="arrow-right"></i></a>
      </div>
      <div className="divider"></div>
      <div className="readiness-rows">
        <div className="rrow orange">
          <div className="rrow-label">Words encountered</div>
          <div className="rrow-bar"><div className="rrow-fill" style={{ width: `${(18/148)*100}%`}}></div></div>
          <div className="rrow-val">18 / 148</div>
        </div>
        <div className="rrow sky">
          <div className="rrow-label">Flashcard coverage</div>
          <div className="rrow-bar"><div className="rrow-fill" style={{ width: `${(6/148)*100}%`}}></div></div>
          <div className="rrow-val">6 / 148</div>
        </div>
        <div className="rrow emerald">
          <div className="rrow-label">Retained (2× reviewed)</div>
          <div className="rrow-bar"><div className="rrow-fill" style={{ width: `${(5/148)*100}%`}}></div></div>
          <div className="rrow-val">5 / 148</div>
        </div>
      </div>
    </div>
  );
}

// ========== Week strip ==========
function WeekStrip() {
  const days = [
    { dow: "Mon", num: 13, state: "partial", today: false }, // review + study done
    { dow: "Tue", num: 14, state: "full", today: false },
    { dow: "Wed", num: 15, state: "missed", today: false },
    { dow: "Thu", num: 16, state: "full", today: false },
    { dow: "Fri", num: 17, state: "partial", today: false },
    { dow: "Sat", num: 18, state: "none", today: true }, // today
    { dow: "Sun", num: 19, state: "future", today: false },
  ];
  return (
    <div className="card pad-lg">
      <div className="row-split">
        <Eyebrow icon="calendar">This week</Eyebrow>
        <a className="btn-link">See full calendar <i data-lucide="arrow-right"></i></a>
      </div>
      <div className="week-strip">
        {days.map((d, i) => {
          const klass = d.today ? "today" : d.state === "future" ? "future" : "";
          const dots = [];
          if (d.state === "full") dots.push("f","f","f");
          else if (d.state === "partial") dots.push("f","f","m");
          else if (d.state === "missed") dots.push("m","m","m");
          else if (d.state === "none") dots.push("m","m","m");
          else if (d.state === "future") dots.push("m","m","m");
          return (
            <div key={i} className={`day-cell ${klass}`}>
              <div className="dow">{d.dow}</div>
              <div className="num">{d.num}</div>
              <div className="dots">
                {dots.map((t, j) => <div key={j} className={`dot ${t}`}></div>)}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 14, fontSize: 11, color: "oklch(0.6 0 0)" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--t-emerald-t)" }}></span>
          Review · Study · Write
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--muted)", border: "1px solid var(--border)" }}></span>
          Not done
        </span>
      </div>
    </div>
  );
}

// ========== Needs attention list ==========
function NeedsAttention() {
  const rows = [
    { hz: "九", py: "jiǔ", en: "nine", sub: "Today's focus · not yet studied", pill: { v: "priority", i: "target", t: "Focus" } },
    { hz: "服务员", py: "fúwùyuán", en: "waiter, server", sub: "Due in flashcards · 2 days overdue", pill: { v: "amber", i: "clock", t: "Overdue" } },
    { hz: "以前", py: "yǐqián", en: "before (time)", sub: "New · never practiced", pill: { v: "sky", i: "sparkles", t: "New" } },
    { hz: "应该", py: "yīnggāi", en: "should, ought to", sub: "Failed 3× · ease 1.8", pill: { v: "rose", i: "alert-circle", t: "Struggling" } },
  ];
  return (
    <div className="card pad-lg">
      <div className="row-split">
        <Eyebrow icon="alert-circle">Needs attention</Eyebrow>
        <a className="btn-link">All vocabulary <i data-lucide="arrow-right"></i></a>
      </div>
      <div className="card-list">
        {rows.map((r, i) => (
          <div key={i} className="row">
            <div className="hz-mini">{r.hz}</div>
            <div className="meta">
              <div className="p">{r.py}</div>
              <div className="e">{r.en}</div>
              <div className="sub">{r.sub}</div>
            </div>
            <Pill variant={r.pill.v} icon={r.pill.i}>{r.pill.t}</Pill>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== Quick action tiles ==========
function QuickActions() {
  return (
    <div className="grid-3">
      <button className="action-tile">
        <div className="tile-icon"><i data-lucide="layers"></i></div>
        <div className="tile-title">Review flashcards <span className="count">12</span></div>
        <div className="tile-sub">Clear due cards. Est. 6 min.</div>
      </button>
      <button className="action-tile sky">
        <div className="tile-icon"><i data-lucide="pen-line"></i></div>
        <div className="tile-title">Write a journal entry</div>
        <div className="tile-sub">Use 九 in a short entry about your day.</div>
      </button>
      <button className="action-tile emerald">
        <div className="tile-icon"><i data-lucide="book-open"></i></div>
        <div className="tile-title">Continue study guide</div>
        <div className="tile-sub">HSK 1 · Numbers → currently on 九.</div>
      </button>
    </div>
  );
}

// ========== Main dashboard compositions per layout ==========
function Dashboard({ layout }) {
  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Saturday, April 18</h1>
          <p className="sub">Day 1 of your HSK 1 journey · Keep it simple — just finish today's loop.</p>
        </div>
        <div className="topbar-right">
          <div className="search">
            <i data-lucide="search"></i>
            <span>Search characters…</span>
            <span className="kbd">⌘K</span>
          </div>
          <button className="btn btn-outline" style={{ width: 36, padding: 0, justifyContent: "center" }}>
            <i data-lucide="settings"></i>
          </button>
          <div className="avatar">HB</div>
        </div>
      </div>

      <Hero layout={layout} />

      {layout === "focused" && (
        <>
          <div className="grid-sidebar-2">
            <div>
              <HskCard />
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              <WeekStrip />
              <NeedsAttention />
            </div>
          </div>
          <StatCards />
        </>
      )}

      {layout === "compact" && (
        <>
          <StatCards />
          <div className="grid-sidebar-2">
            <HskCard />
            <NeedsAttention />
          </div>
          <WeekStrip />
        </>
      )}

      {layout === "minimal" && (
        <>
          <QuickActions />
          <div className="grid-2">
            <HskCard />
            <div style={{ display: "grid", gap: 16 }}>
              <StatCards />
              <NeedsAttention />
            </div>
          </div>
        </>
      )}
    </>
  );
}

window.Dashboard = Dashboard;
