const gloss_sentences = [
  [
    { h:"昨天", p:"zuótiān", e:"yesterday", a:false },
    { h:"我", p:"wǒ", e:"I", a:false },
    { h:"和", p:"hé", e:"with", a:false },
    { h:"朋友", p:"péngyou", e:"friend", a:true },
    { h:"去", p:"qù", e:"went to", a:false },
    { h:"了", p:"le", e:"(past)", a:false },
    { h:"一家", p:"yì jiā", e:"a", a:false },
    { h:"中国", p:"Zhōngguó", e:"Chinese", a:false },
    { h:"餐厅", p:"cāntīng", e:"restaurant", a:true },
    { punct:"。" }
  ],
  [
    { h:"服务员", p:"fúwùyuán", e:"waiter", a:true, focus:true },
    { h:"很", p:"hěn", e:"very", a:false },
    { h:"热情", p:"rèqíng", e:"warm", a:false },
    { punct:"，" },
    { h:"她", p:"tā", e:"she", a:false },
    { h:"推荐", p:"tuījiàn", e:"recommended", a:true },
    { h:"了", p:"le", e:"(past)", a:false },
    { h:"一个", p:"yí gè", e:"a", a:false },
    { h:"很", p:"hěn", e:"very", a:false },
    { h:"有名", p:"yǒumíng", e:"famous", a:false },
    { h:"的", p:"de", e:"(poss.)", a:false },
    { h:"菜", p:"cài", e:"dish", a:false },
    { punct:"。" }
  ]
];

function Journal() {
  return (
    <div>
      <h1 className="page-title">Daily Journal</h1>
      <p className="page-sub">Write a little every day — a few lines beats a perfect paragraph.</p>

      <Card className="pad-lg">
        <div className="entry-head">
          <div>
            <h2 className="entry-title"><span className="zh">餐厅</span>The restaurant</h2>
            <div className="entry-meta">Monday · Feb 3 · 8:42 PM · 74 characters · 2 sentences</div>
          </div>
          <div className="entry-tools">
            <button className="icon-btn" title="Play audio"><i data-lucide="volume-2"></i></button>
            <button className="icon-btn" title="Toggle gloss"><i data-lucide="languages"></i></button>
            <button className="icon-btn" title="Edit"><i data-lucide="pencil"></i></button>
            <button className="icon-btn" title="More"><i data-lucide="more-horizontal"></i></button>
          </div>
        </div>

        <div style={{ display:"flex", gap:6, marginBottom:18, flexWrap:"wrap" }}>
          <Pill variant="focus" icon="target">Focus word · 服务员</Pill>
          <Pill variant="watch">HSK 2</Pill>
          <Pill variant="done" icon="check">3 new words</Pill>
        </div>

        {gloss_sentences.map((sent, si) => (
          <div key={si} className="gloss-para" style={{ marginBottom: 14 }}>
            {sent.map((w, wi) => w.punct
              ? <span key={wi} className="gloss-punct">{w.punct}</span>
              : (
                <span key={wi} className={`gloss-word ${w.a ? "annotated" : ""}`} title={w.focus ? "Focus word" : ""}>
                  <span className="hz">{w.h}</span>
                  <span className="py">{w.p}</span>
                  <span className="en">{w.e}</span>
                </span>
              )
            )}
          </div>
        ))}

        <div style={{ display:"flex", gap:8, marginTop:24, paddingTop:18, borderTop:"1px solid var(--border)" }}>
          <button className="btn btn-outline"><i data-lucide="plus" style={{ width:14, height:14 }}></i>Add sentence</button>
          <button className="btn btn-outline"><i data-lucide="sparkles" style={{ width:14, height:14 }}></i>Ask for feedback</button>
          <span style={{ flex:1 }}></span>
          <button className="btn btn-primary">Mark complete</button>
        </div>
      </Card>

      <Card>
        <Eyebrow icon="clock" meta="Previous entries">Recent</Eyebrow>
        {[
          { d:"Sun · Feb 2", zh:"周末的计划", en:"Weekend plans", words:52 },
          { d:"Sat · Feb 1", zh:"咖啡馆", en:"At the café", words:68 },
          { d:"Fri · Jan 31", zh:"和爸爸妈妈打电话", en:"Called parents", words:41 },
        ].map((it, i) => (
          <div key={i} className="na-row">
            <div>
              <div style={{ fontSize:15, fontWeight:600 }}><span style={{ color:"var(--cn-orange)", marginRight:10 }}>{it.zh}</span>{it.en}</div>
              <div className="na-meta" style={{ marginTop:2 }}>{it.d} · {it.words} characters</div>
            </div>
            <a className="btn-link" style={{ color:"var(--cn-orange)" }}>Open →</a>
          </div>
        ))}
      </Card>
    </div>
  );
}
window.Journal = Journal;
