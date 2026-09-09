import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MODEL = "google/gemini-3.8-flash";

async function callGateway(system: string, user: string) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured.");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("Too many requests right now. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits are exhausted. Please add credits to continue.");
    throw new Error(`AI request failed (${res.status}). ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

function extractJson(raw: string): unknown {
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.search(/[[{]/);
  const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
  const slice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  return JSON.parse(slice);
}

const summarySchema = z.object({
  keyDecisions: z.array(z.string()).default([]),
  actionItems: z.array(z.string()).default([]),
  deadlines: z.array(z.string()).default([]),
});

export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ notes: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const raw = await callGateway(
      "You summarize workplace meeting notes. Reply with JSON only, no prose, using this shape: " +
        '{"keyDecisions": string[], "actionItems": string[], "deadlines": string[]}. ' +
        "Each item is one short sentence. Action items should name the owner when known. " +
        "Deadlines should include the date or timeframe. Use empty arrays when nothing applies.",
      `Meeting notes:\n\n${data.notes}`,
    );
    return summarySchema.parse(extractJson(raw));
  });

export const suggestPriority = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ text: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const raw = await callGateway(
      'You classify task urgency. Reply with JSON only: {"priority":"High"|"Medium"|"Low"}. ' +
        "High = blocking, urgent, or client/deadline critical. Low = nice-to-have or no time pressure.",
      `Task: ${data.text}`,
    );
    const parsed = z
      .object({ priority: z.enum(["High", "Medium", "Low"]) })
      .parse(extractJson(raw));
    return parsed;
  });

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        recipient: z.string().min(1),
        topic: z.string().min(1),
        tone: z.enum(["Formal", "Friendly", "Persuasive", "Urgent"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const raw = await callGateway(
      "You write clear workplace emails. Reply with JSON only: " +
        '{"subject": string, "body": string}. The body is plain text with line breaks, ' +
        "greeting and sign-off included, no placeholders other than [Your Name].",
      `Recipient: ${data.recipient}\nTone: ${data.tone}\nWhat the email is about: ${data.topic}`,
    );
    return z.object({ subject: z.string(), body: z.string() }).parse(extractJson(raw));
  });
