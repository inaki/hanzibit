// ============ Word list (left rail) ============
function WordList({ activeId, onPick, mode }) {
  const words = [
    { id: "ai", hz: "爱", py: "ài", en: "to love; to be fond of; affection", status: "new" },
    { id: "ba", hz: "八", py: "bā", en: "eight", status: "known" },
    { id: "baba", hz: "爸爸", py: "bàba", en: "(coll.) father; dad", status: "known" },
    { id: "beizi", hz: "杯子", py: "bēizi", en: "cup; glass", status: "learning", tag: "due" },
    { id: "beijing", hz: "北京", py: "Běijīng", en: "Beijing, capital of the P…", status: "new" },
    { id: "ben", hz: "本", py: "běn", en: "(bound form) root; stem", status: "new" },
    { id: "bu", hz: "不", py: "bù", en: "no; not so; (bound form) not", status: "learning" },
    { id: "bukeqi", hz: "不客气", py: "bù kèqi", en: "you're welcome; don't mention it", status: "new" },
    { id: "cai", hz: "菜", py: "cài", en: "dish, cuisine; vegetable", status: "known" },
    { id: "cha", hz: "茶", py: "chá", en: "tea", status: "learning", tag: "stuck" },
    { id: "chi", hz: "吃", py: "chī", en: "to eat", status: "known" },
    { id: "chuzushe", hz: "出租车", py: "chūzūchē", en: "taxi", status: "new" },
    { id: "dianhua", hz: "电话", py: "diànhuà", en: "telephone", status: "new" },
    { id: "diannao", hz: "电脑", py: "diànnǎo", en: "computer", status: "learning" },
  ];
  const filters = [
    { id: "all", label: "All", count: 148 },
    { id: "new", label: "New", count: 130 },
    { id: "learning", label: "Learning", count: 4 },
    { id: "known", label: "Known", count: 14 },
  ];
  const [filter, setFilter] = React.useState("all");
  const filtered = filter === "all" ? words : words.filter(w => w.status === filter);

  return (
    <div className="sg-rail">
      <div className="sg-rail-filters">
        <div className="sg-search">
          <i data-lucide="search"></i>
          <input placeholder="Search words…" defaultValue=""/>
        </div>
        <div className="sg-chips">
          {filters.map(f => (
            <button key={f.id} className={`sg-chip ${filter === f.id ? "on" : ""}`} onClick={() => setFilter(f.id)}>
              {f.label}
              <span className="ct">{f.count}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="sg-list">
        {filtered.map(w => (
          <div key={w.id} className={`sg-wi ${activeId === w.id ? "active" : ""}`} onClick={() => onPick(w.id)}>
            <div className={`sg-wi-check ${w.status}`}>
              {w.status === "known" && <i data-lucide="check"></i>}
            </div>
            <div className="sg-wi-body">
              <div className="sg-wi-hz">{w.hz} <span className="sg-wi-py">{w.py}</span></div>
              <div className="sg-wi-en">{w.en}</div>
            </div>
            <div className="sg-wi-trail">
              {w.tag === "due" && <span className="mini-pill due">Due</span>}
              {w.tag === "stuck" && <span className="mini-pill stuck">Stuck</span>}
              {w.status === "new" && !w.tag && <span className="mini-pill new">New</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ Grammar list (left rail alt) ============
function GrammarList({ activeId, onPick }) {
  const items = [
    { id: "shi", title: "Subject + 是 + Noun", pattern: "A 是 B" },
    { id: "bu", title: "Negation with 不", pattern: "Subj + 不 + V/Adj" },
    { id: "ye", title: "The 也 particle", pattern: "Subj + 也 + V/Adj" },
    { id: "ge", title: "Measure words with 个", pattern: "Num + 个 + Noun" },
    { id: "de", title: "的 possessive", pattern: "N/Pron + 的 + N" },
    { id: "ma", title: "Yes/no questions with 吗", pattern: "Stmt + 吗?" },
    { id: "ne", title: "Follow-up with 呢", pattern: "X + 呢?" },
    { id: "you", title: "Existence with 有", pattern: "Subj + 有 + Obj" },
    { id: "zai", title: "Location with 在", pattern: "Subj + 在 + Place" },
    { id: "le", title: "Completed action 了", pattern: "V + 了" },
  ];
  return (
    <div className="sg-rail gr-rail">
      <div className="sg-rail-filters">
        <div className="sg-search">
          <i data-lucide="search"></i>
          <input placeholder="Search patterns…" defaultValue=""/>
        </div>
      </div>
      <div className="sg-list">
        {items.map(g => (
          <div key={g.id} className={`gr-item ${activeId === g.id ? "active" : ""}`} onClick={() => onPick(g.id)}>
            <div className="title">{g.title}</div>
            <div className="pattern">{g.pattern}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ Word Detail ============
function WordDetail() {
  const [openStep, setOpenStep] = React.useState(0);
  const steps = [
    {
      verb: "Notice",
      title: "Spot 爱 in a phrase",
      time: "~30s",
      done: true,
      body: (
        <>
          <div className="wd-ls-prompt">
            Tap a phrase where 爱 appears. Notice the structure.
            <div className="wd-ls-chiprow" style={{ marginTop: 10 }}>
              <button className="wd-ls-chip"><span className="hz">老师说</span>"<span className="hz">爱</span>"很重要</button>
              <button className="wd-ls-chip"><span className="hz">用爱写</span>一个短句</button>
            </div>
          </div>
        </>
      ),
    },
    {
      verb: "Echo",
      title: "Listen and repeat",
      time: "~1 min",
      current: true,
      done: false,
      body: (
        <>
          <div className="wd-ls-prompt">
            <span>The teacher asked: </span>
            <span className="quote">
              老师问："你今天怎么用<span className="hl">爱</span>？"<br/>
              我说："我想先用<span className="hl">爱</span>写一句话。"
              <span className="quote-trans">The teacher asked, "How will you use 爱 today?" I said, "I want to use 爱 in one sentence first."</span>
            </span>
          </div>
          <div className="wd-ls-actions">
            <button className="btn btn-outline"><i data-lucide="play"></i> Play audio</button>
            <button className="btn btn-primary"><i data-lucide="mic"></i> Record myself</button>
          </div>
        </>
      ),
    },
    {
      verb: "Check",
      title: "Quick comprehension",
      time: "~30s",
      done: false,
      body: (
        <>
          <div className="wd-ls-prompt">Where did the learner say they would use 爱 after class?</div>
          <div className="wd-ls-chiprow">
            <button className="wd-ls-chip">At home, in a short sentence</button>
            <button className="wd-ls-chip">In the taxi</button>
            <button className="wd-ls-chip">Tomorrow morning</button>
          </div>
        </>
      ),
    },
    {
      verb: "Write",
      title: "Use 爱 in your own sentence",
      time: "~3 min",
      done: false,
      body: (
        <>
          <div className="wd-ls-prompt">Write 2–4 sentences about something you love, using 爱 at least once.</div>
          <textarea className="wd-ls-resp-area" placeholder="今天我..." defaultValue=""></textarea>
          <div className="wd-ls-actions">
            <button className="btn btn-primary"><i data-lucide="check"></i> Submit to journal</button>
            <button className="btn btn-ghost">Save draft</button>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="sg-detail">
      <div className="wd-hero">
        <div className="wd-char-stack">
          <div className="wd-char">爱</div>
          <div className="wd-char-actions">
            <button className="wd-icon-btn primary" title="Play audio"><i data-lucide="volume-2"></i></button>
            <button className="wd-icon-btn" title="Stroke order"><i data-lucide="pen-tool"></i></button>
            <button className="wd-icon-btn" title="Bookmark"><i data-lucide="bookmark"></i></button>
          </div>
        </div>
        <div className="wd-meta">
          <div className="wd-py">ài <span className="tone">Tone 4</span></div>
          <div className="wd-en">
            to love; to be fond of; to like
            <div className="alt">affection; to be inclined (to do sth); to tend to (happen)</div>
          </div>
          <div className="wd-status-row">
            <span className="pill focus"><i data-lucide="target"></i> Today's focus</span>
            <span className="pill sky"><i data-lucide="sparkles"></i> Not yet encountered</span>
            <span className="pill pending"><i data-lucide="layers"></i> No flashcard yet</span>
            <span className="pill pending"><i data-lucide="book-marked"></i> HSK 1 · emotion</span>
          </div>
        </div>
      </div>

      {/* Character Breakdown */}
      <div className="wd-sec">
        <div className="wd-sec-title">
          <i data-lucide="puzzle"></i>
          <span className="eye">Character Breakdown</span>
          <span className="grow"></span>
          <span className="aux">Hover a radical for details</span>
        </div>
        <div className="wd-breakdown">
          <div className="wd-decomp">
            <div className="wd-decomp-target">爱</div>
            <span className="wd-decomp-eq">=</span>
            <div className="wd-rad"><div className="hz">爪</div><div className="mn">claw / hand</div></div>
            <span className="wd-decomp-plus">+</span>
            <div className="wd-rad"><div className="hz">冖</div><div className="mn">cover</div></div>
            <span className="wd-decomp-plus">+</span>
            <div className="wd-rad"><div className="hz">心</div><div className="mn">heart</div></div>
            <span className="wd-decomp-plus">+</span>
            <div className="wd-rad"><div className="hz">友</div><div className="mn">friend</div></div>
          </div>
          <div className="wd-etymology">
            <i data-lucide="sparkle"></i>
            <div>Hands covering a heart for a friend — <em>love</em>. The simplified form lost 心 (heart) from the center, but the story is how native speakers still think of it.</div>
          </div>
        </div>
      </div>

      {/* Examples in context */}
      <div className="wd-sec">
        <div className="wd-sec-title">
          <i data-lucide="quote"></i>
          <span className="eye">Seen in context</span>
          <span className="grow"></span>
          <a className="btn-link">All 6 examples <i data-lucide="arrow-right"></i></a>
        </div>
        <div className="wd-examples">
          <div className="wd-ex">
            <div>
              <div className="zh">我<span className="hl">爱</span>你。</div>
              <div className="py">wǒ ài nǐ</div>
              <div className="en">I love you.</div>
            </div>
            <div className="wd-ex-src hsk"><i data-lucide="book-marked"></i> HSK 1 core</div>
          </div>
          <div className="wd-ex">
            <div>
              <div className="zh">他很<span className="hl">爱</span>喝茶。</div>
              <div className="py">tā hěn ài hē chá</div>
              <div className="en">He really loves drinking tea.</div>
            </div>
            <div className="wd-ex-src hsk"><i data-lucide="book-marked"></i> HSK 2 extension</div>
          </div>
          <div className="wd-ex">
            <div>
              <div className="zh">老师说"<span className="hl">爱</span>"很重要。</div>
              <div className="py">lǎoshī shuō "ài" hěn zhòngyào</div>
              <div className="en">The teacher said "love" is very important.</div>
            </div>
            <div className="wd-ex-src teacher"><i data-lucide="user"></i> From teacher</div>
          </div>
        </div>
      </div>

      {/* Practice ladder */}
      <div className="wd-sec">
        <div className="wd-sec-title">
          <i data-lucide="list-checks"></i>
          <span className="eye">Practice Ladder</span>
          <span className="grow"></span>
          <span className="aux">1 of 4 done · ~5 min total</span>
        </div>
        <div className="wd-ladder">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`wd-ladder-step ${s.done ? "done" : ""} ${s.current ? "current" : ""} ${openStep === i ? "open" : ""}`}
            >
              <div className="wd-ls-head" onClick={() => setOpenStep(openStep === i ? -1 : i)}>
                <div className="wd-ls-num">{s.done ? <i data-lucide="check"></i> : i + 1}</div>
                <div className="wd-ls-title">
                  <span className="verb">{s.verb}</span>
                  <span className="t">{s.title}</span>
                </div>
                <div className="wd-ls-time">{s.time}</div>
                <div className="wd-ls-chev"><i data-lucide="chevron-down"></i></div>
              </div>
              <div className="wd-ls-body">{s.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="wd-foot">
        <button className="btn btn-outline"><i data-lucide="plus"></i> Create flashcard for 爱</button>
        <div className="wd-foot-right">
          <div className="wd-nextprev">
            <button className="wd-icon-btn" title="Previous"><i data-lucide="chevron-left"></i></button>
            <button className="wd-icon-btn" title="Next word"><i data-lucide="chevron-right"></i></button>
          </div>
          <button className="btn btn-primary">Next word: 八 <i data-lucide="arrow-right"></i></button>
        </div>
      </div>
    </div>
  );
}

// ============ Grammar Detail ============
function GrammarDetail() {
  return (
    <div className="sg-detail">
      <div className="gr-detail-head">
        <div className="wd-sec-title" style={{ marginBottom: 10 }}>
          <i data-lucide="languages"></i>
          <span className="eye" style={{ color: "var(--t-violet-t)" }}>Grammar Pattern · HSK 1</span>
        </div>
        <h2>Negation with 不</h2>
        <div className="gr-pattern-big">
          <span className="token">Subject</span>
          <span>+</span>
          <span className="token tok-hz">不</span>
          <span>+</span>
          <span className="token">Verb / Adj</span>
        </div>
        <p className="gr-desc">
          不 (bù) is placed before a verb or adjective to negate it. The tone changes to <strong>bú</strong> (2nd tone) when it comes before a 4th-tone syllable. This is the most common negation in Mandarin — use it whenever you'd say "not" in English.
        </p>
      </div>

      <div className="gr-ex-block">
        <h3>Examples</h3>
        <div className="gr-ex good">
          <div className="zh">我<span className="pat">不</span>喝茶。</div>
          <div className="py">wǒ bù hē chá</div>
          <div className="en">I don't drink tea.</div>
        </div>
        <div className="gr-ex good">
          <div className="zh">她<span className="pat">不</span>是老师。</div>
          <div className="py">tā bú shì lǎoshī</div>
          <div className="en">She is not a teacher. <em style={{ color: "var(--cn-orange-dark)" }}>(tone sandhi: bù → bú before 是 shì)</em></div>
        </div>
        <div className="gr-ex good">
          <div className="zh">今天<span className="pat">不</span>冷。</div>
          <div className="py">jīntiān bù lěng</div>
          <div className="en">Today is not cold.</div>
        </div>
      </div>

      <div className="gr-ex-block">
        <h3>Common mistake</h3>
        <div className="gr-ex bad">
          <div className="zh"><span className="err">我不有钱。</span></div>
          <div className="py">wǒ bù yǒu qián</div>
          <div className="en">Intended: "I don't have money."</div>
          <div className="gr-ex-note"><i data-lucide="alert-circle"></i> 有 (to have) is negated with 没, not 不. Use: 我没有钱 — wǒ méiyǒu qián.</div>
        </div>
      </div>

      <div className="gr-common-mistakes">
        <h3><i data-lucide="alert-triangle"></i> Watch out for</h3>
        <ul>
          <li><strong>不</strong> becomes <strong>bú</strong> (2nd tone) before any 4th-tone syllable.</li>
          <li>Never use <strong>不</strong> with <strong>有</strong> — use <strong>没有</strong> instead.</li>
          <li>For past negation, use <strong>没</strong> / <strong>没有</strong>, not <strong>不</strong>.</li>
        </ul>
      </div>

      <div className="wd-foot">
        <button className="btn btn-outline"><i data-lucide="pen-line"></i> Try this pattern in a journal entry</button>
        <div className="wd-foot-right">
          <button className="btn btn-primary">Next: The 也 particle <i data-lucide="arrow-right"></i></button>
        </div>
      </div>
    </div>
  );
}

window.WordList = WordList;
window.GrammarList = GrammarList;
window.WordDetail = WordDetail;
window.GrammarDetail = GrammarDetail;
