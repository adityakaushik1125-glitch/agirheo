import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tasksDone, tasksFailed, tasksTotal, whatAvoided, disciplineBreaks, fixTomorrow, mood, productivity, goals } = body;

    const rate = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

    const prompt = `You are a brutally honest, no-excuse performance coach for a high-performance productivity app called Agirheo. 

The user has submitted their daily reflection. Give them raw, direct, honest feedback — not soft, not gentle. This person needs truth, not comfort. But keep it constructive and actionable.

Today's data:
- Tasks completed: ${tasksDone}/${tasksTotal} (${rate}% completion rate)
- Tasks failed: ${tasksFailed}
- Mood: ${mood}/10
- Productivity: ${productivity}/10
- What they avoided: "${whatAvoided || 'Not specified'}"
- Where they broke discipline: "${disciplineBreaks || 'Not specified'}"
- What they'll fix tomorrow: "${fixTomorrow || 'Not specified'}"
- Active goals: ${goals?.map((g: { title: string; deadline: string; progress: number }) => `"${g.title}" (${g.progress}% done, deadline: ${g.deadline})`).join(', ') || 'None set'}

Give 3-4 sentences of direct feedback. Reference their specific data. End with one powerful line about what tomorrow must look like. No bullet points. No headers. Just a paragraph of direct truth.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) throw new Error('AI request failed');

    const data = await response.json();
    const feedback = data.content?.[0]?.text || generateFallbackFeedback(rate, tasksDone, tasksFailed, whatAvoided, fixTomorrow);

    return NextResponse.json({ feedback });
  } catch {
    return NextResponse.json({
      feedback: 'Complete your reflection and try again. The data tells your story — face it honestly.'
    }, { status: 200 });
  }
}

function generateFallbackFeedback(rate: number, done: number, failed: number, avoided: string, fix: string): string {
  let f = '';
  if (rate >= 80) f = `${done} tasks done. That's the standard. Not exceptional — the standard. The real question is whether you pushed your limits or just cleared your list. `;
  else if (rate >= 50) f = `${done} done, ${failed} failed. You're at half-strength. Your goals don't care about half-effort — they only respond to full commitment. `;
  else f = `${failed} tasks failed today. This is the version of you that your future self will regret. The gap between who you are and who you want to be is measured in days exactly like this one. `;
  if (avoided) f += `You avoided "${avoided}" — and you already know why that's a problem. `;
  if (fix) f += `Tomorrow you fix: "${fix}". No negotiation, no excuses — that happens first. `;
  else f += 'Tomorrow, wake up and execute before your mind can argue with you. ';
  return f;
}
