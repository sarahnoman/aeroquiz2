import { NextRequest, NextResponse } from "next/server";

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL!;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!;

async function rget(key: string) {
  const res = await fetch(`${REDIS_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    cache: "no-store",
  });
  const data = await res.json();
  return data.result ? JSON.parse(data.result) : null;
}

async function rset(key: string, value: any) {
  await fetch(`${REDIS_URL}/set/${key}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(JSON.stringify(value)),
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "getActive") {
    const [date, quizzes, leaderboard] = await Promise.all([
      rget("activeDate"), rget("quizzes"), rget("leaderboard"),
    ]);
    return NextResponse.json({ date, quizzes, leaderboard });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === "generateQuestions") {
    const { base64, numQ, mimeType } = body;
    const prompt = `You are an expert aviation exam writer. Read the lecture slides and generate exactly ${numQ} high-quality multiple-choice questions that test genuine understanding. Questions should be exam-realistic and precise, as expected in aviation training.\nReturn ONLY a valid JSON array. No markdown, no explanation, no backticks.\nEach item: { "question": string, "options": [A,B,C,D], "answer": 0-3, "explanation": string }`;
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [{ role: "user", content: [
          { type: "document", source: { type: "base64", media_type: mimeType, data: base64 } },
          { type: "text", text: prompt }
        ]}]
      })
    });
    const data = await res.json();
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 });
    const text = data.content.map((b: any) => b.text || "").join("");
    const questions = JSON.parse(text.replace(/```json|```/g, "").trim());
    return NextResponse.json({ questions });
  }

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

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
