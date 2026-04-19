const flashcard_deck = [
  { h:"服务员", p:"fúwùyuán", e:"waiter, waitress", tag:"HSK 4" },
  { h:"推荐", p:"tuījiàn", e:"to recommend", tag:"HSK 4" },
  { h:"餐厅", p:"cāntīng", e:"restaurant", tag:"HSK 3" },
];

function Flashcards() {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = flashcard_deck[i];
  const rate = () => { setFlipped(false); setI((i+1) % flashcard_deck.length); };
  return (
    <div>
      <h1 className="page-title">Flashcards</h1>
      <p className="page-sub">12 cards due · pulled from today's reading</p>

      <div className="fc-stage">
        <div className="fc-meta">
          <span>Card {i+1} of {flashcard_deck.length}</span>
          <span>{card.tag}</span>
        </div>
        <div className="progress fc-bar" style={{ marginBottom:24, marginTop:0 }}>
          <div className="fill" style={{ width: `${((i+1)/flashcard_deck.length)*100}%` }}></div>
        </div>
        <div className={`fc ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(f => !f)}>
          {!flipped ? (
            <>
              <div className="hz">{card.h}</div>
              <div className="hint">Click to reveal</div>
            </>
          ) : (
            <>
              <div className="hz">{card.h}</div>
              <div className="py">{card.p}</div>
              <div className="en">{card.e}</div>
              <button className="icon-btn" style={{ marginTop:12 }} onClick={e => e.stopPropagation()}><i data-lucide="volume-2"></i></button>
            </>
          )}
        </div>
        {flipped && (
          <div className="fc-ratings">
            <button className="fc-rate again" onClick={rate}>Again<div style={{ fontSize:10, fontWeight:400, opacity:.7, marginTop:2 }}>{'<1m'}</div></button>
            <button className="fc-rate hard" onClick={rate}>Hard<div style={{ fontSize:10, fontWeight:400, opacity:.7, marginTop:2 }}>6m</div></button>
            <button className="fc-rate good" onClick={rate}>Good<div style={{ fontSize:10, fontWeight:400, opacity:.7, marginTop:2 }}>1d</div></button>
            <button className="fc-rate easy" onClick={rate}>Easy<div style={{ fontSize:10, fontWeight:400, opacity:.7, marginTop:2 }}>4d</div></button>
          </div>
        )}
      </div>
    </div>
  );
}
window.Flashcards = Flashcards;
