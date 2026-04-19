function App() {
  const [active, setActive] = useState("dashboard");
  useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [active]);
  return (
    <div className="app">
      <Sidebar active={active} onNav={setActive} />
      <main className="main">
        {active === "dashboard" && <Dashboard />}
        {active === "journal" && <Journal />}
        {active === "flash" && <Flashcards />}
        {(active !== "dashboard" && active !== "journal" && active !== "flash") && (
          <div style={{ padding:"80px 0", textAlign:"center", color:"#a3a3a3" }}>
            <p style={{ fontSize:14 }}>This section is part of the full app but out of scope for this UI kit.</p>
            <button className="btn btn-outline" onClick={() => setActive("dashboard")} style={{ marginTop:12 }}>Back to dashboard</button>
          </div>
        )}
      </main>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
