const GEMINI_MODEL = "gemini-3.8-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

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

export async function extractClaimFacts(intakeText: string): Promise<ExtractedFacts> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const prompt =
    "You are extracting structured facts for a California small claims security-deposit " +
    "petition, from a plain-language description a tenant wrote themselves. Only use facts " +
    "explicitly present in the text below — never invent a name, amount, or date that isn't " +
    "stated. If something isn't mentioned, use an empty string for text fields or false for " +
    "booleans.\n\nTenant's text:\n\"\"\"\n" +
    intakeText +
    "\n\"\"\"";

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini request failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    throw new Error("Gemini returned no extractable content");
  }

  return JSON.parse(text) as ExtractedFacts;
}
