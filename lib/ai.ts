import OpenAI from "openai";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.OPENROUTER_MODEL ?? "mistralai/mistral-7b-instruct";

export const hasAI = Boolean(OPENROUTER_API_KEY);

function getClient(): OpenAI {
  if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not set");
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: OPENROUTER_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "Magnetize",
    },
  });
}

export interface GeneratedTab {
  title: string;
  content: unknown[];
}

export async function generateMagnetContent(
  topic: string,
  audience: string,
  onChunk?: (text: string) => void
): Promise<GeneratedTab[]> {
  const client = getClient();

  const systemPrompt = `You are an expert content marketer. Generate a lead magnet as structured JSON.
Output ONLY valid JSON — an array of tab objects. Each tab has a "title" string and "content" array of BlockNote blocks.
BlockNote block format: {"type":"paragraph","content":[{"type":"text","text":"...","styles":{}}]}
Also use {"type":"heading","props":{"level":2},"content":[{"type":"text","text":"...","styles":{}}]}
And {"type":"bulletListItem","content":[{"type":"text","text":"...","styles":{}}]}
Generate 3-5 tabs of dense, specific, actionable content. No fluff.`;

  const userPrompt = `Topic: ${topic}
Target audience: ${audience}
Generate a complete lead magnet with 3-5 tabs. Return ONLY the JSON array, no markdown code fences.`;

  const stream = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 4000,
  });

  let fullText = "";
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? "";
    fullText += delta;
    onChunk?.(delta);
  }

  try {
    const clean = fullText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(clean) as GeneratedTab[];
  } catch {
    return [
      {
        title: "Introduction",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: fullText.slice(0, 500), styles: {} }],
          },
        ],
      },
    ];
  }
}
