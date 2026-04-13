‘use client’;
import { useState, useEffect, useRef } from ‘react’;

const isAdmin = () => {
if (typeof window === ‘undefined’) return false;
return window.location.search.includes(‘admin=true’);
};
const today = () => new Date().toISOString().split(‘T’)[0];
const medal = (i: number) => {
if (i === 0) return ‘🥇’;
if (i === 1) return ‘🥈’;
if (i === 2) return ‘🥉’;
return String(i + 1) + ‘.’;
};

const bg = ‘#080c14’;
const panel = ‘rgba(12,20,36,0.95)’;
const panelBorder = ‘rgba(56,189,248,0.12)’;
const accent = ‘#38bdf8’;
const accentDim = ‘rgba(56,189,248,0.12)’;
const green = ‘#4ade80’;
const greenDim = ‘rgba(74,222,128,0.12)’;
const red = ‘#f87171’;
const redDim = ‘rgba(248,113,113,0.12)’;
const amber = ‘#fbbf24’;
const textCol = ‘#e2e8f0’;
const muted = ‘rgba(148,163,184,0.7)’;
const subtle = ‘rgba(148,163,184,0.25)’;

const css = [
‘@keyframes spin{to{transform:rotate(360deg)}}’,
‘@keyframes fadeIn{from{opacity:0}to{opacity:1}}’,
‘*{box-sizing:border-box;}’,
‘::-webkit-scrollbar{width:4px}’,
‘::-webkit-scrollbar-thumb{background:rgba(56,189,248,0.3);border-radius:99px}’,
‘::placeholder{color:rgba(148,163,184,0.35)}’,
].join(’ ’);

const Spinner = () => (

  <div style={{
    width: 32, height: 32,
    border: '2px solid rgba(56,189,248,0.12)',
    borderTop: '2px solid #38bdf8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '16px auto',
  }} />
);

const Tag = ({ children, color = ‘#38bdf8’ }: any) => (
<span style={{
fontSize: 10,
fontFamily: ‘monospace’,
background: color + ‘18’,
border: ’1px solid ’ + color + ‘40’,
color,
borderRadius: 4,
padding: ‘3px 8px’,
letterSpacing: 1,
textTransform: ‘uppercase’ as const,
}}>{children}</span>
);

const PrimaryBtn = ({ children, onClick, style = {} }: any) => (
<button onClick={onClick} style={{
background: ‘rgba(56,189,248,0.15)’,
border: ‘1px solid #38bdf8’,
color: ‘#38bdf8’,
borderRadius: 8,
padding: ‘12px 24px’,
fontSize: 14,
fontWeight: 700,
cursor: ‘pointer’,
fontFamily: ‘Inter,sans-serif’,
width: ‘100%’,
…style,
}}>{children}</button>
);

const GhostBtn = ({ children, onClick, style = {} }: any) => (
<button onClick={onClick} style={{
background: ‘rgba(255,255,255,0.04)’,
border: ‘1px solid rgba(56,189,248,0.12)’,
color: textCol,
borderRadius: 8,
padding: ‘10px 20px’,
fontSize: 13,
cursor: ‘pointer’,
fontFamily: ‘Inter,sans-serif’,
…style,
}}>{children}</button>
);

const Input = ({ style = {}, …props }: any) => (
<input style={{
width: ‘100%’,
background: ‘rgba(255,255,255,0.03)’,
border: ‘1px solid rgba(56,189,248,0.12)’,
borderRadius: 8,
padding: ‘11px 14px’,
color: textCol,
fontSize: 14,
outline: ‘none’,
fontFamily: ‘Inter,sans-serif’,
…style,
}} {…props} />
);

const Textarea = ({ style = {}, …props }: any) => (

  <textarea style={{
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(56,189,248,0.12)',
    borderRadius: 8,
    padding: '11px 14px',
    color: textCol,
    fontSize: 13,
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: 90,
    fontFamily: 'Inter,sans-serif',
    ...style,
  }} {...props} />
);

async function api(action: string, body?: any) {
  if (body) {
    const res = await fetch('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...body }),
    });
    return res.json();
  }
  const res = await fetch('/api/quiz?action=' + action);
  return res.json();
}

function timeAgo(iso: string) {
  const diff = Math.floor(
    (Date.now() - new Date(iso).getTime()) / 1000
  );
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

function GlobalChat({ playerName }: { playerName: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [name, setName] = useState(playerName || '');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    const t = setInterval(loadMessages, 8000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
    <div style={{
      background: panel,
      border: '1px solid rgba(56,189,248,0.12)',
      borderRadius: 16,
      overflow: 'hidden',
      marginTop: 32,
    }}>
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid rgba(56,189,248,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <span>💬</span>
        <span style={{
          fontFamily: 'monospace',
          fontSize: 12,
          color: accent,
          letterSpacing: 2,
        }}>CREW CHAT</span>
        <span style={{
          fontSize: 11,
          color: muted,
          marginLeft: 'auto',
        }}>Discuss quizzes, ask questions</span>
      </div>

      <div style={{
        height: 300,
        overflowY: 'auto',
        padding: '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        {messages.length === 0 && (
          <div style={{
            color: muted,
            fontSize: 13,
            textAlign: 'center',
            marginTop: 80,
          }}>No messages yet. Start the discussion!</div>
        )}
        {messages.map((m: any, i: number) => (
          <div key={i} style={{ display: 'flex', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(56,189,248,0.15)',
              border: '1px solid rgba(56,189,248,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              color: accent,
              flexShrink: 0,
              fontFamily: 'monospace',
            }}>
              {m.name[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
                marginBottom: 3,
              }}>
                <span style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: textCol,
                }}>{m.name}</span>
                <span style={{
                  fontSize: 11,
                  color: muted,
                }}>{timeAgo(m.time)}</span>
              </div>
              <div style={{
                fontSize: 14,
                color: muted,
                lineHeight: 1.5,
              }}>{m.text}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{
        padding: '12px 18px',
        borderTop: '1px solid rgba(56,189,248,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        {!playerName && (
          <Input
            placeholder='Your callsign'
            value={name}
            onChange={(e: any) => setName(e.target.value)}
            style={{ fontSize: 13 }}
          />
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') send();
            }}
            placeholder='Ask a question...'
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(56,189,248,0.15)',
              borderRadius: 8,
              padding: '10px 14px',
              color: textCol,
              fontSize: 14,
              outline: 'none',
              fontFamily: 'Inter,sans-serif',
            }}
          />
          <button
            onClick={send}
            disabled={sending || !text.trim() || !name.trim()}
            style={{
              background: 'rgba(56,189,248,0.15)',
              border: '1px solid #38bdf8',
              color: accent,
              borderRadius: 8,
              padding: '10px 18px',
              fontSize: 14,
              cursor: 'pointer',
              fontWeight: 700,
            }}>
            {sending ? '...' : 'Send'}
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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  function startEdit(i: number) {
    setEditIdx(i);
    setEditData({
      ...questions[i],
      options: [...questions[i].options],
    });
  }

  function saveEdit() {
    const u = [...questions];
    u[editIdx!] = editData;
    setQuestions(u);
    setEditIdx(null);
  }

  function deleteQ(i: number) {
    setQuestions(q => q.filter((_: any, j: number) => j !== i));
  }

  async function publishQuiz() {
    if (!questions.length) {
      setErr('No questions to publish.');
      return;
    }
    await api('saveQuiz', { date: quizDate, questions });
    const updated = { ...quizzes, [quizDate]: questions };
    setQuizzes(updated);
    setActiveDate(quizDate);
    setQuestions([]);
    showToast('Quiz published for ' + quizDate);
    setTab('quizzes');
  }

  async function setActive(date: string) {
    await api('setActive', { date });
    setActiveDate(date);
    showToast('Active quiz set to ' + date);
  }

  async function deleteQuiz(date: string) {
    await api('deleteQuiz', { date });
    const updated = { ...quizzes };
    delete updated[date];
    setQuizzes(updated);
    if (activeDate === date) setActiveDate(null);
    showToast('Quiz deleted');
  }

  const todayLb = leaderboard
    .filter((e: any) => e.date === activeDate)
    .sort((a: any, b: any) => b.score - a.score);

  return (
    <div style={{
      minHeight: '100vh',
      background: bg,
      fontFamily: 'Inter,sans-serif',
      color: textCol,
    }}>
      <style>{css}</style>

```
  <div style={{
    borderBottom: '1px solid rgba(56,189,248,0.12)',
    padding: '14px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    background: 'rgba(8,12,20,0.95)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  }}>
    <div style={{
      fontFamily: 'monospace',
      fontWeight: 600,
      fontSize: 15,
      color: accent,
      letterSpacing: 2,
    }}>AEROQUIZ</div>
    <Tag color='#f87171'>ADMIN</Tag>
    <div style={{ flex: 1 }} />
    <div style={{
      fontSize: 11,
      fontFamily: 'monospace',
      color: muted,
    }}>{new Date().toUTCString().replace(' GMT', ' UTC')}</div>
  </div>

  <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 16,
      marginBottom: 32,
    }}>
      {[
        { label: 'Total Quizzes', value: Object.keys(quizzes).length, ac: accent },
        { label: 'Active Quiz', value: activeDate || 'none', ac: activeDate ? green : muted },
        { label: 'Players Today', value: todayLb.length, ac: accent },
        { label: 'Top Score', value: todayLb[0] ? todayLb[0].score + '/' + todayLb[0].total : 'none', ac: accent },
      ].map((s, i) => (
        <div key={i} style={{
          background: panel,
          border: '1px solid rgba(56,189,248,0.12)',
          borderRadius: 12,
          padding: 16,
        }}>
          <div style={{
            fontSize: 9,
            color: muted,
            fontFamily: 'monospace',
            letterSpacing: 2,
            textTransform: 'uppercase' as const,
            marginBottom: 2,
          }}>{s.label}</div>
          <div style={{
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'monospace',
            color: s.ac,
          }}>{s.value}</div>
        </div>
      ))}
    </div>

    <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
      {[
        ['generate', '+ New Quiz'],
        ['quizzes', 'All Quizzes'],
        ['scores', 'Live Scores'],
      ].map(([id, label]) => (
        <button key={id} onClick={() => setTab(id)} style={{
          background: tab === id ? accentDim : 'transparent',
          border: '1px solid ' + (tab === id ? accent : panelBorder),
          color: tab === id ? accent : muted,
          borderRadius: 8,
          padding: '8px 18px',
          fontSize: 13,
          cursor: 'pointer',
        }}>{label}</button>
      ))}
    </div>

    {tab === 'generate' && (
      <div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 16,
          marginBottom: 20,
        }}>
          <div style={{
            background: panel,
            border: '1px solid rgba(56,189,248,0.12)',
            borderRadius: 12,
            padding: 20,
          }}>
            <div style={{
              fontSize: 11,
              color: muted,
              fontFamily: 'monospace',
              letterSpacing: 2,
              marginBottom: 10,
            }}>QUIZ DATE</div>
            <Input
              type='date'
              value={quizDate}
              onChange={(e: any) => setQuizDate(e.target.value)}
              style={{ width: 'auto', colorScheme: 'dark' }}
            />
          </div>
          <div style={{
            background: panel,
            border: '1px solid rgba(56,189,248,0.12)',
            borderRadius: 12,
            padding: 20,
          }}>
            <div style={{
              fontSize: 11,
              color: muted,
              fontFamily: 'monospace',
              letterSpacing: 2,
              marginBottom: 10,
            }}>QUESTIONS</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[10, 15, 20].map(n => (
                <button key={n} onClick={() => setNumQ(n)} style={{
                  background: numQ === n ? accentDim : 'transparent',
                  border: '1px solid ' + (numQ === n ? accent : panelBorder),
                  color: numQ === n ? accent : muted,
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                }}>{n}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          background: panel,
          border: '1px solid rgba(56,189,248,0.12)',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
        }}>
          <div style={{
            fontSize: 11,
            color: muted,
            fontFamily: 'monospace',
            letterSpacing: 2,
            marginBottom: 10,
          }}>PASTE QUESTIONS JSON</div>
          <Textarea
            placeholder='Paste JSON array here'
            style={{ minHeight: 140 }}
            onChange={(e: any) => {
              try {
                const p = JSON.parse(e.target.value);
                if (Array.isArray(p) && p.length > 0) {
                  setQuestions(p);
                  setErr('');
                }
              } catch {}
            }}
          />
          {err && (
            <div style={{ color: red, fontSize: 12, marginTop: 6 }}>{err}</div>
          )}
        </div>

        {questions.length > 0 && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <span style={{ fontWeight: 700 }}>
                {questions.length} questions loaded
              </span>
              <button onClick={publishQuiz} style={{
                background: greenDim,
                border: '1px solid ' + green,
                color: green,
                borderRadius: 8,
                padding: '9px 20px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}>Publish for {quizDate}</button>
            </div>

            {questions.map((q: any, i: number) => (
              <div key={i} style={{
                background: panel,
                border: '1px solid rgba(56,189,248,0.12)',
                borderRadius: 12,
                padding: 18,
                marginBottom: 10,
              }}>
                {editIdx === i ? (
                  <div>
                    <Textarea
                      value={editData.question}
                      onChange={(e: any) => setEditData({ ...editData, question: e.target.value })}
                      style={{ marginBottom: 10 }}
                    />
                    {editData.options.map((opt: string, oi: number) => (
                      <div key={oi} style={{
                        display: 'flex',
                        gap: 8,
                        marginBottom: 6,
                        alignItems: 'center',
                      }}>
                        <button
                          onClick={() => setEditData({ ...editData, answer: oi })}
                          style={{
                            background: oi === editData.answer ? 'rgba(74,222,128,0.15)' : 'transparent',
                            border: '1px solid ' + (oi === editData.answer ? green : panelBorder),
                            color: oi === editData.answer ? green : muted,
                            borderRadius: 6,
                            width: 30,
                            height: 30,
                            cursor: 'pointer',
                          }}>{'ABCD'[oi]}</button>
                        <Input
                          value={opt}
                          onChange={(e: any) => {
                            const o = [...editData.options];
                            o[oi] = e.target.value;
                            setEditData({ ...editData, options: o });
                          }}
                          style={{ flex: 1 }}
                        />
                      </div>
                    ))}
                    <Textarea
                      placeholder='Explanation'
                      value={editData.explanation}
                      onChange={(e: any) => setEditData({ ...editData, explanation: e.target.value })}
                      style={{ marginTop: 8, minHeight: 60 }}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button onClick={saveEdit} style={{
                        background: greenDim,
                        border: '1px solid ' + green,
                        color: green,
                        borderRadius: 8,
                        padding: '8px 18px',
                        fontSize: 13,
                        cursor: 'pointer',
                      }}>Save</button>
                      <GhostBtn onClick={() => setEditIdx(null)}>Cancel</GhostBtn>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}>
                      <div style={{
                        fontWeight: 600,
                        fontSize: 14,
                        lineHeight: 1.5,
                        flex: 1,
                      }}>
                        <span style={{
                          color: muted,
                          marginRight: 8,
                          fontSize: 12,
                        }}>{String(i + 1).padStart(2, '0')}</span>
                        {q.question}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => startEdit(i)} style={{
                          background: 'transparent',
                          border: '1px solid rgba(56,189,248,0.12)',
                          color: muted,
                          borderRadius: 6,
                          padding: '6px 10px',
                          fontSize: 12,
                          cursor: 'pointer',
                        }}>Edit</button>
                        <button onClick={() => deleteQ(i)} style={{
                          background: redDim,
                          border: '1px solid rgba(248,113,113,0.3)',
                          color: red,
                          borderRadius: 6,
                          padding: '6px 10px',
                          fontSize: 12,
                          cursor: 'pointer',
                        }}>Del</button>
                      </div>
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 6,
                      marginTop: 10,
                    }}>
                      {q.options.map((opt: string, oi: number) => (
                        <div key={oi} style={{
                          fontSize: 12,
                          color: oi === q.answer ? green : muted,
                          display: 'flex',
                          gap: 6,
                        }}>
                          <span style={{ fontWeight: 600 }}>{'ABCD'[oi]}.</span>
                          {opt}
                          {oi === q.answer && ' ✓'}
                        </div>
                      ))}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: muted,
                      marginTop: 8,
                      fontStyle: 'italic',
                      borderTop: '1px solid rgba(56,189,248,0.12)',
                      paddingTop: 8,
                    }}>{q.explanation}</div>
                  </div>
                )}
              </div>
            ))}

            <button onClick={publishQuiz} style={{
              background: greenDim,
              border: '1px solid ' + green,
              color: green,
              borderRadius: 8,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              width: '100%',
            }}>Publish Quiz for {quizDate}</button>
          </div>
        )}
      </div>
    )}

    {tab === 'quizzes' && (
      <div>
        {Object.keys(quizzes).length === 0 && (
          <div style={{ color: muted, fontSize: 13 }}>No quizzes yet.</div>
        )}
        {Object.keys(quizzes).sort().reverse().map(date => (
          <div key={date} style={{
            background: panel,
            border: '1px solid ' + (activeDate === date ? accent : panelBorder),
            borderRadius: 12,
            padding: 18,
            marginBottom: 10,
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 4,
                }}>
                  <span style={{
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    fontSize: 15,
                  }}>{date}</span>
                  {activeDate === date && <Tag color={green}>ACTIVE</Tag>}
                  {date === today() && <Tag color={accent}>TODAY</Tag>}
                </div>
                <div style={{ fontSize: 12, color: muted }}>
                  {quizzes[date].length} questions
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {activeDate !== date && (
                  <button onClick={() => setActive(date)} style={{
                    background: accentDim,
                    border: '1px solid ' + accent + '40',
                    color: accent,
                    borderRadius: 8,
                    padding: '8px 14px',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}>Set Active</button>
                )}
                <button onClick={() => deleteQuiz(date)} style={{
                  background: redDim,
                  border: '1px solid rgba(248,113,113,0.2)',
                  color: red,
                  borderRadius: 8,
                  padding: '8px 14px',
                  fontSize: 12,
                  cursor: 'pointer',
                }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {tab === 'scores' && (
      <div>
        <div style={{
          fontSize: 11,
          color: muted,
          fontFamily: 'monospace',
          letterSpacing: 2,
          marginBottom: 16,
        }}>LEADERBOARD</div>
        {todayLb.length === 0 && (
          <div style={{ color: muted, fontSize: 13 }}>No scores yet.</div>
        )}
        {todayLb.map((e: any, i: number) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            background: panel,
            border: '1px solid ' + (i === 0 ? accent + '40' : panelBorder),
            borderRadius: 10,
            padding: '12px 18px',
            marginBottom: 8,
          }}>
            <span style={{ fontSize: 18, width: 28 }}>{medal(i)}</span>
            <span style={{ flex: 1, fontWeight: 600 }}>{e.name}</span>
            <span style={{
              fontFamily: 'monospace',
              fontWeight: 700,
              color: accent,
            }}>{e.score}/{e.total}</span>
          </div>
        ))}
      </div>
    )}
  </div>

  {toast && (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      background: greenDim,
      border: '1px solid ' + green,
      color: green,
      borderRadius: 8,
      padding: '10px 20px',
      fontSize: 13,
      zIndex: 100,
    }}>✓ {toast}</div>
  )}
</div>
```

);
}

function PlayerApp() {
const [screen, setScreen] = useState(‘home’);
const [quizzes, setQuizzes] = useState<Record<string, any[]>>({});
const [leaderboard, setLeaderboard] = useState<any[]>([]);
const [selectedDate, setSelectedDate] = useState<string | null>(null);
const [playerName, setPlayerName] = useState(’’);
const [current, setCurrent] = useState(0);
const [score, setScore] = useState(0);
const [selected, setSelected] = useState<number | null>(null);
const [showFeedback, setShowFeedback] = useState(false);
const [err, setErr] = useState(’’);
const [loading, setLoading] = useState(true);

useEffect(() => { loadAll(); }, []);

async function loadAll() {
setLoading(true);
const data = await api(‘getActive’);
if (data.quizzes) setQuizzes(data.quizzes);
if (data.leaderboard) setLeaderboard(data.leaderboard);
setLoading(false);
}

const questions = selectedDate ? (quizzes[selectedDate] || []) : [];
const q = questions[current] || {};
const pct = questions.length ? score / questions.length : 0;
const quizDates = Object.keys(quizzes).sort().reverse();
const quizLb = leaderboard
.filter((e: any) => e.date === selectedDate)
.sort((a: any, b: any) => b.score - a.score);

function startQuiz() {
if (!playerName.trim()) {
setErr(‘Callsign required.’);
return;
}
setErr(’’);
setCurrent(0);
setScore(0);
setSelected(null);
setShowFeedback(false);
setScreen(‘quiz’);
}

function handleAnswer(idx: number) {
if (showFeedback) return;
setSelected(idx);
setShowFeedback(true);
if (idx === questions[current].answer) {
setScore(s => s + 1);
}
}

async function next() {
const isLast = current + 1 >= questions.length;
if (isLast) {
const entry = {
name: playerName.trim(),
score,
total: questions.length,
date: selectedDate,
};
await api(‘saveScore’, { entry });
const filtered = leaderboard.filter((e: any) => {
return !(e.name === entry.name && e.date === selectedDate);
});
const updated = […filtered, entry].sort(
(a: any, b: any) => b.score - a.score
);
setLeaderboard(updated);
setScreen(‘result’);
} else {
setCurrent(c => c + 1);
setSelected(null);
setShowFeedback(false);
}
}

if (loading) return (
<div style={{
minHeight: ‘100vh’,
background: bg,
display: ‘flex’,
alignItems: ‘center’,
justifyContent: ‘center’,
}}>
<style>{css}</style>
<Spinner />
</div>
);

const Nav = ({ back, onBack }: any) => (
<div style={{
borderBottom: ‘1px solid rgba(56,189,248,0.12)’,
padding: ‘13px 28px’,
display: ‘flex’,
alignItems: ‘center’,
gap: 14,
background: ‘rgba(8,12,20,0.95)’,
position: ‘sticky’,
top: 0,
zIndex: 10,
}}>
{back && (
<button onClick={onBack} style={{
background: ‘transparent’,
border: ‘none’,
color: muted,
fontSize: 13,
cursor: ‘pointer’,
}}>Back</button>
)}
<span style={{
fontFamily: ‘monospace’,
fontWeight: 700,
fontSize: 14,
color: accent,
letterSpacing: 3,
}}>AEROQUIZ</span>
</div>
);

const Wrap = ({
children,
maxW = 600,
back = false,
onBack = () => setScreen(‘home’),
}: any) => (
<div style={{
minHeight: ‘100vh’,
background: bg,
fontFamily: ‘Inter,sans-serif’,
color: textCol,
display: ‘flex’,
flexDirection: ‘column’,
}}>
<style>{css}</style>
<Nav back={back} onBack={onBack} />
<div style={{
flex: 1,
display: ‘flex’,
alignItems: ‘flex-start’,
justifyContent: ‘center’,
padding: 24,
}}>
<div style={{ width: ‘100%’, maxWidth: maxW }}>
{children}
</div>
</div>
</div>
);

if (screen === ‘home’) return (
<Wrap maxW={680}>
<div style={{ marginBottom: 28 }}>
<div style={{
fontFamily: ‘monospace’,
fontSize: 11,
color: accent,
letterSpacing: 4,
marginBottom: 8,
}}>DAILY BRIEFING</div>
<div style={{
fontSize: 28,
fontWeight: 800,
marginBottom: 4,
}}>Choose your quiz</div>
<div style={{ color: muted, fontSize: 14 }}>
Select a session and compete with your crew.
</div>
</div>

```
  {quizDates.length === 0 && (
    <div style={{
      background: panel,
      border: '1px solid rgba(56,189,248,0.12)',
      borderRadius: 14,
      padding: 24,
      textAlign: 'center',
      color: muted,
      fontSize: 13,
    }}>NO QUIZZES AVAILABLE</div>
  )}

  {quizDates.map(date => {
    const isToday = date === today();
    const dateLb = leaderboard
      .filter((e: any) => e.date === date)
      .sort((a: any, b: any) => b.score - a.score);
    return (
      <div
        key={date}
        onClick={() => {
          setSelectedDate(date);
          setScreen('name');
          setErr('');
        }}
        style={{
          background: panel,
          border: '1px solid ' + (isToday ? accent : panelBorder),
          borderRadius: 14,
          padding: 20,
          marginBottom: 12,
          cursor: 'pointer',
        }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 10,
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 4,
            }}>
              <span style={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: 16,
              }}>{date}</span>
              {isToday && <Tag color={accent}>TODAY</Tag>}
            </div>
            <div style={{ fontSize: 12, color: muted }}>
              {quizzes[date].length} questions · {dateLb.length} players
            </div>
          </div>
          <span style={{ color: accent, fontSize: 18 }}>→</span>
        </div>
        {dateLb.slice(0, 3).length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            {dateLb.slice(0, 3).map((e: any, i: number) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 8,
                padding: '5px 10px',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <span>{medal(i)}</span>
                <span style={{ fontWeight: 600 }}>{e.name}</span>
                <span style={{ color: accent, fontFamily: 'monospace' }}>
                  {e.score}/{e.total}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  })}

  <GlobalChat playerName={playerName} />
</Wrap>
```

);

if (screen === ‘name’) return (
<Wrap back onBack={() => setScreen(‘home’)}>
<div style={{
fontFamily: ‘monospace’,
fontSize: 11,
color: accent,
letterSpacing: 4,
marginBottom: 16,
}}>QUIZ — {selectedDate}</div>
<div style={{
fontSize: 24,
fontWeight: 800,
marginBottom: 6,
}}>Enter your callsign</div>
<div style={{ color: muted, fontSize: 13, marginBottom: 20 }}>
{questions.length} questions
</div>

```
  {quizLb.length > 0 && (
    <div style={{
      background: panel,
      border: '1px solid rgba(56,189,248,0.12)',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    }}>
      <div style={{
        fontSize: 11,
        color: muted,
        fontFamily: 'monospace',
        letterSpacing: 2,
        marginBottom: 10,
      }}>CURRENT LEADERBOARD</div>
      {quizLb.slice(0, 5).map((e: any, i: number) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 6,
        }}>
          <span style={{ fontSize: 16, width: 24 }}>{medal(i)}</span>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{e.name}</span>
          <span style={{
            fontFamily: 'monospace',
            fontSize: 13,
            color: accent,
          }}>{e.score}/{e.total}</span>
        </div>
      ))}
    </div>
  )}

  <Input
    placeholder='e.g. Maverick'
    value={playerName}
    onChange={(e: any) => setPlayerName(e.target.value)}
    onKeyDown={(e: any) => { if (e.key === 'Enter') startQuiz(); }}
    autoFocus
  />
  {err && (
    <div style={{ color: red, fontSize: 12, marginTop: 8 }}>{err}</div>
  )}
  <PrimaryBtn onClick={startQuiz} style={{ marginTop: 16 }}>
    CONFIRM AND START
  </PrimaryBtn>
</Wrap>
```

);

if (screen === ‘quiz’) return (
<Wrap maxW={640} back onBack={() => setScreen(‘name’)}>
<div style={{
display: ‘flex’,
justifyContent: ‘space-between’,
alignItems: ‘center’,
marginBottom: 14,
}}>
<span style={{
fontFamily: ‘monospace’,
fontSize: 11,
color: muted,
}}>{String(current + 1).padStart(2, ‘0’)} / {String(questions.length).padStart(2, ‘0’)}</span>
<span style={{
fontFamily: ‘monospace’,
fontSize: 13,
color: accent,
fontWeight: 700,
}}>Score: {score}</span>
</div>

```
  <div style={{
    height: 3,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 99,
    marginBottom: 26,
    overflow: 'hidden',
  }}>
    <div style={{
      height: '100%',
      width: String(Math.round((current / questions.length) * 100)) + '%',
      background: accent,
      borderRadius: 99,
    }} />
  </div>

  <div style={{
    fontSize: 17,
    fontWeight: 600,
    lineHeight: 1.65,
    marginBottom: 20,
  }}>{q.question}</div>

  {q.options && q.options.map((opt: string, i: number) => {
    const isCorrect = i === q.answer;
    const isChosen = i === selected;
    let bg2 = 'rgba(255,255,255,0.03)';
    let border2 = panelBorder;
    if (showFeedback && isCorrect) {
      bg2 = 'rgba(74,222,128,0.1)';
      border2 = green;
    } else if (showFeedback && isChosen) {
      bg2 = 'rgba(248,113,113,0.1)';
      border2 = red;
    }
    return (
      <button
        key={i}
        onClick={() => handleAnswer(i)}
        style={{
          width: '100%',
          textAlign: 'left',
          background: bg2,
          border: '1px solid ' + border2,
          borderRadius: 10,
          padding: '13px 16px',
          color: textCol,
          fontSize: 14,
          cursor: showFeedback ? 'default' : 'pointer',
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
        <span style={{
          fontFamily: 'monospace',
          fontSize: 11,
          fontWeight: 700,
          color: showFeedback
            ? isCorrect ? green : isChosen ? red : subtle
            : subtle,
          minWidth: 20,
        }}>{'ABCD'[i]}</span>
        <span style={{ lineHeight: 1.5 }}>{opt}</span>
        {showFeedback && isCorrect && (
          <span style={{ marginLeft: 'auto', color: green }}>✓</span>
        )}
        {showFeedback && isChosen && !isCorrect && (
          <span style={{ marginLeft: 'auto', color: red }}>✗</span>
        )}
      </button>
    );
  })}

  {showFeedback && (
    <div style={{
      background: 'rgba(56,189,248,0.05)',
      border: '1px solid rgba(56,189,248,0.12)',
      borderRadius: 10,
      padding: '14px 16px',
      marginTop: 8,
    }}>
      <div style={{
        fontSize: 12,
        fontFamily: 'monospace',
        color: accent,
        letterSpacing: 2,
        marginBottom: 6,
      }}>DEBRIEF</div>
      <div style={{
        color: muted,
        fontSize: 13,
        lineHeight: 1.6,
      }}>{q.explanation}</div>
      <PrimaryBtn onClick={next} style={{ marginTop: 14 }}>
        {current + 1 < questions.length ? 'NEXT QUESTION' : 'SEE RESULTS'}
      </PrimaryBtn>
    </div>
  )}
</Wrap>
```

);

if (screen === ‘result’) return (
<Wrap back onBack={() => setScreen(‘home’)}>
<div style={{ textAlign: ‘center’, marginBottom: 24 }}>
<div style={{ fontSize: 52, marginBottom: 8 }}>
{pct >= 0.8 ? ‘🎯’ : pct >= 0.5 ? ‘📋’ : ‘📚’}
</div>
<div style={{
fontFamily: ‘monospace’,
fontSize: 11,
color: accent,
letterSpacing: 4,
marginBottom: 8,
}}>MISSION DEBRIEF</div>
<div style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
{playerName}
</div>
<div style={{
fontSize: 52,
fontWeight: 800,
fontFamily: ‘monospace’,
color: pct >= 0.8 ? green : pct >= 0.5 ? amber : red,
}}>
{score}
<span style={{ fontSize: 22, color: muted }}>/{questions.length}</span>
</div>
<div style={{ color: muted, fontSize: 13, marginTop: 4 }}>
{pct >= 0.8
? ‘Outstanding. Cleared for departure.’
: pct >= 0.5
? ‘Passing grade. More study recommended.’
: ‘Below minimums. Additional training required.’}
</div>
</div>

```
  <div style={{
    height: 6,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 99,
    marginBottom: 24,
    overflow: 'hidden',
  }}>
    <div style={{
      height: '100%',
      width: String(Math.round(pct * 100)) + '%',
      background: pct >= 0.8 ? green : pct >= 0.5 ? amber : red,
      borderRadius: 99,
    }} />
  </div>

  <div style={{ marginBottom: 20 }}>
    <div style={{
      fontSize: 11,
      fontFamily: 'monospace',
      color: muted,
      letterSpacing: 2,
      marginBottom: 12,
    }}>QUIZ LEADERBOARD</div>
    {quizLb.slice(0, 5).map((e: any, i: number) => (
      <div key={i} style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: e.name === playerName ? accentDim : 'rgba(255,255,255,0.03)',
        border: '1px solid ' + (e.name === playerName ? accent + '40' : panelBorder),
        borderRadius: 10,
        padding: '10px 16px',
        marginBottom: 6,
      }}>
        <span style={{ fontSize: 16, width: 24 }}>{medal(i)}</span>
        <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{e.name}</span>
        <span style={{
          fontFamily: 'monospace',
          fontSize: 13,
          color: accent,
        }}>{e.score}/{e.total}</span>
      </div>
    ))}
  </div>

  <PrimaryBtn onClick={() => setScreen('home')}>
    BACK TO ALL QUIZZES
  </PrimaryBtn>
  <div style={{ marginTop: 16 }}>
    <GlobalChat playerName={playerName} />
  </div>
</Wrap>
```

);

return null;
}

export default function Page() {
const [admin, setAdmin] = useState(false);
useEffect(() => { setAdmin(isAdmin()); }, []);
return admin ? <AdminPanel /> : <PlayerApp />;
}
