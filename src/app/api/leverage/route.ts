import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { goal } = await req.json();

    const prompt = `You are an elite performance intelligence system for Agirheo. Generate 6 high-value leverage insights for someone with this goal:

Goal: "${goal.title}"
Why they want it: "${goal.why}"
Target outcome: "${goal.outcome}"
Deadline: ${goal.deadline}
Progress: ${goal.progress}%

Generate 6 insights across these categories: strategy, mindset, market, skill, action.

For each insight, provide:
1. A short powerful title
2. 2-3 sentences of specific, actionable intelligence — not generic advice
3. One immediate action item they can do TODAY

Return ONLY a valid JSON array (no markdown, no backticks, no preamble):
[
  {
    "category": "strategy",
    "title": "Title here",
    "content": "2-3 sentence insight here",
    "action_item": "Specific action to take today",
    "source": "Insight source or principle name"
  }
]

Make these insights feel like they came from a $10,000/hr consultant who knows their exact goal. Specific, not generic.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) throw new Error('AI request failed');

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    let insights;
    try {
      const cleaned = text.replace(/```json|```/g, '').trim();
      insights = JSON.parse(cleaned);
    } catch {
      insights = getDefaultInsights(goal.title);
    }

    return NextResponse.json({ insights });
  } catch {
    return NextResponse.json({ insights: [] }, { status: 200 });
  }
}

function getDefaultInsights(goalTitle: string) {
  return [
    {
      category: 'strategy',
      title: 'The 80/20 of Your Goal',
      content: `For any goal like "${goalTitle}", 80% of results come from 20% of actions. Identify the 2-3 activities that move the needle most and ruthlessly cut the rest. Most people stay busy; winners stay effective.`,
      action_item: 'Write down your 3 highest-leverage activities for this goal and block 2 hours for them tomorrow morning.',
      source: 'Pareto Principle',
    },
    {
      category: 'mindset',
      title: 'Identity Before Achievement',
      content: 'You don\'t achieve goals — you reveal who you already decided to become. Every action today is a vote for the identity you\'re building. Stop asking "how do I achieve this" and start asking "who do I need to become."',
      action_item: 'Write one identity statement: "I am the kind of person who [specific daily behavior]." Say it before you start work.',
      source: 'Atomic Habits — James Clear',
    },
    {
      category: 'market',
      title: 'What Top Performers Are Doing Right Now',
      content: 'The people who have already achieved what you want share common patterns: daily non-negotiables, public accountability, and relentless skill stacking. They didn\'t wait to feel ready — they built systems that made mediocrity impossible.',
      action_item: 'Find one person who has achieved your exact goal and study their daily routine for 15 minutes.',
      source: 'Competitive Intelligence',
    },
    {
      category: 'skill',
      title: 'The Skill Gap You Must Close',
      content: 'Between where you are and your goal is a skill gap. Most people try to outwork the gap — winners close it systematically. Deliberate practice beats random effort every single time. One hour of focused skill-building daily compounds faster than 4 hours of unfocused work.',
      action_item: 'Identify the single skill most critical to your goal and dedicate 45 minutes to deliberate practice today.',
      source: 'Peak Performance — Anders Ericsson',
    },
    {
      category: 'action',
      title: 'Execute Before Your Brain Argues',
      content: 'The 5-second rule is real: your brain will generate a reason to delay within 5 seconds of any opportunity to act. Top performers take action before the hesitation starts. They do not think about motivation — they build systems that make action automatic.',
      action_item: 'Pick your hardest task for today. Start it in the next 5 minutes. Set a 25-minute timer. No negotiation.',
      source: 'Mel Robbins — 5 Second Rule',
    },
    {
      category: 'strategy',
      title: 'Constraint Is Your Competitive Advantage',
      content: 'Constraints force creativity and eliminate optionality — which is actually a productivity killer. The most productive people have strict constraints on their time, energy, and focus. Freedom of choice is the enemy of execution.',
      action_item: 'Set a hard stop time for your workday today and commit to completing your critical tasks before then.',
      source: 'Deep Work — Cal Newport',
    },
  ];
}
