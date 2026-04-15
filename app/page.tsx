"use client";
import { useState, useEffect, useRef } from "react";

const isAdmin = () => typeof window !== "undefined" && window.location.search.includes("admin=true");
const today = () => new Date().toISOString().split("T")[0];
const medal = (i: number) => ["🥇","🥈","🥉"][i] ?? `${i+1}.`;

const T = {
  bg: "#d8e2f0",
  panel: "#ffffff",
  panelBorder: "#c8d4e8",
  header: "#1a2a4a",
  accent: "#a8c8f0",
  accentDark: "#1a2a4a",
  accentMid: "#4a6a9a",
  green: "#4ade80",
  greenDim: "rgba(74,222,128,0.12)",
  red: "#f87171",
  redDim: "rgba(248,113,113,0.12)",
  amber: "#fbbf24",
  text: "#1a2a4a",
  muted: "#6a8aaa",
  subtle: "#c8d4e8",
  cardBorder: "#dde8f5",
  stripe: "#1a2a4a",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Carlito:ital,wght@0,400;0,700;1,400;1,700&display=swap');
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
  *{box-sizing:border-box;}
  body{background:#d8e2f0;}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{background:#c8d4e8;border-radius:99px}
  ::placeholder{color:#a8c0d8}
  input,textarea,button{font-family:'Carlito',sans-serif;}
`;

const Spinner = () => (
  <div style={{ width: 28, height: 28, border: "2px solid #dde8f5", borderTop: "2px solid #1a2a4a", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "16px auto" }} />
);

const Tag = ({ children, color = T.header }: any) => (
  <span style={{ fontSize: 9, fontFamily: "'Carlito',sans-serif", background: color, color: T.accent, borderRadius: 4, padding: "3px 8px", letterSpacing: 1.5, textTransform: "uppercase" as const }}>{children}</span>
);

const PrimaryBtn = ({ children, onClick, style = {} }: any) => (
  <button onClick={onClick} style={{ background: T.header, border: "none", color: "#fff", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Carlito',sans-serif", width: "100%", letterSpacing: 0.3, transition: "opacity 0.15s", ...style }}
    onMouseOver={e => (e.currentTarget.style.opacity = "0.85")}
    onMouseOut={e => (e.currentTarget.style.opacity = "1")}
  >{children}</button>
);

const GhostBtn = ({ children, onClick, style = {} }: any) => (
  <button onClick={onClick} style={{ background: "#fff", border: "1px solid #c8d4e8", color: T.text, borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer", fontFamily: "'Carlito',sans-serif", ...style }}>{children}</button>
);

const Input = ({ style = {}, ...props }: any) => (
  <input style={{ width: "100%", background: "#fff", border: "1px solid #c8d4e8", borderRadius: 8, padding: "11px 14px", color: T.text, fontSize: 14, outline: "none", fontFamily: "'Carlito',sans-serif", ...style }} {...props} />
);

const Textarea = ({ style = {}, ...props }: any) => (
  <textarea style={{ width: "100%", background: "#fff", border: "1px solid #c8d4e8", borderRadius: 8, padding: "11px 14px", color: T.text, fontSize: 13, outline: "none", resize: "vertical" as const, minHeight: 90, fontFamily: "'Carlito',sans-serif", ...style }} {...props} />
);

async function api(action: string, body?: any) {
  if (body) {
    const res = await fetch("/api/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...body }) });
    return res.json();
  }
  const res = await fetch("/api/quiz?action=" + action);
  return res.json();
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff/60) + "m ago";
  if (diff < 86400) return Math.floor(diff/3600) + "h ago";
  return Math.floor(diff/86400) + "d ago";
}

function getQuizList(quizzes: Record<string, any>, date: string): any[] {
  const q = quizzes[date];
  if (!q) return [];
  return Array.isArray(q) ? q : (q.questions || []);
}

function getQuizTopic(quizzes: Record<string, any>, date: string): string | null {
  const q = quizzes[date];
  if (!q || Array.isArray(q)) return null;
  return q.topic || null;
}

function GlobalChat({ playerName }: { playerName: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [name, setName] = useState(playerName || "");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadMessages(); const t = setInterval(loadMessages, 8000); return () => clearInterval(t); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function loadMessages() {
    const data = await api("getActive");
    if (data.messages) setMessages(data.messages);
  }

  async function send() {
    if (!text.trim() || !name.trim() || sending) return;
    setSending(true);
    await api("saveMessage", { name: name.trim(), text: text.trim() });
    setText("");
    await loadMessages();
    setSending(false);
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #c8d4e8", borderRadius: 12, overflow: "hidden", marginTop: 24 }}>
      <div style={{ padding: "13px 18px", borderBottom: "1px solid #eef1f5", display: "flex", alignItems: "center", gap: 10, background: T.header }}>
        <span style={{ fontSize: 14 }}>💬</span>
        <span style={{ fontFamily: "'Carlito',sans-serif", fontSize: 11, color: T.accent, letterSpacing: 2 }}>CREW CHAT</span>
        <span style={{ fontSize: 11, color: "#4a6a8a", marginLeft: "auto" }}>chat with your crew</span>
      </div>

      <div style={{ height: 260, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10, background: "#f8fafd" }}>
        {messages.length === 0 && (
          <div style={{ color: T.muted, fontSize: 13, textAlign: "center", marginTop: 70 }}>No messages yet — start the discussion! ✈️</div>
        )}
        {messages.map((m: any, i: number) => (
          <div key={i} style={{ display: "flex", gap: 10, animation: "fadeIn 0.3s ease" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.header, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: T.accent, flexShrink: 0, fontFamily: "'Carlito',sans-serif" }}>
              {m.name[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{m.name}</span>
                <span style={{ fontSize: 10, color: T.muted }}>{timeAgo(m.time)}</span>
              </div>
              <div style={{ fontSize: 13, color: "#4a6a8a", lineHeight: 1.5 }}>{m.text}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "12px 18px", borderTop: "1px solid #eef1f5", display: "flex", flexDirection: "column", gap: 8, background: "#fff" }}>
        {!playerName && (
          <Input placeholder="Your callsign" value={name} onChange={(e: any) => setName(e.target.value)} style={{ fontSize: 13 }} />
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Say something to your crew…"
            style={{ flex: 1, background: "#f8fafd", border: "1px solid #c8d4e8", borderRadius: 8, padding: "10px 14px", color: T.text, fontSize: 13, outline: "none", fontFamily: "'Carlito',sans-serif" }}
          />
          <button onClick={send} disabled={sending || !text.trim() || !name.trim()}
            style={{ background: text.trim() && name.trim() ? T.header : "#eef1f5", border: "none", color: text.trim() && name.trim() ? "#fff" : T.muted, borderRadius: 8, padding: "10px 16px", fontSize: 14, cursor: text.trim() && name.trim() ? "pointer" : "default", fontWeight: 700, transition: "all 0.2s" }}>
            {sending ? "…" : "↑"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  async function check() {
    const res = await fetch('/api/quiz?action=checkPassword&pw=' + encodeURIComponent(pw));
    const data = await res.json();
    if (data.ok) { onLogin(); } else { setErr('Wrong password ✈️'); }
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Carlito',sans-serif" }}>
      <style>{css}</style>
      <div style={{ background: '#fff', border: '1px solid #c8d4e8', borderRadius: 16, padding: 40, width: 320, boxShadow: "0 4px 24px rgba(26,42,74,0.08)" }}>
        <div style={{ background: T.header, borderRadius: 10, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "'Carlito',sans-serif", fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: 4 }}>AERO<span style={{ color: T.accent }}>QUIZ</span></span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 20 }}>Admin access</div>
        <Input placeholder='Password' type='password' value={pw} onChange={(e: any) => setPw(e.target.value)} onKeyDown={(e: any) => { if (e.key === 'Enter') check(); }} autoFocus />
        {err && <div style={{ color: T.red, fontSize: 12, marginTop: 8 }}>{err}</div>}
        <PrimaryBtn onClick={check} style={{ marginTop: 16 }}>Enter</PrimaryBtn>
      </div>
    </div>
  );
}

function AdminPanel() {
  const [tab, setTab] = useState("generate");
  const [quizzes, setQuizzes] = useState<Record<string, any>>({});
  const [questions, setQuestions] = useState<any[]>([]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [quizDate, setQuizDate] = useState(today());
  const [topic, setTopic] = useState('');
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const data = await api("getActive");
    if (data.quizzes) setQuizzes(data.quizzes);
    if (data.date) setActiveDate(data.date);
    if (data.leaderboard) setLeaderboard(data.leaderboard);
  }

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  function startEdit(i: number) { setEditIdx(i); setEditData({ ...questions[i], options: [...questions[i].options] }); }
  function saveEdit() { const u = [...questions]; u[editIdx!] = editData; setQuestions(u); setEditIdx(null); }
  function deleteQ(i: number) { setQuestions(q => q.filter((_: any, j: number) => j !== i)); }

  async function publishQuiz() {
    if (!questions.length) { setErr("No questions to publish."); return; }
    await api('saveQuiz', { date: quizDate, questions, topic });
    const updated = { ...quizzes, [quizDate]: { questions, topic } };
    setQuizzes(updated); setActiveDate(quizDate); setQuestions([]);
    showToast("Quiz published for " + quizDate); setTab("quizzes");
  }

  async function setActive(date: string) { await api("setActive", { date }); setActiveDate(date); showToast("Active quiz set to " + date); }

  async function deleteQuiz(date: string) {
    await api("deleteQuiz", { date });
    const updated = { ...quizzes }; delete updated[date]; setQuizzes(updated);
    if (activeDate === date) setActiveDate(null);
    showToast("Quiz deleted");
  }

  const todayLb = leaderboard.filter((e: any) => e.date === activeDate).sort((a: any, b: any) => b.score - a.score);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Carlito',sans-serif", color: T.text }}>
      <style>{css}</style>
      <div style={{ background: T.header, padding: "0 48px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "14px 0", display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: "'Carlito',sans-serif", fontWeight: 700, fontSize: 16, color: "#fff", letterSpacing: 4 }}>AERO<span style={{ color: T.accent }}>QUIZ</span></span>
          <Tag color={T.header}>ADMIN</Tag>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 11, fontFamily: "'Carlito',sans-serif", color: "#4a6a8a" }}>{new Date().toUTCString().replace(" GMT", " UTC")}</div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Total Quizzes", value: Object.keys(quizzes).length },
            { label: "Active Quiz", value: activeDate || "none" },
            { label: "Players Today", value: todayLb.length },
            { label: "Top Score", value: todayLb[0] ? todayLb[0].score+"/"+todayLb[0].total : "none" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #c8d4e8", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 9, color: T.muted, fontFamily: "'Carlito',sans-serif", letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[["generate","+ New Quiz"],["quizzes","All Quizzes"],["scores","Live Scores"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ background: tab===id ? T.header : "#fff", border: "1px solid "+(tab===id ? T.header : "#c8d4e8"), color: tab===id ? "#fff" : T.muted, borderRadius: 8, padding: "8px 18px", fontSize: 13, cursor: "pointer", fontFamily: "'Carlito',sans-serif", fontWeight: tab===id ? 600 : 400 }}>{label}</button>
          ))}
        </div>

        {tab === "generate" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14, marginBottom: 18 }}>
              <div style={{ background: "#fff", border: "1px solid #c8d4e8", borderRadius: 12, padding: 18 }}>
                <div style={{ fontSize: 10, color: T.muted, fontFamily: "'Carlito',sans-serif", letterSpacing: 2, marginBottom: 10 }}>QUIZ DATE</div>
                <Input type="date" value={quizDate} onChange={(e: any) => setQuizDate(e.target.value)} style={{ width: "auto", colorScheme: "light" }} />
                <Input placeholder='Topic e.g. Take-off and Landing' value={topic} onChange={(e: any) => setTopic(e.target.value)} style={{ marginTop: 8 }} />
              </div>
              <div style={{ background: "#fff", border: "1px solid #c8d4e8", borderRadius: 12, padding: 18 }}>
                <div style={{ fontSize: 10, color: T.muted, fontFamily: "'Carlito',sans-serif", letterSpacing: 2, marginBottom: 10 }}>QUESTIONS</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[10,15,20].map(n => (
                    <button key={n} onClick={() => {}} style={{ background: "#eef1f5", border: "1px solid #c8d4e8", color: T.text, borderRadius: 8, padding: "8px 14px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Carlito',sans-serif" }}>{n}</button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #c8d4e8", borderRadius: 12, padding: 18, marginBottom: 18 }}>
              <div style={{ fontSize: 10, color: T.muted, fontFamily: "'Carlito',sans-serif", letterSpacing: 2, marginBottom: 10 }}>PASTE QUESTIONS JSON</div>
              <Textarea placeholder='Paste JSON array: [{"question":"...","options":["A","B","C","D"],"answer":0,"explanation":"..."}]' style={{ minHeight: 130 }}
                onChange={(e: any) => {
                  try { const p = JSON.parse(e.target.value); if (Array.isArray(p) && p.length > 0) { setQuestions(p); setErr(""); } } catch {}
                }}
              />
              {err && <div style={{ color: T.red, fontSize: 12, marginTop: 6 }}>{err}</div>}
            </div>

            {questions.length > 0 && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{ fontWeight: 600, color: T.text }}>{questions.length} questions loaded</span>
                  <button onClick={publishQuiz} style={{ background: T.header, border: "none", color: "#fff", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Publish for {quizDate}</button>
                </div>
                {questions.map((q: any, i: number) => (
                  <div key={i} style={{ background: "#fff", border: "1px solid #c8d4e8", borderRadius: 10, padding: 16, marginBottom: 8 }}>
                    {editIdx === i ? (
                      <>
                        <Textarea value={editData.question} onChange={(e: any) => setEditData({ ...editData, question: e.target.value })} style={{ marginBottom: 10 }} />
                        {editData.options.map((opt: string, oi: number) => (
                          <div key={oi} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
                            <button onClick={() => setEditData({ ...editData, answer: oi })} style={{ background: oi===editData.answer ? T.header : "#eef1f5", border: "1px solid "+(oi===editData.answer ? T.header : "#c8d4e8"), color: oi===editData.answer ? "#fff" : T.muted, borderRadius: 6, width: 30, height: 30, cursor: "pointer" }}>{"ABCD"[oi]}</button>
                            <Input value={opt} onChange={(e: any) => { const o=[...editData.options]; o[oi]=e.target.value; setEditData({...editData,options:o}); }} style={{ flex: 1 }} />
                          </div>
                        ))}
                        <Textarea placeholder="Explanation" value={editData.explanation} onChange={(e: any) => setEditData({...editData,explanation:e.target.value})} style={{ marginTop: 8, minHeight: 60 }} />
                        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                          <button onClick={saveEdit} style={{ background: T.header, border: "none", color: "#fff", borderRadius: 8, padding: "8px 18px", fontSize: 13, cursor: "pointer" }}>Save</button>
                          <GhostBtn onClick={() => setEditIdx(null)}>Cancel</GhostBtn>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.5, flex: 1 }}><span style={{ color: T.muted, marginRight: 8, fontSize: 12, fontFamily: "'Carlito',sans-serif" }}>{String(i+1).padStart(2,"0")}</span>{q.question}</div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => startEdit(i)} style={{ background: "#eef1f5", border: "1px solid #c8d4e8", color: T.muted, borderRadius: 6, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>Edit</button>
                            <button onClick={() => deleteQ(i)} style={{ background: T.redDim, border: "1px solid rgba(248,113,113,0.3)", color: T.red, borderRadius: 6, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>Del</button>
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 10 }}>
                          {q.options.map((opt: string, oi: number) => (
                            <div key={oi} style={{ fontSize: 12, color: oi===q.answer ? "#16a34a" : T.muted, display: "flex", gap: 6 }}><span style={{ fontWeight: 700 }}>{"ABCD"[oi]}.</span>{opt}{oi===q.answer && " ✓"}</div>
                          ))}
                        </div>
                        <div style={{ fontSize: 12, color: T.muted, marginTop: 8, fontStyle: "italic", borderTop: "1px solid #eef1f5", paddingTop: 8 }}>{q.explanation}</div>
                      </>
                    )}
                  </div>
                ))}
                <button onClick={publishQuiz} style={{ background: T.header, border: "none", color: "#fff", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", marginTop: 8 }}>Publish Quiz for {quizDate}</button>
              </>
            )}
          </div>
        )}

        {tab === "quizzes" && (
          <div>
            {Object.keys(quizzes).length === 0 && <div style={{ color: T.muted, fontSize: 13 }}>No quizzes yet.</div>}
            {Object.keys(quizzes).sort().reverse().map(date => (
              <div key={date} style={{ background: "#fff", border: "1px solid "+(activeDate===date ? T.header : "#c8d4e8"), borderLeft: "4px solid "+(activeDate===date ? T.header : "#c8d4e8"), borderRadius: 10, padding: 16, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Carlito',sans-serif", fontWeight: 600, fontSize: 14 }}>{date}</span>
                      {activeDate === date && <Tag>ACTIVE</Tag>}
                      {date === today() && <span style={{ fontSize: 9, background: "#eef1f5", color: T.muted, borderRadius: 4, padding: "3px 8px", letterSpacing: 1.5, textTransform: "uppercase" as const, fontFamily: "'Carlito',sans-serif" }}>TODAY</span>}
                    </div>
                    <div style={{ fontSize: 12, color: T.muted }}>{getQuizList(quizzes, date).length} questions{getQuizTopic(quizzes, date) ? " · " + getQuizTopic(quizzes, date) : ""}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {activeDate !== date && <button onClick={() => setActive(date)} style={{ background: "#eef1f5", border: "1px solid #c8d4e8", color: T.text, borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer" }}>Set Active</button>}
                    <button onClick={() => deleteQuiz(date)} style={{ background: T.redDim, border: "1px solid rgba(248,113,113,0.2)", color: T.red, borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer" }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "scores" && (
          <div>
            <div style={{ fontSize: 10, color: T.muted, fontFamily: "'Carlito',sans-serif", letterSpacing: 2, marginBottom: 16 }}>LEADERBOARD — {activeDate || "NO ACTIVE QUIZ"}</div>
            {todayLb.length === 0 && <div style={{ color: T.muted, fontSize: 13 }}>No scores yet.</div>}
            {todayLb.map((e: any, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", border: "1px solid "+(i===0 ? T.header+"40" : "#c8d4e8"), borderLeft: i===0 ? "4px solid "+T.header : "1px solid #c8d4e8", borderRadius: 10, padding: "12px 18px", marginBottom: 8 }}>
                <span style={{ fontSize: 18, width: 28 }}>{medal(i)}</span>
                <span style={{ flex: 1, fontWeight: 600 }}>{e.name}</span>
                <span style={{ fontFamily: "'Carlito',sans-serif", fontWeight: 700, color: T.header }}>{e.score}/{e.total}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {toast && <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: T.header, color: "#fff", borderRadius: 8, padding: "10px 20px", fontSize: 13, zIndex: 100 }}>✓ {toast}</div>}
    </div>
  );
}

function PlayerApp() {
  const [screen, setScreen] = useState("home");
  const [quizzes, setQuizzes] = useState<Record<string, any>>({});
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const data = await api("getActive");
    if (data.quizzes) setQuizzes(data.quizzes);
    if (data.leaderboard) setLeaderboard(data.leaderboard);
    setLoading(false);
  }

  const questions = selectedDate ? getQuizList(quizzes, selectedDate) : [];
  const q = questions[current] || {};
  const pct = questions.length ? score / questions.length : 0;
  const quizDates = Object.keys(quizzes).sort().reverse();
  const quizLb = leaderboard.filter((e: any) => e.date === selectedDate).sort((a: any, b: any) => b.score - a.score);

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
      const entry = { name: playerName.trim(), score, total: questions.length, date: selectedDate };
      await api("saveScore", { entry });
      const filtered = leaderboard.filter((e: any) => !(e.name === entry.name && e.date === selectedDate));
      const updated = [...filtered, entry].sort((a: any, b: any) => b.score - a.score);
      setLeaderboard(updated);
      setScreen("result");
    } else {
      setCurrent(c => c + 1); setSelected(null); setShowFeedback(false);
    }
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{css}</style><Spinner />
    </div>
  );

  const Header = ({ back, onBack }: any) => (
    <div style={{ background: T.header, padding: "0 28px", position: "sticky", top: 0, zIndex: 10 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "13px 0", display: "flex", alignItems: "center", gap: 14 }}>
        {back && <button onClick={onBack} style={{ background: "transparent", border: "none", color: "#4a6a8a", fontSize: 13, cursor: "pointer", fontFamily: "'Carlito',sans-serif" }}>← Back</button>}
        <span style={{ fontFamily: "'Carlito',sans-serif", fontWeight: 700, fontSize: 15, color: "#fff", letterSpacing: 4 }}>AERO<span style={{ color: T.accent }}>QUIZ</span></span>
      </div>
    </div>
  );

  const Wrap = ({ children, maxW = 600, back = false, onBack = () => setScreen("home") }: any) => (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Carlito',sans-serif", color: T.text, display: "flex", flexDirection: "column" }}>
      <style>{css}</style>
      <Header back={back} onBack={onBack} />
      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "28px 48px" }}>
        <div style={{ width: "100%", maxWidth: maxW, animation: "fadeIn 0.3s ease" }}>{children}</div>
      </div>
    </div>
  );

  if (screen === "home") return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Carlito',sans-serif", color: T.text }}>
      <style>{css}</style>

      {/* Hero header */}
      <div style={{ background: T.header, padding: "0 48px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "16px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
            <span style={{ fontFamily: "'Carlito',sans-serif", fontWeight: 700, fontSize: 18, color: "#fff", letterSpacing: 4 }}>AERO<span style={{ color: T.accent }}>QUIZ</span></span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12, color: "#4a6a8a", fontFamily: "'Carlito',sans-serif" }}>ZHAW AVIATION</span>
              <span style={{ fontSize: 24, color: T.accent }}>✈</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 11, color: "#4a6a8a", letterSpacing: 4, fontFamily: "'Carlito',sans-serif", marginBottom: 12 }}>DAILY BRIEFING</div>
              <div style={{ fontSize: 52, fontWeight: 700, color: "#fff", lineHeight: 1.1, marginBottom: 10, whiteSpace: "nowrap" as const }}>Choose your <span style={{ color: T.accent }}>quiz.</span></div>
              <div style={{ fontSize: 15, color: "#4a6a8a", marginBottom: 28 }}>Select a session and compete with your crew.</div>
            </div>
            <div style={{ fontSize: 180, opacity: 0.15, transform: "rotate(-10deg)", lineHeight: 1, marginBottom: 8, flexShrink: 0 }}>✈</div>
          </div>
        </div>
      </div>

      {/* Quiz list */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 48px 40px" }}>
        <div style={{ fontSize: 10, color: T.muted, letterSpacing: 3, fontFamily: "'Carlito',sans-serif", marginBottom: 16 }}>SESSIONS</div>

        {quizDates.length === 0 && (
          <div style={{ background: "#fff", border: "1px solid #c8d4e8", borderRadius: 12, padding: 24, textAlign: "center", color: T.muted, fontSize: 13 }}>No quizzes yet — stand by ✈️</div>
        )}

        {quizDates.map(date => {
          const isToday = date === today();
          const dateLb = leaderboard.filter((e: any) => e.date === date).sort((a: any, b: any) => b.score - a.score);
          const qList = getQuizList(quizzes, date);
          const qTopic = getQuizTopic(quizzes, date);
          return (
            <div key={date} onClick={() => { setSelectedDate(date); setScreen("name"); setErr(""); }}
              style={{ background: "#fff", border: "1px solid #c8d4e8", borderLeft: "4px solid "+(isToday ? T.header : "#c8d4e8"), borderRadius: 10, padding: "18px 20px", marginBottom: 10, cursor: "pointer", animation: "slideIn 0.3s ease", transition: "box-shadow 0.15s" }}
              onMouseOver={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,42,74,0.08)")}
              onMouseOut={e => (e.currentTarget.style.boxShadow = "none")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Carlito',sans-serif", fontWeight: 600, fontSize: 14, color: T.text }}>{date}</span>
                    {isToday && <Tag>TODAY</Tag>}
                  </div>
                  {qTopic && <div style={{ fontSize: 13, color: T.accentMid, fontWeight: 500, marginBottom: 3 }}>{qTopic}</div>}
                  <div style={{ fontSize: 11, color: T.muted }}>{qList.length} questions · {dateLb.length} players</div>
                  {dateLb.slice(0,3).length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginTop: 10 }}>
                      {dateLb.slice(0,3).map((e: any, i: number) => (
                        <div key={i} style={{ background: "#f0f5ff", border: "1px solid #c8d4e8", borderRadius: 20, padding: "3px 10px", fontSize: 11, display: "flex", alignItems: "center", gap: 5 }}>
                          <span>{medal(i)}</span>
                          <span style={{ fontWeight: 600, color: T.text }}>{e.name}</span>
                          <span style={{ color: T.accentMid, fontFamily: "'Carlito',sans-serif", fontSize: 10 }}>{e.score}/{e.total}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span style={{ color: T.subtle, fontSize: 18, marginLeft: 12, flexShrink: 0 }}>→</span>
              </div>
            </div>
          );
        })}

        <GlobalChat playerName={playerName} />

        <div style={{ textAlign: "center", marginTop: 32, fontSize: 12, color: T.muted }}>
          made with ✈️ — <span style={{ color: T.header, fontWeight: 600 }}>by Sarah</span> 🫶
        </div>
      </div>
    </div>
  );

  if (screen === "name") return (
    <Wrap back onBack={() => setScreen("home")}>
      <div style={{ fontFamily: "'Carlito',sans-serif", fontSize: 10, color: T.muted, letterSpacing: 4, marginBottom: 16 }}>QUIZ — {selectedDate}</div>
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Enter your callsign</div>
      <div style={{ color: T.muted, fontSize: 13, marginBottom: 20 }}>{questions.length} questions · your score will appear on the leaderboard.</div>
      {quizLb.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #c8d4e8", borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: T.muted, fontFamily: "'Carlito',sans-serif", letterSpacing: 2, marginBottom: 10 }}>CURRENT LEADERBOARD</div>
          {quizLb.slice(0,5).map((e: any, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 16, width: 24 }}>{medal(i)}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{e.name}</span>
              <span style={{ fontFamily: "'Carlito',sans-serif", fontSize: 13, color: T.header }}>{e.score}/{e.total}</span>
            </div>
          ))}
        </div>
      )}
      <Input placeholder="e.g. Maverick" value={playerName} onChange={(e: any) => setPlayerName(e.target.value)} onKeyDown={(e: any) => e.key === "Enter" && startQuiz()} autoFocus />
      {err && <div style={{ color: T.red, fontSize: 12, marginTop: 8 }}>{err}</div>}
      <PrimaryBtn onClick={startQuiz} style={{ marginTop: 16 }}>Confirm & Start →</PrimaryBtn>
    </Wrap>
  );

  if (screen === "quiz") return (
    <Wrap maxW={640} back onBack={() => setScreen("name")}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: "'Carlito',sans-serif", fontSize: 11, color: T.muted }}>{String(current+1).padStart(2,"0")} / {String(questions.length).padStart(2,"0")}</span>
        <span style={{ fontFamily: "'Carlito',sans-serif", fontSize: 13, color: T.header, fontWeight: 700 }}>⭐ {score} PTS</span>
      </div>
      <div style={{ height: 4, background: "#dde8f5", borderRadius: 99, marginBottom: 24, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(current/questions.length)*100}%`, background: T.header, borderRadius: 99, transition: "width 0.5s ease" }} />
      </div>
      <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.65, marginBottom: 20, color: T.text }}>{q.question}</div>
      {q.options?.map((opt: string, i: number) => {
        const isCorrect = i === q.answer, isChosen = i === selected;
        let bg = "#fff", border = "#c8d4e8", color = T.text;
        if (showFeedback) {
          if (isCorrect) { bg = "#f0fdf4"; border = "#86efac"; }
          else if (isChosen) { bg = "#fef2f2"; border = "#fca5a5"; }
        }
        return (
          <button key={i} onClick={() => handleAnswer(i)}
            style={{ width: "100%", textAlign: "left", background: bg, border: "1px solid "+border, borderRadius: 10, padding: "13px 16px", color, fontSize: 14, cursor: showFeedback ? "default" : "pointer", marginBottom: 8, display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s", fontFamily: "'Carlito',sans-serif" }}>
            <span style={{ fontFamily: "'Carlito',sans-serif", fontSize: 11, fontWeight: 700, color: showFeedback ? isCorrect ? "#16a34a" : isChosen ? T.red : T.subtle : T.subtle, minWidth: 20 }}>{"ABCD"[i]}</span>
            <span style={{ lineHeight: 1.5 }}>{opt}</span>
            {showFeedback && isCorrect && <span style={{ marginLeft: "auto", color: "#16a34a" }}>✓</span>}
            {showFeedback && isChosen && !isCorrect && <span style={{ marginLeft: "auto", color: T.red }}>✗</span>}
          </button>
        );
      })}
      {showFeedback && (
        <div style={{ background: "#f0f5ff", border: "1px solid #c8d4e8", borderRadius: 10, padding: "14px 16px", marginTop: 8 }}>
          <div style={{ fontSize: 10, fontFamily: "'Carlito',sans-serif", color: T.accentMid, letterSpacing: 2, marginBottom: 6 }}>DEBRIEF</div>
          <div style={{ color: "#4a6a8a", fontSize: 13, lineHeight: 1.6 }}>{q.explanation}</div>
          <PrimaryBtn onClick={next} style={{ marginTop: 14 }}>{current+1 < questions.length ? "Next question →" : "See results →"}</PrimaryBtn>
        </div>
      )}
    </Wrap>
  );

  if (screen === "result") return (
    <Wrap back onBack={() => setScreen("home")}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{pct>=0.8?"🎯":pct>=0.5?"📋":"📚"}</div>
        <div style={{ fontFamily: "'Carlito',sans-serif", fontSize: 10, color: T.muted, letterSpacing: 4, marginBottom: 8 }}>MISSION DEBRIEF — {selectedDate}</div>
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{playerName}</div>
        <div style={{ fontSize: 52, fontWeight: 800, fontFamily: "'Carlito',sans-serif", color: pct>=0.8?"#16a34a":pct>=0.5?T.amber:T.red }}>{score}<span style={{ fontSize: 22, color: T.muted }}>/{questions.length}</span></div>
        <div style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>{pct>=0.8?"Outstanding. Cleared for departure. ✈️":pct>=0.5?"Passing grade. More study recommended.":"Below minimums. Additional training required."}</div>
      </div>
      <div style={{ height: 6, background: "#dde8f5", borderRadius: 99, marginBottom: 24, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct*100}%`, background: pct>=0.8?"#16a34a":pct>=0.5?T.amber:T.red, borderRadius: 99 }} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontFamily: "'Carlito',sans-serif", color: T.muted, letterSpacing: 2, marginBottom: 12 }}>LEADERBOARD</div>
        {quizLb.slice(0,5).map((e: any, i: number) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: e.name===playerName ? "#f0f5ff" : "#fff", border: "1px solid "+(e.name===playerName ? T.header+"30" : "#c8d4e8"), borderLeft: e.name===playerName ? "4px solid "+T.header : "1px solid #c8d4e8", borderRadius: 10, padding: "10px 16px", marginBottom: 6 }}>
            <span style={{ fontSize: 16, width: 24 }}>{medal(i)}</span>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{e.name}</span>
            <span style={{ fontFamily: "'Carlito',sans-serif", fontSize: 13, color: T.header }}>{e.score}/{e.total}</span>
          </div>
        ))}
      </div>
      <PrimaryBtn onClick={() => setScreen("home")}>← Back to all quizzes</PrimaryBtn>
      <div style={{ marginTop: 16 }}>
        <GlobalChat playerName={playerName} />
      </div>
    </Wrap>
  );

  return null;
}

export default function Page() {
  const [admin, setAdmin] = useState(false);
  const [authed, setAuthed] = useState(false);
  useEffect(() => { setAdmin(isAdmin()); }, []);
  if (admin && !authed) return <AdminLogin onLogin={() => setAuthed(true)} />;
  return admin ? <AdminPanel /> : <PlayerApp />;
}
