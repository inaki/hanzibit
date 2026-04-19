function PracticeCard({ flipped, setFlipped }) {
  return (
    <>
      <div className="fc-card">
        <div className="fc-card-eyebrow">
          <span className="face">{flipped ? "Back" : "Front"} · Card 3 of 12</span>
          <div className="tags">
            <span className="pill pending"><i data-lucide="layers"></i> HSK 2</span>
            <span className="pill sky"><i data-lucide="sparkles"></i> Learning</span>
          </div>
        </div>
        <div className="fc-card-face">
          <div className="fc-hz">{flipped ? "下雨" : "下雨"}</div>
          {flipped && <div className="fc-py">xià yǔ</div>}
          {flipped && <div className="fc-en">to rain · (lit.) fall + rain</div>}
          <button className="fc-audio-big"><i data-lucide="volume-2"></i></button>
          {!flipped && <span className="fc-hint-chip"><i data-lucide="lightbulb"></i> verb · weather</span>}
          {flipped && (
            <div className="fc-examples">
              <div className="fc-ex">
                <div className="zh">今天<span className="hl">下雨</span>了。</div>
                <div className="py">jīntiān xià yǔ le</div>
                <div className="en">It's raining today.</div>
              </div>
              <div className="fc-ex">
                <div className="zh">明天会<span className="hl">下雨</span>吗？</div>
                <div className="py">míngtiān huì xià yǔ ma</div>
                <div className="en">Will it rain tomorrow?</div>
              </div>
            </div>
          )}
        </div>
        {!flipped && (
          <div className="fc-reveal-cta">
            <button className="fc-flip-btn" onClick={() => setFlipped(true)}>
              <i data-lucide="rotate-cw"></i> Reveal answer
            </button>
            <div className="fc-kbd-hint">Press <span className="kbd">Space</span> to flip</div>
          </div>
        )}
      </div>
      {flipped && (
        <div className="fc-ratings">
          <button className="fc-rate again"><span className="label">Again</span><span className="next">&lt; 10 min</span><span className="key">1</span></button>
          <button className="fc-rate hard"><span className="label">Hard</span><span className="next">~1 day</span><span className="key">2</span></button>
          <button className="fc-rate good"><span className="label">Good</span><span className="next">~3 days</span><span className="key">3</span></button>
          <button className="fc-rate easy"><span className="label">Easy</span><span className="next">~7 days</span><span className="key">4</span></button>
        </div>
      )}
    </>
  );
}

function ListenCard() {
  return (
    <div className="fc-listen-card">
      <div className="fc-listen-head">
        <span className="instr">Listen &amp; Type</span>
        <button className="fc-audio-orb"><i data-lucide="volume-2"></i></button>
        <div className="fc-replay-row">
          <button className="fc-replay-btn"><i data-lucide="rotate-ccw"></i> Replay</button>
          <button className="fc-replay-btn"><i data-lucide="turtle"></i> Slow</button>
        </div>
      </div>
      <div className="fc-dict-group">
        <div className="fc-dict-label">Pinyin (with tone numbers)</div>
        <input className="fc-dict-input" placeholder="xia4 yu3" defaultValue=""/>
        <div className="fc-dict-helper">Type tones as numbers 1–4, e.g. <code>ni3 hao3</code></div>
      </div>
      <div className="fc-dict-group">
        <div className="fc-dict-label">Characters</div>
        <input className="fc-dict-input hz" placeholder="在这里输入…" defaultValue=""/>
      </div>
      <div className="fc-listen-actions">
        <button className="btn btn-outline"><i data-lucide="eye"></i> Reveal</button>
        <button className="btn btn-primary"><i data-lucide="check"></i> Check answer</button>
      </div>
    </div>
  );
}

function BrowseGrid() {
  const cards = [
    { hz: "下雨", py: "xià yǔ", en: "to rain", hsk: 2, status: "learning", reviews: 0, retention: 45, last: "Just added" },
    { hz: "累", py: "lèi", en: "tired, weary", hsk: 2, status: "due", reviews: 1, retention: 62, last: "Due today" },
    { hz: "餐厅", py: "cāntīng", en: "restaurant, dining hall", hsk: 2, status: "due", reviews: 2, retention: 55, last: "Overdue 1d" },
    { hz: "服务员", py: "fúwùyuán", en: "waiter, server", hsk: 2, status: "leech", reviews: 8, retention: 28, last: "Failed 3×" },
    { hz: "好吃", py: "hǎochī", en: "delicious, tasty", hsk: 2, status: "mature", reviews: 12, retention: 92, last: "2 days ago" },
    { hz: "谢谢", py: "xièxie", en: "thank you", hsk: 1, status: "mature", reviews: 18, retention: 98, last: "5 days ago" },
    { hz: "天气", py: "tiānqì", en: "weather", hsk: 1, status: "learning", reviews: 2, retention: 50, last: "Yesterday" },
    { hz: "学习", py: "xuéxí", en: "to study, to learn", hsk: 1, status: "mature", reviews: 14, retention: 88, last: "3 days ago" },
    { hz: "便宜", py: "piányi", en: "cheap, inexpensive", hsk: 2, status: "learning", reviews: 3, retention: 67, last: "Yesterday" },
    { hz: "你好", py: "nǐ hǎo", en: "hello", hsk: 1, status: "mature", reviews: 22, retention: 100, last: "1 week ago" },
    { hz: "喝", py: "hē", en: "to drink", hsk: 1, status: "new", reviews: 0, retention: 0, last: "Never" },
    { hz: "朋友", py: "péngyou", en: "friend", hsk: 1, status: "mature", reviews: 16, retention: 94, last: "4 days ago" },
  ];
  const filters = [
    { id: "all", label: "All", count: 12 },
    { id: "due", label: "Due", count: 3 },
    { id: "learning", label: "Learning", count: 3 },
    { id: "mature", label: "Mature", count: 5 },
    { id: "leech", label: "Leech", count: 1 },
    { id: "new", label: "New", count: 1 },
  ];
  const [filter, setFilter] = React.useState("all");
  const visible = filter === "all" ? cards : cards.filter(c => c.status === filter);
  return (
    <>
      <div className="fc-browse-header">
        <div className="fc-browse-filters">
          {filters.map(f => (
            <button key={f.id} className={`fc-fchip ${filter === f.id ? "on" : ""}`} onClick={() => setFilter(f.id)}>
              {f.label}<span className="ct">{f.count}</span>
            </button>
          ))}
        </div>
        <button className="fc-browse-sort"><i data-lucide="arrow-up-down"></i> Recently added</button>
      </div>
      <div className="fc-grid">
        {visible.map((c, i) => (
          <div key={i} className="fc-grid-card" data-status={c.status}>
            <span className={`fc-status-pill ${c.status}`}>{c.status}</span>
            <div className="top">
              <div>
                <div className="hz">{c.hz}</div>
                <div className="py">{c.py}</div>
              </div>
              <button className="audio-mini"><i data-lucide="volume-2"></i></button>
            </div>
            <div className="en">{c.en}</div>
            <div className="meta">
              <div className="left">
                <span className="hsk">HSK {c.hsk}</span>
                <span className="fc-last-review">{c.last}</span>
              </div>
              {c.reviews > 0 && (
                <span className="retention">
                  <span className="bar" style={{ "--w": `${c.retention}%` }}></span>
                  {c.retention}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

window.PracticeCard = PracticeCard;
window.ListenCard = ListenCard;
window.BrowseGrid = BrowseGrid;
