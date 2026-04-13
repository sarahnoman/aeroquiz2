'use client';
import { useState, useEffect, useRef } from 'react';
const isAdmin = () => typeof window !== 'undefined' && window.location.search.includes('admin=true');
const today = () => new Date().toISOString().split('T')[0];
const medal = (i: number) => [' ',' ',' '][i] ?? `${i+1}.`;
const T = {
bg: '#080c14', panel: 'rgba(12,20,36,0.95)', panelBorder: 'rgba(56,189,248,0.12)',
accent: '#38bdf8', accentDim: 'rgba(56,189,248,0.12)', green: '#4ade80',
greenDim: 'rgba(74,222,128,0.12)', red: '#f87171', redDim: 'rgba(248,113,113,0.12)',
amber: '#fbbf24', text: '#e2e8f0', muted: 'rgba(148,163,184,0.7)',
subtle: 'rgba(148,163,184,0.25)',
};
const css = `
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translate
*{box-sizing:border-box;}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-thumb{background:rgba(56,189,248,0.3);border-radius:99px}
::placeholder{color:rgba(148,163,184,0.35)}
`;
const Spinner = () => (
<div style={{ width: 32, height: 32, border: '2px solid rgba(56,189,248,0.12)', borderTop:
);
const Tag = ({ children, color = '#38bdf8' }: any) => (
<span style={{ fontSize: 10, fontFamily: 'monospace', background: color+'18', border: '1px
);
const PrimaryBtn = ({ children, onClick, style = {} }: any) => (
<button onClick={onClick} style={{ background: 'linear-gradient(135deg,rgba(56,189,248,0.2)
);
const GhostBtn = ({ children, onClick, style = {} }: any) => (
<button onClick={onClick} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid
);
const Input = ({ style = {}, ...props }: any) => (
<input style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgb
);
const Textarea = ({ style = {}, ...props }: any) => (
<textarea style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid
);
async function api(action: string, body?: any) {
if (body) {
const res = await fetch('/api/quiz', { method: 'POST', headers: { 'Content-Type': 'applic
return res.json();
}
const res = await fetch('/api/quiz?action=' + action);
return res.json();
}
function timeAgo(iso: string) {
const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
if (diff < 60) return 'just now';
if (diff < 3600) return Math.floor(diff/60) + 'm ago';
if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
return Math.floor(diff/86400) + 'd ago';
}
function GlobalChat({ playerName }: { playerName: string }) {
const [messages, setMessages] = useState<any[]>([]);
const [text, setText] = useState('');
const [name, setName] = useState(playerName || '');
const [sending, setSending] = useState(false);
const bottomRef = useRef<HTMLDivElement>(null);
useEffect(() => { loadMessages(); const t = setInterval(loadMessages, 8000); return () => c
useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages])
async function loadMessages() {
const data = await api('getActive');
if (data.messages) setMessages(data.messages);
}
async function send() {
if (!text.trim() || !name.trim() || sending) return;
setSending(true);
await api('saveMessage', { name: name.trim(), text: text.trim() });
setText('');
await loadMessages();
setSending(false);
}
return (
<div style={{ background: T.panel, border: '1px solid rgba(56,189,248,0.12)', borderRadiu
<div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(56,189,248,0.08)', di
<span style={{ fontSize: 16 }}> </span>
<span style={{ fontFamily: 'monospace', fontSize: 12, color: T.accent, letterSpacing:
<span style={{ fontSize: 11, color: T.muted, marginLeft: 'auto' }}>Discuss quizzes, a
</div>
<div style={{ height: 300, overflowY: 'auto', padding: '14px 18px', display: 'flex', fl
{messages.length === 0 && (
<div style={{ color: T.muted, fontSize: 13, textAlign: 'center', marginTop: 80 }}>N
)}
{messages.map((m: any, i: number) => (
<div key={i} style={{ display: 'flex', gap: 10 }}>
<div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(56,18
{m.name[0].toUpperCase()}
</div>
<div style={{ flex: 1 }}>
<div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3
<span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{m.name}</span
<span style={{ fontSize: 11, color: T.muted }}>{timeAgo(m.time)}</span>
</div>
<div style={{ fontSize: 14, color: T.muted, lineHeight: 1.5 }}>{m.text}</div>
</div>
</div>
))}
<div ref={bottomRef} />
</div>
<div style={{ padding: '12px 18px', borderTop: '1px solid rgba(56,189,248,0.08)', displ
{!playerName && (
<Input placeholder='Your callsign' value={name} onChange={(e: any) => setName(e.tar
)}
rgba(5
<div style={{ display: 'flex', gap: 8 }}>
<input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key =
placeholder='Ask a question or share a thought…'
style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid <button onClick={send} disabled={sending || !text.trim() || !name.trim()}
style={{ background: text.trim() && name.trim() ? 'linear-gradient(135deg,rgba(56
{sending ? '...' : '↑'}
</button>
</div>
</div>
</div>
);
}
function AdminPanel() {
const [tab, setTab] = useState('generate');
const [quizzes, setQuizzes] = useState<Record<string, any[]>>({});
const [questions, setQuestions] = useState<any[]>([]);
const [editIdx, setEditIdx] = useState<number | null>(null);
const [editData, setEditData] = useState<any>(null);
const [numQ, setNumQ] = useState(20);
const [quizDate, setQuizDate] = useState(today());
const [err, setErr] = useState('');
const [toast, setToast] = useState('');
const [activeDate, setActiveDate] = useState<string | null>(null);
const [leaderboard, setLeaderboard] = useState<any[]>([]);
useEffect(() => { loadData(); }, []);
async function loadData() {
const data = await api('getActive');
if (data.quizzes) setQuizzes(data.quizzes);
if (data.date) setActiveDate(data.date);
if (data.leaderboard) setLeaderboard(data.leaderboard);
}
const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); }
function startEdit(i: number) { setEditIdx(i); setEditData({ ...questions[i], options: [...
function saveEdit() { const u = [...questions]; u[editIdx!] = editData; setQuestions(u); se
function deleteQ(i: number) { setQuestions(q => q.filter((_: any, j: number) => j !== i));
async function publishQuiz() {
if (!questions.length) { setErr('No questions to publish.'); return; }
await api('saveQuiz', { date: quizDate, questions });
const updated = { ...quizzes, [quizDate]: questions };
setQuizzes(updated); setActiveDate(quizDate); setQuestions([]);
showToast('Quiz published for ' + quizDate); setTab('quizzes');
}
async function setActive(date: string) { await api('setActive', { date }); setActiveDate(da
async function deleteQuiz(date: string) {
await api('deleteQuiz', { date });
const updated = { ...quizzes }; delete updated[date]; setQuizzes(updated);
if (activeDate === date) setActiveDate(null);
showToast('Quiz deleted');
}
const todayLb = leaderboard.filter((e: any) => e.date === activeDate).sort((a: any, b: any)
return (
<div style={{ minHeight: '100vh', background: T.bg, fontFamily: 'Inter,sans-serif', color
<style>{css}</style>
<div style={{ borderBottom: '1px solid rgba(56,189,248,0.12)', padding: '14px 32px', di
<div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 15, color: T.accent
<Tag color='#f87171'>ADMIN</Tag>
<div style={{ flex: 1 }} />
<div style={{ fontSize: 11, fontFamily: 'monospace', color: T.muted }}>{new Date().to
</div>
<div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginB
{[
{ label: 'Total Quizzes', value: Object.keys(quizzes).length, accent: T.accent },
{ label: 'Active Quiz', value: activeDate || 'none', accent: activeDate ? T.green
{ label: 'Players Today', value: todayLb.length, accent: T.accent },
{ label: 'Top Score', value: todayLb[0] ? todayLb[0].score+'/'+todayLb[0].total :
].map((s, i) => (
<div key={i} style={{ background: T.panel, border: '1px solid rgba(56,189,248,0.1
<div style={{ fontSize: 9, color: T.muted, fontFamily: 'monospace', letterSpaci
<div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace', color: s.
</div>
))}
</div>
<div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
{[['generate','+ New Quiz'],['quizzes','All Quizzes'],['scores','Live Scores']].map
<button key={id} onClick={() => setTab(id)} style={{ background: tab===id ? T.acc
))}
</div>
{tab === 'generate' && (
<div>
<div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, marginBo
<div style={{ background: T.panel, border: '1px solid rgba(56,189,248,0.12)', b
<div style={{ fontSize: 11, color: T.muted, fontFamily: 'monospace', letterSp
<Input type='date' value={quizDate} onChange={(e: any) => setQuizDate(e.targe
</div>
<div style={{ background: T.panel, border: '1px solid rgba(56,189,248,0.12)', b
<div style={{ fontSize: 11, color: T.muted, fontFamily: 'monospace', letterSp
<div style={{ display: 'flex', gap: 8 }}>
{[10,15,20].map(n => (
<button key={n} onClick={() => setNumQ(n)} style={{ background: numQ===n
))}
</div>
</div>
</div>
<div style={{ background: T.panel, border: '1px solid rgba(56,189,248,0.12)', bor
<div style={{ fontSize: 11, color: T.muted, fontFamily: 'monospace', letterSpac
<Textarea placeholder='Paste JSON array here' style={{ minHeight: 140 }}
onChange={(e: any) => {
try { const p = JSON.parse(e.target.value); if (Array.isArray(p) && p.lengt
}}
/>
{err && <div style={{ color: T.red, fontSize: 12, marginTop: 6 }}>{err}</div>}
</div>
{questions.length > 0 && (
<>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: '
<span style={{ fontWeight: 700 }}>{questions.length} questions loaded</span
<button onClick={publishQuiz} style={{ background: T.greenDim, border: '1px
</div>
{questions.map((q: any, i: number) => (
<div key={i} style={{ background: T.panel, border: '1px solid rgba(56,189,2
{editIdx === i ? (
<>
<Textarea value={editData.question} onChange={(e: any) => setEditData
{editData.options.map((opt: string, oi: number) => (
<div key={oi} style={{ display: 'flex', gap: 8, marginBottom: 6, al
<button onClick={() => setEditData({ ...editData, answer: oi })}
<Input value={opt} onChange={(e: any) => { const o=[...editData.o
</div>
))}
<Textarea placeholder='Explanation' value={editData.explanation} onCh
<div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
<button onClick={saveEdit} style={{ background: T.greenDim, border:
<GhostBtn onClick={() => setEditIdx(null)}>Cancel</GhostBtn>
</div>
</>
) : (
<>
<div style={{ display: 'flex', justifyContent: 'space-between', gap:
<div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.5, flex:
<div style={{ display: 'flex', gap: 6 }}>
<button onClick={() => startEdit(i)} style={{ background: 'transp
<button onClick={() => deleteQ(i)} style={{ background: T.redDim,
</div>
</div>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', {q.options.map((opt: string, oi: number) => (
<div key={oi} style={{ fontSize: 12, color: oi===q.answer ? T.gre
))}
</div>
gap: 6
<div style={{ fontSize: 12, color: T.muted, marginTop: 8, fontStyle:
</>
)}
</div>
))}
</>
<button onClick={publishQuiz} style={{ background: T.greenDim, border: '1px s
)}
</div>
)}
{tab === 'quizzes' && (
<div>
{Object.keys(quizzes).length === 0 && <div style={{ color: T.muted, fontSize: 13
{Object.keys(quizzes).sort().reverse().map(date => (
<div key={date} style={{ background: T.panel, border: '1px solid '+(activeDate=
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: '
<div>
<div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBotto
<span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 15 }
{activeDate === date && <Tag color={T.green}>ACTIVE</Tag>}
{date === today() && <Tag color={T.accent}>TODAY</Tag>}
</div>
<div style={{ fontSize: 12, color: T.muted }}>{quizzes[date].length} ques
</div>
<div style={{ display: 'flex', gap: 8 }}>
{activeDate !== date && <button onClick={() => setActive(date)} style={{
<button onClick={() => deleteQuiz(date)} style={{ background: T.redDim, b
</div>
</div>
</div>
))}
</div>
)}
{tab === 'scores' && (
<div>
<div style={{ fontSize: 11, color: T.muted, fontFamily: 'monospace', letterSpacin
{todayLb.length === 0 && <div style={{ color: T.muted, fontSize: 13 }}>No scores
{todayLb.map((e: any, i: number) => (
<div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, backgroun
<span style={{ fontSize: 18, width: 28 }}>{medal(i)}</span>
<span style={{ flex: 1, fontWeight: 600 }}>{e.name}</span>
<span style={{ fontFamily: 'monospace', fontWeight: 700, color: T.accent }}>{
</div>
))}
</div>
)}
</div>
</div>
{toast && <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'transla
);
}
function PlayerApp() {
const [screen, setScreen] = useState('home');
const [quizzes, setQuizzes] = useState<Record<string, any[]>>({});
const [leaderboard, setLeaderboard] = useState<any[]>([]);
const [selectedDate, setSelectedDate] = useState<string | null>(null);
const [playerName, setPlayerName] = useState('');
const [current, setCurrent] = useState(0);
const [score, setScore] = useState(0);
const [selected, setSelected] = useState<number | null>(null);
const [showFeedback, setShowFeedback] = useState(false);
const [err, setErr] = useState('');
const [loading, setLoading] = useState(true);
useEffect(() => { loadAll(); }, []);
async function loadAll() {
setLoading(true);
const data = await api('getActive');
if (data.quizzes) setQuizzes(data.quizzes);
if (data.leaderboard) setLeaderboard(data.leaderboard);
setLoading(false);
}
const questions = selectedDate ? (quizzes[selectedDate] || []) : [];
const q = questions[current] || {};
const pct = questions.length ? score / questions.length : 0;
const quizDates = Object.keys(quizzes).sort().reverse();
const quizLb = leaderboard.filter((e: any) => e.date === selectedDate).sort((a: any, b: any
function startQuiz() {
if (!playerName.trim()) { setErr('Callsign required.'); return; }
setErr(''); setCurrent(0); setScore(0); setSelected(null); setShowFeedback(false); setScr
}
function handleAnswer(idx: number) {
if (showFeedback) return;
setSelected(idx); setShowFeedback(true);
if (idx === questions[current].answer) setScore(s => s + 1);
}
async function next() {
const isLast = current + 1 >= questions.length;
if (isLast) {
const entry = { name: playerName.trim(), score, total: questions.length, date: selected
await api('saveScore', { entry });
const filtered = leaderboard.filter((e: any) => !(e.name === entry.name && e.date === s
const updated = [...filtered, entry].sort((a: any, b: any) => b.score - a.score);
setLeaderboard(updated);
setScreen('result');
} else {
setCurrent(c => c + 1); setSelected(null); setShowFeedback(false);
}
}
if (loading) return (
<div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center'
<style>{css}</style><Spinner />
</div>
);
const Nav = ({ back, onBack }: any) => (
<div style={{ borderBottom: '1px solid rgba(56,189,248,0.12)', padding: '13px 28px', disp
{back && <button onClick={onBack} style={{ background: 'transparent', border: 'none', c
<span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: T.accent,
</div>
);
const Wrap = ({ children, maxW = 600, back = false, onBack = () => setScreen('home') }: any
<div style={{ minHeight: '100vh', background: T.bg, fontFamily: 'Inter,sans-serif', color
<style>{css}</style>
<Nav back={back} onBack={onBack} />
<div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'cent
<div style={{ width: '100%', maxWidth: maxW, animation: 'fadeIn 0.35s ease' }}>{child
</div>
</div>
);
if (screen === 'home') return (
<Wrap maxW={680}>
<div style={{ marginBottom: 28 }}>
<div style={{ fontFamily: 'monospace', fontSize: 11, color: T.accent, letterSpacing:
<div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Choose your quiz</div
<div style={{ color: T.muted, fontSize: 14 }}>Select a session and compete with your
</div>
{quizDates.length === 0 && (
<div style={{ background: T.panel, border: '1px solid rgba(56,189,248,0.12)', borderR
)}
{quizDates.map(date => {
const isToday = date === today();
const dateLb = leaderboard.filter((e: any) => e.date === date).sort((a: any, b: any)
return (
<div key={date} onClick={() => { setSelectedDate(date); setScreen('name'); setErr('
style={{ background: T.panel, border: '1px solid '+(isToday ? T.accent : T.panelB
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex
<div>
<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4
<span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16 }}>{d
{isToday && <Tag color={T.accent}>TODAY</Tag>}
</div>
<div style={{ fontSize: 12, color: T.muted }}>{quizzes[date].length} question
</div>
<span style={{ color: T.accent, fontSize: 18 }}>→</span>
</div>
{dateLb.slice(0,3).length > 0 && (
<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
{dateLb.slice(0,3).map((e: any, i: number) => (
<div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8
<span>{medal(i)}</span><span style={{ fontWeight: 600 }}>{e.name}</span><
</div>
))}
</div>
)}
</div>
);
})}
</Wrap>
<GlobalChat playerName={playerName} />
);
if (screen === 'name') return (
<Wrap back onBack={() => setScreen('home')}>
<div style={{ fontFamily: 'monospace', fontSize: 11, color: T.accent, letterSpacing: 4,
<div style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Enter your callsign</di
<div style={{ color: T.muted, fontSize: 13, marginBottom: 20 }}>{questions.length} ques
{quizLb.length > 0 && (
<div style={{ background: T.panel, border: '1px solid rgba(56,189,248,0.12)', borderR
<div style={{ fontSize: 11, color: T.muted, fontFamily: 'monospace', letterSpacing:
{quizLb.slice(0,5).map((e: any, i: number) => (
<div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBotto
<span style={{ fontSize: 16, width: 24 }}>{medal(i)}</span>
<span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{e.name}</span>
<span style={{ fontFamily: 'monospace', fontSize: 13, color: T.accent }}>{e.sco
</div>
))}
</div>
)}
</Wrap>
<Input placeholder='e.g. Maverick' value={playerName} onChange={(e: any) => setPlayerNa
{err && <div style={{ color: T.red, fontSize: 12, marginTop: 8 }}>{err}</div>}
<PrimaryBtn onClick={startQuiz} style={{ marginTop: 16 }}>CONFIRM & START →</PrimaryBtn
);
if (screen === 'quiz') return (
<Wrap maxW={640} back onBack={() => setScreen('name')}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', m
<span style={{ fontFamily: 'monospace', fontSize: 11, color: T.muted }}>{String(curre
<span style={{ fontFamily: 'monospace', fontSize: 13, color: T.accent, fontWeight: 70
margin
</div>
<div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, <div style={{ height: '100%', width: `${(current/questions.length)*100}%`, background
</div>
<div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.65, marginBottom: 20 }}>{q.q
{q.options?.map((opt: string, i: number) => {
const isCorrect = i === q.answer, isChosen = i === selected;
return (
<button key={i} onClick={() => handleAnswer(i)} style={{ width: '100%', textAlign:
<span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: sho
<span style={{ lineHeight: 1.5 }}>{opt}</span>
{showFeedback && isCorrect && <span style={{ marginLeft: 'auto', color: T.green }
{showFeedback && isChosen && !isCorrect && <span style={{ marginLeft: 'auto', col
</button>
);
})}
{showFeedback && (
<div style={{ background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248
<div style={{ fontSize: 12, fontFamily: 'monospace', color: T.accent, letterSpacing
<div style={{ color: T.muted, fontSize: 13, lineHeight: 1.6 }}>{q.explanation}</div
<PrimaryBtn onClick={next} style={{ marginTop: 14 }}>{current+1 < questions.length
</div>
)}
</Wrap>
);
if (screen === 'result') return (
<Wrap back onBack={() => setScreen('home')}>
<div style={{ textAlign: 'center', marginBottom: 24 }}>
<div style={{ fontSize: 52, marginBottom: 8 }}>{pct>=0.8?' ':pct>=0.5?' ':' '}</d
<div style={{ fontFamily: 'monospace', fontSize: 11, color: T.accent, letterSpacing:
<div style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{playerName}</div>
<div style={{ fontSize: 52, fontWeight: 800, fontFamily: 'monospace', color: pct>=0.8
<div style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>{pct>=0.8?'Outstanding. C
</div>
<div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, <div style={{ height: '100%', width: `${pct*100}%`, background: pct>=0.8?T.green:pct>
</div>
<div style={{ marginBottom: 20 }}>
<div style={{ fontSize: 11, fontFamily: 'monospace', color: T.muted, letterSpacing: 2
{quizLb.slice(0,5).map((e: any, i: number) => (
<div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: e
<span style={{ fontSize: 16, width: 24 }}>{medal(i)}</span>
<span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{e.name}</span>
margin
<span style={{ fontFamily: 'monospace', fontSize: 13, color: T.accent }}>{e.score
</div>
))}
</div>
<PrimaryBtn onClick={() => setScreen('home')}>← BACK TO ALL QUIZZES</PrimaryBtn>
<div style={{ marginTop: 16 }}>
<GlobalChat playerName={playerName} />
</div>
</Wrap>
);
return null;
}
export default function Page() {
const [admin, setAdmin] = useState(false);
useEffect(() => { setAdmin(isAdmin()); }, []);
return admin ? <AdminPanel /> : <PlayerApp />;
}
