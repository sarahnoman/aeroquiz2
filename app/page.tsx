"use client";
import { useState, useEffect, useRef } from "react";

const isAdmin = () => typeof window !== "undefined" && window.location.search.includes("admin=true");
const today = () => new Date().toISOString().split("T")[0];
const medal = (i: number) => ["🥇","🥈","🥉"][i] ?? `${i+1}.`;

const T = {
  bg: "#080c14", panel: "rgba(12,20,36,0.95)", panelBorder: "rgba(56,189,248,0.12)",
  accent: "#38bdf8", accentDim: "rgba(56,189,248,0.12)", green: "#4ade80",
  greenDim: "rgba(74,222,128,0.12)", red: "#f87171", redDim: "rgba(248,113,113,0.12)",
  amber: "#fbbf24", text: "#e2e8f0", muted: "rgba(148,163,184,0.7)",
  subtle: "rgba(148,163,184,0.25)", mono: "'JetBrains Mono','Courier New',monospace",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  *{box-sizing:border-box;}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{background:rgba(56,189,248,0.3);border-radius:99px}
  input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.7) sepia(1) hue-rotate(180deg)}
  ::placeholder{color:rgba(148,163,184,0.35)}
`;

const HUD = ({ label, value, accent = T.accent }: any) => (
  <div style={{ borderLeft: `2px solid ${accent}`, paddingLeft: 10 }}>
    <div style={{ fontSize: 9, color: T.muted, fontFamily: T.mono, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 14, fontWeight: 600, fontFamily: T.mono, color: accent }}>{value}</div>
  </div>
);

const Tag = ({ children, color = T.accent }: any) => (
  <span style={{ fontSize: 10, fontFamily: T.mono, background: `${color}18`, border: `1px solid ${color}40`, color, borderRadius: 4, padding: "3px 8px", letterSpacing: 1, textTransform: "uppercase" as const }}>{children}</span>
);

const Spinner = () => (
  <div style={{ width: 32, height: 32, border: `2px solid ${T.accentDim}`, borderTop: `2px solid ${T.accent}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "16px auto" }} />
);

const PrimaryBtn = ({ children, onClick, style = {} }: any) => (
  <button onClick={onClick} style={{ background: `linear-gradient(135deg,rgba(56,189,248,0.2),rgba(56,189,248,0.08))`, border: `1px solid ${T.accent}`, color: T.accent, borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Inter,sans-serif", width: "100%", letterSpacing: 0.5, ...style }}>{children}</button>
);

const GhostBtn = ({ children, onClick, style = {} }: any) => (
  <button onClick={onClick} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${T.panelBorder}`, color: T.text, borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer", fontFamily: "Inter,sans-serif", ...style }}>{children}</button>
);

const Input = ({ style = {}, ...props }: any) => (
  <input style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid ${T.panelBorder}`, borderRadius: 8, padding: "11px 14px", color: T.text, fontSize: 14, outline: "none", fontFamily: "Inter,sans-serif", ...style }} {...props} />
);

const Textarea = ({ style = {}, ...props }: any) => (
  <textarea style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid ${T.panelBorder}`, borderRadius: 8, padding: "11px 14px", color: T.text, fontSize: 13, outline: "none", resize: "vertical" as const, minHeight: 90, fontFamily: "Inter,sans-serif", ...style }} {...props} />
);

async function api(action: string, body?: any) {
  if (body) {
    const res = await fetch("/api/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...body }) });
    return res.json();
  } else {
    const res = await fetch(`/api/quiz?action=${action}`);
    return res.json();
  }
}

// ── ADMIN ────────────────────────────────────────────────
function AdminPanel() {
  const [tab, setTab] = useState("generate");
  const [quizzes, setQuizzes] = useState<Record<string, any[]>>({});
  const [generating, setGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [numQ, setNumQ] = useState(20);
  const [quizDate, setQuizDate] = useState(today());
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const data = await api("getActive");
    if (data.quizzes) setQuizzes(data.quizzes);
    if (data.date) setActiveDate(data.date);
    if (data.leaderboard) setLeaderboard(data.leaderboard);
  }

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  async function handlePDF(file: File) {
    if (!file) return;
    setErr(""); setGenerating(true); setQuestions([]);
    setGenStatus("Parsing slides…");
    try {
      const base64 = await new Promise<string>((res, rej) => {
        const r = new FileReader(); r.onload = () => res((r.result as string).split(",")[1]); r.onerror = rej; r.readAsDataURL(file);
      });
      setGenStatus(`Generating ${numQ} questions…`);
      const prompt = `You are an expert aviation exam writer. Read the lecture slides and generate exactly ${numQ} high-quality multiple-choice questions that test genuine understanding. Questions should be exam-realistic and precise, as expected in aviation training.\nReturn ONLY a valid JSON array. No markdown, no explanation, no backticks.\nEach item: { "question": string, "options": [A,B,C,D], "answer": 0-3, "explanation": string }`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4096, messages: [{ role: "user", content: [{ type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } }, { type: "text", text: prompt }] }] })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content.map((b: any) => b.text || "").join("");
      setQuestions(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch (e: any) { setErr("Generation failed: " + e.message); }
    setGenerating(false); setGenStatus("");
  }

  function startEdit(i: number) { setEditIdx(i); setEditData({ ...questions[i], options: [...questions[i].options] }); }
  function saveEdit() { const u = [...questions]; u[editIdx!] = editData; setQuestions(u); setEditIdx(null); }
  function deleteQ(i: number) { setQuestions(q => q.filter((_, j) => j !== i)); }

  async function publishQuiz() {
    if (!questions.length) { setErr("No questions to publish."); return; }
    await api("saveQuiz", { date: quizDate, questions });
    const updated = { ...quizzes, [quizDate]: questions };
    setQuizzes(updated); setActiveDate(quizDate); setQuestions([]);
    showToast(`Quiz published for ${quizDate}`); setTab("quizzes");
  }

  async function setActive(date: string) { await api("setActive", { date }); setActiveDate(date); showToast(`Active quiz set to ${date}`); }
  async function deleteQuiz(date: string) {
    await api("deleteQuiz", { date });
    const updated = { ...quizzes }; delete updated[date]; setQuizzes(updated);
    if (activeDate === date) setActiveDate(null);
    showToast("Quiz deleted");
  }

  const todayLb = leaderboard.filter((e: any) => e.date === activeDate).sort((a: any, b: any) => b.score - a.score);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "Inter,sans-serif", color: T.text }}>
      <style>{css}</style>
      <div style={{ borderBottom: `1px solid ${T.panelBorder}`, padding: "14px 32px", display: "flex", alignItems: "center", gap: 16, background: "rgba(8,12,20,0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ fontFamily: T.mono, fontWeight: 600, fontSize: 15, color: T.accent, letterSpacing: 2 }}>AEROQUIZ</div>
        <div style={{ width: 1, height: 16, background: T.panelBorder }} />
        <Tag color={T.red}>ADMIN</Tag>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, fontFamily: T.mono, color: T.muted }}>{new Date().toUTCString().replace(/ GMT$/, " UTC")}</div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
          {[{ label: "Total Quizzes", value: Object.keys(quizzes).length }, { label: "Active Quiz", value: activeDate || "—", accent: activeDate ? T.green : T.muted }, { label: "Players Today", value: todayLb.length }, { label: "Top Score", value: todayLb[0] ? `${todayLb[0].score}/${todayLb[0].total}` : "—" }].map((s, i) => (
            <div key={i} style={{ background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 12, padding: 16 }}><HUD label={s.label} value={s.value} accent={(s as any).accent} /></div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[["generate", "＋  New Quiz"], ["quizzes", "≡  All Quizzes"], ["scores", "◎  Live Scores"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ background: tab === id ? T.accentDim : "transparent", border: `1px solid ${tab === id ? T.accent : T.panelBorder}`, color: tab === id ? T.accent : T.muted, borderRadius: 8, padding: "8px 18px", fontSize: 13, cursor: "pointer", fontFamily: "Inter,sans-serif" }}>{label}</button>
          ))}
        </div>

        {tab === "generate" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, marginBottom: 20 }}>
              <div style={{ background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, color: T.muted, fontFamily: T.mono, letterSpacing: 2, marginBottom: 10 }}>QUIZ DATE</div>
                <Input type="date" value={quizDate} onChange={(e: any) => setQuizDate(e.target.value)} style={{ width: "auto", colorScheme: "dark" }} />
              </div>
              <div style={{ background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, color: T.muted, fontFamily: T.mono, letterSpacing: 2, marginBottom: 10 }}>QUESTIONS</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[10, 15, 20].map(n => (
                    <button key={n} onClick={() => setNumQ(n)} style={{ background: numQ === n ? T.accentDim : "transparent", border: `1px solid ${numQ === n ? T.accent : T.panelBorder}`, color: numQ === n ? T.accent : T.muted, borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: T.mono }}>{n}</button>
                  ))}
                </div>
              </div>
            </div>

            <div onClick={() => !generating && fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (!generating) handlePDF(e.dataTransfer.files[0]); }}
              style={{ background: T.panel, border: `2px dashed ${generating ? T.accent : T.panelBorder}`, borderRadius: 12, padding: 40, textAlign: "center", cursor: generating ? "default" : "pointer", marginBottom: 20 }}>
              <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => e.target.files && handlePDF(e.target.files[0])} />
              {generating ? <><Spinner /><div style={{ fontSize: 13, fontFamily: T.mono, color: T.accent }}>{genStatus}</div></> : <><div style={{ fontSize: 36, marginBottom: 8 }}>📄</div><div style={{ fontWeight: 600, marginBottom: 4 }}>Drop PDF lecture slides here</div><div style={{ color: T.muted, fontSize: 13 }}>or click to browse · PDF only</div></>}
            </div>

            {err && <div style={{ color: T.red, fontSize: 13, marginBottom: 12, fontFamily: T.mono }}>{err}</div>}

            {questions.length > 0 && <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ fontWeight: 700 }}>{questions.length} questions</span><Tag color={T.green}>READY</Tag></div>
                <button onClick={publishQuiz} style={{ background: T.greenDim, border: `1px solid ${T.green}`, color: T.green, borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>↑ Publish for {quizDate}</button>
              </div>
              {questions.map((q, i) => (
                <div key={i} style={{ background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 12, padding: 18, marginBottom: 10 }}>
                  {editIdx === i ? <>
                    <Textarea value={editData.question} onChange={(e: any) => setEditData({ ...editData, question: e.target.value })} style={{ marginBottom: 10 }} />
                    {editData.options.map((opt: string, oi: number) => (
                      <div key={oi} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
                        <button onClick={() => setEditData({ ...editData, answer: oi })} style={{ background: oi === editData.answer ? "rgba(74,222,128,0.15)" : "transparent", border: `1px solid ${oi === editData.answer ? T.green : T.panelBorder}`, color: oi === editData.answer ? T.green : T.muted, borderRadius: 6, width: 30, height: 30, fontFamily: T.mono, fontSize: 12, cursor: "pointer" }}>{"ABCD"[oi]}</button>
                        <Input value={opt} onChange={(e: any) => { const o = [...editData.options]; o[oi] = e.target.value; setEditData({ ...editData, options: o }); }} style={{ flex: 1 }} />
                      </div>
                    ))}
                    <Textarea placeholder="Explanation…" value={editData.explanation} onChange={(e: any) => setEditData({ ...editData, explanation: e.target.value })} style={{ marginTop: 8, minHeight: 60 }} />
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <button onClick={saveEdit} style={{ background: T.greenDim, border: `1px solid ${T.green}`, color: T.green, borderRadius: 8, padding: "8px 18px", fontSize: 13, cursor: "pointer" }}>Save</button>
                      <GhostBtn onClick={() => setEditIdx(null)}>Cancel</GhostBtn>
                    </div>
                  </> : <>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.5, flex: 1 }}><span style={{ color: T.muted, fontFamily: T.mono, marginRight: 8, fontSize: 12 }}>{String(i + 1).padStart(2, "0")}</span>{q.question}</div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button onClick={() => startEdit(i)} style={{ background: "transparent", border: `1px solid ${T.panelBorder}`, color: T.muted, borderRadius: 6, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>Edit</button>
                        <button onClick={() => deleteQ(i)} style={{ background: T.redDim, border: `1px solid rgba(248,113,113,0.3)`, color: T.red, borderRadius: 6, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>Del</button>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 10 }}>
                      {q.options.map((opt: string, oi: number) => (
                        <div key={oi} style={{ fontSize: 12, color: oi === q.answer ? T.green : T.muted, display: "flex", gap: 6 }}><span style={{ fontFamily: T.mono, fontWeight: 600 }}>{"ABCD"[oi]}.</span>{opt}{oi === q.answer && " ✓"}</div>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 8, fontStyle: "italic", borderTop: `1px solid ${T.panelBorder}`, paddingTop: 8 }}>{q.explanation}</div>
                  </>}
                </div>
              ))}
              <button onClick={publishQuiz} style={{ background: T.greenDim, border: `1px solid ${T.green}`, color: T.green, borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%" }}>↑ Publish Quiz for {quizDate}</button>
            </>}
          </div>
        )}

        {tab === "quizzes" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {Object.keys(quizzes).length === 0 && <div style={{ color: T.muted, fontFamily: T.mono, fontSize: 13 }}>NO QUIZZES PUBLISHED YET</div>}
            {Object.keys(quizzes).sort().reverse().map(date => (
              <div key={date} style={{ background: T.panel, border: `1px solid ${activeDate === date ? T.accent : T.panelBorder}`, borderRadius: 12, padding: 18, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontFamily: T.mono, fontWeight: 600, fontSize: 15 }}>{date}</span>
                      {activeDate === date && <Tag color={T.green}>ACTIVE</Tag>}
                      {date === today() && <Tag color={T.accent}>TODAY</Tag>}
                    </div>
                    <div style={{ fontSize: 12, color: T.muted }}>{quizzes[date].length} questions · {leaderboard.filter((e: any) => e.date === date).length} players</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {activeDate !== date && <button onClick={() => setActive(date)} style={{ background: T.accentDim, border: `1px solid ${T.accent}40`, color: T.accent, borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer" }}>Set Active</button>}
                    <button onClick={() => deleteQuiz(date)} style={{ background: T.redDim, border: `1px solid rgba(248,113,113,0.2)`, color: T.red, borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer" }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "scores" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontSize: 11, color: T.muted, fontFamily: T.mono, letterSpacing: 2, marginBottom: 16 }}>LEADERBOARD — {activeDate || "NO ACTIVE QUIZ"}</div>
            {todayLb.length === 0 && <div style={{ color: T.muted, fontSize: 13, fontFamily: T.mono }}>NO SCORES YET</div>}
            {todayLb.map((e: any, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: T.panel, border: `1px solid ${i === 0 ? T.accent + "40" : T.panelBorder}`, borderRadius: 10, padding: "12px 18px", marginBottom: 8 }}>
                <span style={{ fontSize: 18, width: 28 }}>{medal(i)}</span>
                <span style={{ flex: 1, fontWeight: 600 }}>{e.name}</span>
                <span style={{ fontSize: 11, color: T.muted, fontFamily: T.mono }}>{e.date}</span>
                <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.accent }}>{e.score}/{e.total}</span>
                <div style={{ width: 80, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}>
                  <div style={{ height: "100%", width: `${(e.score / e.total) * 100}%`, background: e.score / e.total >= 0.8 ? T.green : e.score / e.total >= 0.5 ? T.amber : T.red, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {toast && <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: T.greenDim, border: `1px solid ${T.green}`, color: T.green, borderRadius: 8, padding: "10px 20px", fontSize: 13, fontFamily: T.mono, zIndex: 100 }}>✓ {toast}</div>}
    </div>
  );
}

// ── PLAYER ───────────────────────────────────────────────
function PlayerApp() {
  const [screen, setScreen] = useState("home");
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const data = await api("getActive");
    if (data.date) setActiveDate(data.date);
    if (data.date && data.quizzes && data.quizzes[data.date]) setQuestions(data.quizzes[data.date]);
    if (data.leaderboard) setLeaderboard(data.leaderboard);
    setLoading(false);
  }

  function startQuiz() {
    if (!playerName.trim()) { setErr("Callsign required."); return; }
    setErr(""); setCurrent(0); setScore(0); setSelected(null); setShowFeedback(false); setScreen("quiz");
  }

  function handleAnswer(idx: number) {
    if (showFeedback) return;
    setSelected(idx); setShowFeedback(true);
    if (idx === questions[current].answer) setScore(s => s + 1);
  }

  async function next() {
    const isLast = current + 1 >= questions.length;
    if (isLast) {
      const entry = { name: playerName.trim(), score, total: questions.length, date: activeDate };
      await api("saveScore", { entry });
      const filtered = leaderboard.filter((e: any) => !(e.name === entry.name && e.date === activeDate));
      const updated = [...filtered, entry].sort((a: any, b: any) => b.score - a.score);
      setLeaderboard(updated);
      setScreen("result");
    } else {
      setCurrent(c => c + 1); setSelected(null); setShowFeedback(false);
    }
  }

  const q = questions[current] || {};
  const pct = questions.length ? score / questions.length : 0;
  const todayLb = leaderboard.filter((e: any) => e.date === activeDate).sort((a: any, b: any) => b.score - a.score);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{css}</style><Spinner />
    </div>
  );

  const Nav = () => (
    <div style={{ borderBottom: `1px solid ${T.panelBorder}`, padding: "13px 28px", display: "flex", alignItems: "center", gap: 14, background: "rgba(8,12,20,0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10 }}>
      <span style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 14, color: T.accent, letterSpacing: 3 }}>AEROQUIZ</span>
      <div style={{ flex: 1 }} />
      {activeDate && <Tag color={T.accent}>{activeDate}</Tag>}
      <button onClick={() => { loadAll(); setScreen("leaderboard"); }} style={{ background: "transparent", border: "none", color: T.muted, fontSize: 13, cursor: "pointer" }}>🏆 Board</button>
    </div>
  );

  const Wrap = ({ children, maxW = 560 }: any) => (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "Inter,sans-serif", color: T.text, display: "flex", flexDirection: "column" }}>
      <style>{css}</style>
      <Nav />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ width: "100%", maxWidth: maxW, animation: "fadeIn 0.35s ease" }}>{children}</div>
      </div>
    </div>
  );

  if (screen === "home") return (
    <Wrap>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.accent, letterSpacing: 4, marginBottom: 12 }}>DAILY BRIEFING</div>
        <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }}>Ready for<br />today's quiz?</div>
        <div style={{ color: T.muted, fontSize: 14 }}>Test your knowledge. Compete with your crew.</div>
      </div>
      {questions.length > 0 ? (
        <div style={{ background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 32 }}>
            <HUD label="Date" value={activeDate} />
            <HUD label="Questions" value={questions.length} />
            <HUD label="Players" value={todayLb.length} accent={T.green} />
          </div>
        </div>
      ) : (
        <div style={{ background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 16, padding: 24, marginBottom: 20, textAlign: "center", color: T.muted, fontSize: 13, fontFamily: T.mono }}>NO ACTIVE QUIZ — STAND BY</div>
      )}
      {questions.length > 0 && <PrimaryBtn onClick={() => { setErr(""); setScreen("name"); }}>BEGIN QUIZ →</PrimaryBtn>}
      <GhostBtn onClick={() => { loadAll(); setScreen("leaderboard"); }} style={{ width: "100%", marginTop: 10 }}>View Leaderboard</GhostBtn>
    </Wrap>
  );

  if (screen === "name") return (
    <Wrap>
      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.accent, letterSpacing: 4, marginBottom: 20 }}>IDENTIFY YOURSELF</div>
      <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Enter your callsign</div>
      <div style={{ color: T.muted, fontSize: 13, marginBottom: 24 }}>Your name will appear on the leaderboard.</div>
      <Input placeholder="e.g. Maverick" value={playerName} onChange={(e: any) => setPlayerName(e.target.value)} onKeyDown={(e: any) => e.key === "Enter" && startQuiz()} autoFocus />
      {err && <div style={{ color: T.red, fontSize: 12, fontFamily: T.mono, marginTop: 8 }}>{err}</div>}
      <PrimaryBtn onClick={startQuiz} style={{ marginTop: 20 }}>CONFIRM & START →</PrimaryBtn>
      <GhostBtn onClick={() => setScreen("home")} style={{ width: "100%", marginTop: 8 }}>← Back</GhostBtn>
    </Wrap>
  );

  if (screen === "quiz") return (
    <Wrap maxW={640}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>{String(current + 1).padStart(2, "0")} / {String(questions.length).padStart(2, "0")}</span>
        <span style={{ fontFamily: T.mono, fontSize: 13, color: T.accent, fontWeight: 700 }}>⭐ {score} PTS</span>
      </div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99, marginBottom: 28, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(current / questions.length) * 100}%`, background: T.accent, borderRadius: 99, transition: "width 0.5s ease", boxShadow: `0 0 8px ${T.accent}` }} />
      </div>
      <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.65, marginBottom: 22 }}>{q.question}</div>
      {q.options?.map((opt: string, i: number) => {
        const isCorrect = i === q.answer, isChosen = i === selected;
        const bg = showFeedback ? isCorrect ? "rgba(74,222,128,0.1)" : isChosen ? "rgba(248,113,113,0.1)" : "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.03)";
        const border = showFeedback ? isCorrect ? T.green : isChosen ? T.red : T.panelBorder : T.panelBorder;
        return (
          <button key={i} onClick={() => handleAnswer(i)} style={{ width: "100%", textAlign: "left", background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: "13px 16px", color: T.text, fontSize: 14, cursor: showFeedback ? "default" : "pointer", marginBottom: 8, display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s" }}>
            <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: showFeedback ? isCorrect ? T.green : isChosen ? T.red : T.subtle : T.subtle, minWidth: 20 }}>{"ABCD"[i]}</span>
            <span style={{ lineHeight: 1.5 }}>{opt}</span>
            {showFeedback && isCorrect && <span style={{ marginLeft: "auto", color: T.green }}>✓</span>}
            {showFeedback && isChosen && !isCorrect && <span style={{ marginLeft: "auto", color: T.red }}>✗</span>}
          </button>
        );
      })}
      {showFeedback && (
        <div style={{ background: "rgba(56,189,248,0.05)", border: `1px solid ${T.panelBorder}`, borderRadius: 10, padding: "14px 16px", marginTop: 8, animation: "fadeIn 0.3s ease" }}>
          <div style={{ fontSize: 12, fontFamily: T.mono, color: T.accent, letterSpacing: 2, marginBottom: 6 }}>DEBRIEF</div>
          <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.6 }}>{q.explanation}</div>
          <PrimaryBtn onClick={next} style={{ marginTop: 14 }}>{current + 1 < questions.length ? "NEXT QUESTION →" : "SEE RESULTS →"}</PrimaryBtn>
        </div>
      )}
    </Wrap>
  );

  if (screen === "result") return (
    <Wrap>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>{pct >= 0.8 ? "🎯" : pct >= 0.5 ? "📋" : "📚"}</div>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.accent, letterSpacing: 4, marginBottom: 8 }}>MISSION DEBRIEF</div>
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{playerName}</div>
        <div style={{ fontSize: 52, fontWeight: 800, fontFamily: T.mono, color: pct >= 0.8 ? T.green : pct >= 0.5 ? T.amber : T.red }}>{score}<span style={{ fontSize: 22, color: T.muted }}>/{questions.length}</span></div>
        <div style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>{pct >= 0.8 ? "Outstanding. Cleared for departure. ✈️" : pct >= 0.5 ? "Passing grade. More study recommended." : "Below minimums. Additional training required."}</div>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, marginBottom: 24, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct * 100}%`, background: pct >= 0.8 ? T.green : pct >= 0.5 ? T.amber : T.red, borderRadius: 99 }} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontFamily: T.mono, color: T.muted, letterSpacing: 2, marginBottom: 10 }}>TODAY'S CREW</div>
        {todayLb.slice(0, 5).map((e: any, i: number) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: e.name === playerName ? T.accentDim : "rgba(255,255,255,0.03)", border: `1px solid ${e.name === playerName ? T.accent + "40" : T.panelBorder}`, borderRadius: 10, padding: "10px 16px", marginBottom: 6 }}>
            <span style={{ fontSize: 16, width: 24 }}>{medal(i)}</span>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{e.name}</span>
            <span style={{ fontFamily: T.mono, fontSize: 13, color: T.accent }}>{e.score}/{e.total}</span>
          </div>
        ))}
      </div>
      <PrimaryBtn onClick={() => setScreen("leaderboard")}>FULL LEADERBOARD →</PrimaryBtn>
      <GhostBtn onClick={() => setScreen("home")} style={{ width: "100%", marginTop: 8 }}>← Home</GhostBtn>
    </Wrap>
  );

  if (screen === "leaderboard") return (
    <Wrap>
      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.accent, letterSpacing: 4, marginBottom: 20 }}>LEADERBOARD</div>
      <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 20 }}>All-time Rankings</div>
      {leaderboard.length === 0 && <div style={{ color: T.muted, fontFamily: T.mono, fontSize: 13 }}>NO SCORES YET</div>}
      {leaderboard.slice(0, 30).map((e: any, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: i === 0 ? T.accentDim : "rgba(255,255,255,0.03)", border: `1px solid ${i === 0 ? T.accent + "40" : T.panelBorder}`, borderRadius: 10, padding: "11px 16px", marginBottom: 6 }}>
          <span style={{ fontSize: 17, width: 24 }}>{medal(i)}</span>
          <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{e.name}</span>
          <span style={{ fontSize: 11, color: T.muted, fontFamily: T.mono, marginRight: 8 }}>{e.date}</span>
          <div style={{ width: 60, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99, marginRight: 10 }}>
            <div style={{ height: "100%", width: `${(e.score / e.total) * 100}%`, background: e.score / e.total >= 0.8 ? T.green : e.score / e.total >= 0.5 ? T.amber : T.red, borderRadius: 99 }} />
          </div>
          <span style={{ fontFamily: T.mono, fontSize: 13, color: T.accent, fontWeight: 700 }}>{e.score}/{e.total}</span>
        </div>
      ))}
      <GhostBtn onClick={() => setScreen("home")} style={{ width: "100%", marginTop: 16 }}>← Home</GhostBtn>
    </Wrap>
  );

  return null;
}

export default function Page() {
  const [admin, setAdmin] = useState(false);
  useEffect(() => { setAdmin(isAdmin()); }, []);
  return admin ? <AdminPanel /> : <PlayerApp />;
}