function Dashboard() {
  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Monday · Feb 3 · Week 6 of HSK 2</p>

      <Card className="pad-lg">
        <Eyebrow icon="target" meta="2 of 3 steps completed">Today's Practice Loop</Eyebrow>
        <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
          <span className="focus-word"><span className="h">服务员</span><span className="p">fúwùyuán</span><span className="e">waiter</span></span>
          <span style={{ fontSize:12, color:"#737373" }}>is today's focus word — used across all three steps.</span>
        </div>
        <div className="pg">
          <div className="pc done">
            <div className="pc-status"><Pill variant="done" icon="check">Done</Pill></div>
            <div className="pc-label">Step 1 · Read</div>
            <div className="pc-value">At the restaurant</div>
            <div className="pc-sub">3-min passage · 8 new words</div>
            <a className="pc-link">Review passage →</a>
          </div>
          <div className="pc done">
            <div className="pc-status"><Pill variant="done" icon="check">Done</Pill></div>
            <div className="pc-label">Step 2 · Review</div>
            <div className="pc-value">12 cards</div>
            <div className="pc-sub">All due cards cleared — +4 mature</div>
            <a className="pc-link">See flashcard log →</a>
          </div>
          <div className="pc emphasized">
            <div className="pc-status"><Pill variant="focus" icon="pen-line">Next up</Pill></div>
            <div className="pc-label">Step 3 · Write</div>
            <div className="pc-value">Use 服务员 in a sentence</div>
            <div className="pc-sub">Open a new journal entry and use today's focus word.</div>
            <button className="btn btn-primary" style={{ marginTop:12, height:28, fontSize:13 }}>Start writing</button>
          </div>
        </div>
        <div className="loop">
          <span style={{ fontSize:11, fontWeight:600, color:"#a3a3a3", letterSpacing:".05em", textTransform:"uppercase", marginRight:8 }}>Last 14 days</span>
          {Array.from({ length: 14 }).map((_, i) => {
            const cls = i < 10 ? "completed" : i === 13 ? "today" : "";
            return <div key={i} className={`d ${cls}`}><span className="bar"></span></div>;
          })}
          <span style={{ fontSize:11, fontWeight:600, color:"#a3a3a3", letterSpacing:".05em", textTransform:"uppercase", marginLeft:8 }}>🔥 14-day streak</span>
        </div>
      </Card>

      <div className="stat-grid">
        <div className="stat">
          <div className="eye" style={{ color:"#c44d14" }}><i data-lucide="flame"></i>STREAK</div>
          <div className="val">14</div>
          <div className="sub">days in a row</div>
        </div>
        <div className="stat">
          <div className="eye" style={{ color:"#2563a8" }}><i data-lucide="pen-line"></i>ENTRIES</div>
          <div className="val">23</div>
          <div className="sub">journal entries written</div>
        </div>
        <div className="stat">
          <div className="eye" style={{ color:"#137a4d" }}><i data-lucide="layers"></i>CARDS DUE</div>
          <div className="val">12</div>
          <div className="sub">reviews ready now</div>
        </div>
      </div>

      <Card>
        <Eyebrow icon="trending-up" meta="64 / 150 words · 43%">HSK 1 Progress</Eyebrow>
        <div className="progress"><div className="fill" style={{ width:"43%" }}></div></div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, fontSize:12, color:"#737373" }}>
          <span>Encountered in journal entries and readings</span>
          <a className="btn-link" style={{ color:"var(--cn-orange)" }}>Open study guide →</a>
        </div>
      </Card>

      <Card>
        <Eyebrow icon="alert-circle" meta="3 cards">Needs attention</Eyebrow>
        <div className="na-row">
          <div><span className="h">难</span><span className="e">nán · difficult</span></div>
          <div className="na-meta">Failed 3× · ease <span className="ease">1.8</span></div>
          <Pill variant="urgent" icon="alert-circle">Struggling</Pill>
        </div>
        <div className="na-row">
          <div><span className="h">应该</span><span className="e">yīnggāi · should</span></div>
          <div className="na-meta">Overdue 2 days</div>
          <Pill variant="caution" icon="clock">Overdue</Pill>
        </div>
        <div className="na-row">
          <div><span className="h">以前</span><span className="e">yǐqián · before (time)</span></div>
          <div className="na-meta">New · never practiced</div>
          <Pill variant="watch" icon="sparkles">New</Pill>
        </div>
      </Card>
    </div>
  );
}
window.Dashboard = Dashboard;
