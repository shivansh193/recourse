import type { VerificationResult } from "./types";

// gemini-3.5-flash-lite is tried as a fallback when the primary model
// returns 503 (observed in practice: gemini-3.8-flash intermittently
// reports "currently experiencing high demand") or 429 (each model has
// its own separate per-day free-tier quota, so exhausting one doesn't
// mean the other is exhausted too) — both are current, non-deprecated
// models per ai.google.dev/gemini-api/docs/models.
const MODELS = ["gemini-3.8-flash", "gemini-3.5-flash-lite"];
const RETRYABLE_STATUSES = new Set([429, 503]);

async function callGemini(prompt: string, responseSchema: object): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  let lastError: Error | null = null;
  for (const model of MODELS) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const res = await fetch(`${endpoint}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema, temperature: 0 },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof text !== "string") throw new Error("Gemini returned no extractable content");
      return text;
    }

    const errText = await res.text().catch(() => "");
    lastError = new Error(`Gemini request to ${model} failed (${res.status}): ${errText}`);
    if (!RETRYABLE_STATUSES.has(res.status)) throw lastError; // only fall back on overload/quota, not real errors
  }
  throw lastError ?? new Error("Gemini request failed");
}

export type ExtractedFacts = {
  defendant: string;
  amount: string;
  basis: string;
  demandMade: boolean;
  periodPassed: boolean;
  itemizationReceived: boolean;
};

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    defendant: {
      type: "string",
      description:
        "The landlord or property company's name, exactly as stated in the text. Empty string if not mentioned.",
    },
    amount: {
      type: "string",
      description:
        "The dollar amount being claimed, formatted like $1,500.00. Empty string if no amount is stated.",
    },
    basis: {
      type: "string",
      description:
        "A clean one-to-two sentence restatement of why the defendant owes money, using only facts present in the source text — do not add facts that aren't there.",
    },
    demandMade: {
      type: "boolean",
      description:
        "True only if the text explicitly states the plaintiff asked the landlord for the deposit back, in writing or otherwise.",
    },
    periodPassed: {
      type: "boolean",
      description:
        "True only if the text implies more than 21 days have passed since the plaintiff moved out.",
    },
    itemizationReceived: {
      type: "boolean",
      description:
        "True only if the text explicitly states the landlord provided an itemized statement of deductions.",
    },
  },
  required: ["defendant", "amount", "basis", "demandMade", "periodPassed", "itemizationReceived"],
};

const VERIFY_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        properties: {
          field: {
            type: "string",
            enum: ["defendant", "basis", "demandMade", "periodPassed", "itemizationReceived"],
          },
          supported: {
            type: "boolean",
            description:
              "True only if the intake text actually supports this fact as drafted. False if the fact was invented, overstated, or isn't actually stated in the intake text.",
          },
          note: {
            type: "string",
            description:
              "One short sentence: quote or point to the specific part of the intake text that supports this fact, or explain what's missing if it isn't supported.",
          },
        },
        required: ["field", "supported", "note"],
      },
    },
  },
  required: ["results"],
};

export async function verifyClaimFacts(
  intakeText: string,
  facts: { defendant: string; basis: string; demandMade: boolean; periodPassed: boolean; itemizationReceived: boolean }
): Promise<VerificationResult[]> {
  const prompt =
    "You are fact-checking a draft small claims petition against the tenant's original plain-language " +
    "description, BEFORE it is shown to them. For each of the five drafted facts below, decide whether the " +
    "original text actually supports it. Be strict: a fact counts as unsupported if it was inferred beyond " +
    "what the text says, not just if it's flatly contradicted.\n\n" +
    "Original text:\n\"\"\"\n" + intakeText + "\n\"\"\"\n\n" +
    "Drafted facts to check:\n" +
    `- defendant: "${facts.defendant}"\n` +
    `- basis: "${facts.basis}"\n` +
    `- demandMade (tenant asked the landlord for the deposit back before suing): ${facts.demandMade}\n` +
    `- periodPassed (more than 21 days have passed since move-out): ${facts.periodPassed}\n` +
    `- itemizationReceived (landlord provided an itemized statement of deductions): ${facts.itemizationReceived}\n\n` +
    "Return one result per field, in the same order.";

  const text = await callGemini(prompt, VERIFY_RESPONSE_SCHEMA);
  const parsed = JSON.parse(text) as { results: VerificationResult[] };
  return parsed.results;
}

export async function extractClaimFacts(intakeText: string): Promise<ExtractedFacts> {
  const prompt =
    "You are extracting structured facts for a California small claims security-deposit " +
    "petition, from a plain-language description a tenant wrote themselves. Only use facts " +
    "explicitly present in the text below — never invent a name, amount, or date that isn't " +
    "stated. If something isn't mentioned, use an empty string for text fields or false for " +
    "booleans.\n\nTenant's text:\n\"\"\"\n" +
    intakeText +
    "\n\"\"\"";

  const text = await callGemini(prompt, RESPONSE_SCHEMA);
  return JSON.parse(text) as ExtractedFacts;
}
