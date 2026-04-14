import { NextRequest, NextResponse } from "next/server";

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL!;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!;

async function rget(key: string) {
  try {
    const res = await fetch(`${REDIS_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      cache: "no-store",
    });
    const data = await res.json();
    return data.result ? JSON.parse(data.result) : null;
  } catch { return null; }
}

async function rset(key: string, value: any) {
  try {
    const res = await fetch(`${REDIS_URL}/set/${key}/${encodeURIComponent(JSON.stringify(value))}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    });
    const data = await res.json();
    console.log("rset result:", key, data);
  } catch (e) { console.error("rset error:", e); }

}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "getActive") {
    const [date, quizzes, leaderboard, messages] = await Promise.all([
  rget("activeDate"), rget("quizzes"), rget("leaderboard"), rget("messages"),
]);
return NextResponse.json({ date, quizzes: quizzes || {}, leaderboard: leaderboard || [], messages: messages || [] });

  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === "saveQuiz") {
    const quizzes = (await rget("quizzes")) || {};
    quizzes[body.date] = body.questions;
    await rset("quizzes", quizzes);
    await rset("activeDate", body.date);
    return NextResponse.json({ ok: true });
  }

  if (action === "setActive") {
    await rset("activeDate", body.date);
    return NextResponse.json({ ok: true });
  }

  if (action === "deleteQuiz") {
    const quizzes = (await rget("quizzes")) || {};
    delete quizzes[body.date];
    await rset("quizzes", quizzes);
    return NextResponse.json({ ok: true });
  }

  if (action === "saveScore") {
    const leaderboard = (await rget("leaderboard")) || [];
    const filtered = leaderboard.filter(
      (e: any) => !(e.name === body.entry.name && e.date === body.entry.date)
    );
    filtered.push(body.entry);
    filtered.sort((a: any, b: any) => b.score - a.score);
    await rset("leaderboard", filtered);
    return NextResponse.json({ ok: true });
  }
  if (action === "saveMessage") {
    const messages = (await rget("messages")) || [];
    messages.push({ name: body.name, text: body.text, time: new Date().toISOString() });
    if (messages.length > 100) messages.splice(0, messages.length - 100);
    await rset("messages", messages);
    return NextResponse.json({ ok: true });
  }
if (action === 'checkPassword') {
  const pw = searchParams.get('pw');
  const correct = process.env.ADMIN_PASSWORD;
  return NextResponse.json({ ok: pw === correct });
}

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
