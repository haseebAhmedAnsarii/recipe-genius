import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MEAL_PLAN_SYSTEM_PROMPT = `You are a professional meal planner and chef. Create a 3-day dinner meal plan.
CRITICAL INSTRUCTION: If any ingredient in the provided list is clearly a typo, a fake word (like keyboard mashing), or a non-food item, you MUST completely IGNORE it. Do not include it in the meal plan.

You MUST respond with ONLY Markdown in this exact format, no other text:

# Meal Plan

## Day 1
**Meal:** Meal Name
**Description:** Brief description of the dish

## Day 2
**Meal:** ...
...

## Day 3
**Meal:** ...

Each meal should be a complete, balanced dinner recipe. Make the meals varied and interesting.`;

const VALIDATION_SYSTEM_PROMPT = `You are an expert culinary AI. Your task is to check the user's input (ingredients and/or dietary preferences).
If the input contains AT LEAST ONE valid, real food item or recognizable dietary preference (e.g. "vegan", "low carb", "chicken"), you MUST strictly respond with ONLY the one word "yes" (even if there are other fake or unrecognizable words).
If ALL of the input is completely fake, totally wrong, or unrecognizable keyboard mashing, you MUST strictly respond with ONLY the one word "no".
Do not include any other text, punctuation, or explanation.`;

function parseMealPlanMarkdown(text: string): Record<string, unknown> | null {
  try {
    const lines = text.split('\n').map(l => l.trim());
    const days: any = {};
    let currentDay = '';

    for (const line of lines) {
      const isDayHeading = line.startsWith('## ') && ['Day 1', 'Day 2', 'Day 3'].includes(line.replace('## ', '').trim());

      if (isDayHeading) {
        currentDay = line.replace('## ', '').trim();
        days[currentDay] = {
          title: '',
          description: ''
        };
      } else if (currentDay) {
        if (line.startsWith('**Meal:**')) {
          days[currentDay].title = line.replace('**Meal:**', '').trim();
        } else if (line.startsWith('**Description:**')) {
          days[currentDay].description = line.replace('**Description:**', '').trim();
        }
      }
    }

    if (Object.keys(days).length === 0) return null;
    return { days };
  } catch {
    return null;
  }
}

// Provider 1: Google Gemini
async function tryGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent([
    { text: systemPrompt },
    { text: userPrompt },
  ]);
  return result.response.text();
}

// Provider 2: Cloudflare Workers AI
async function tryCloudflare(systemPrompt: string, userPrompt: string): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) throw new Error("Cloudflare credentials not configured");

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/mistral/mistral-7b-instruct-v0.1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 4096,
      }),
    }
  );

  if (!response.ok) throw new Error(`Cloudflare API error: ${response.status}`);
  const data = await response.json();
  return data.result?.response || JSON.stringify(data);
}

// Provider 3: Hugging Face
async function tryHuggingFace(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiToken = process.env.HF_API_TOKEN;
  if (!apiToken) throw new Error("HF_API_TOKEN not configured");

  const response = await fetch(
    "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `<s>[INST] ${systemPrompt}\n\n${userPrompt} [/INST]`,
        parameters: {
          max_new_tokens: 4096,
          temperature: 0.7,
          return_full_text: false,
        },
      }),
    }
  );

  if (!response.ok) throw new Error(`Hugging Face API error: ${response.status}`);
  const data = await response.json();
  return Array.isArray(data) ? data[0]?.generated_text || "" : JSON.stringify(data);
}

// Provider 4: Ollama (local)
async function tryOllama(systemPrompt: string, userPrompt: string): Promise<string> {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";

  const response = await fetch(`${ollamaUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "mistral:7b",
      prompt: `${systemPrompt}\n\n${userPrompt}`,
      stream: false,
    }),
  });

  if (!response.ok) throw new Error(`Ollama API error: ${response.status}`);
  const data = await response.json();
  return data.response || "";
}

const providers = [
  { name: "Gemini", fn: tryGemini },
  { name: "Cloudflare", fn: tryCloudflare },
  { name: "Hugging Face", fn: tryHuggingFace },
  { name: "Ollama", fn: tryOllama },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { preferences, ingredientsOnHand } = body as {
      preferences?: string;
      ingredientsOnHand?: string[];
    };

    let userPrompt = "Generate a 3-day dinner meal plan. Remember to respond with ONLY Markdown format.";

    if (preferences) {
      userPrompt += ` Dietary preferences: ${preferences}.`;
    }

    if (preferences || (ingredientsOnHand && ingredientsOnHand.length > 0)) {
      // Step 1: Validate Inputs
      const validationUserPrompt = `Input to validate: Preferences: ${preferences || "none"}. Ingredients: ${ingredientsOnHand ? ingredientsOnHand.join(", ") : "none"}`;
      let isValidInput = false;
      let validationCompleted = false;

      for (const provider of providers) {
        if (validationCompleted) break;
        try {
          console.log(`[Validation] Trying provider: ${provider.name}`);
          const validationResponse = await provider.fn(VALIDATION_SYSTEM_PROMPT, validationUserPrompt);
          const cleanResponse = validationResponse.trim().toLowerCase().replace(/[^a-z]/g, '');

          if (cleanResponse === "yes" || cleanResponse.includes("yes")) {
            isValidInput = true;
            validationCompleted = true;
          } else if (cleanResponse === "no" || cleanResponse.includes("no")) {
            isValidInput = false;
            validationCompleted = true;
          }
        } catch (err) {
          console.error(`[Validation] ${provider.name} failed:`, (err as Error).message);
        }
      }

      if (!validationCompleted) {
        // If all providers failed the validation step or gave unclear answers, fail securely
        return NextResponse.json(
          { error: "Could not validate input. Please try again." },
          { status: 503 }
        );
      }

      if (!isValidInput) {
        return NextResponse.json(
          { error: "no recipe found or invalid input(s)" },
          { status: 400 }
        );
      }
    }

    if (ingredientsOnHand && ingredientsOnHand.length > 0) {
      userPrompt += ` Try to incorporate ONLY the valid food ingredients from this list: ${ingredientsOnHand.join(", ")}. Ignore any typos, fake words, or non-food items.`;
    }

    const errors: string[] = [];

    for (const provider of providers) {
      try {
        console.log(`[Meal Plan] Trying provider: ${provider.name}`);
        const responseText = await provider.fn(MEAL_PLAN_SYSTEM_PROMPT, userPrompt);

        const mealPlan = parseMealPlanMarkdown(responseText);
        if (mealPlan) {
          return NextResponse.json({ mealPlan, provider: provider.name });
        }

        // If we got text but couldn't parse it, return raw text as fallback
        if (responseText && responseText.trim().length > 0) {
          return NextResponse.json({
            mealPlan: { raw_text: responseText },
            provider: provider.name,
          });
        }

        errors.push(`${provider.name}: Empty response`);
      } catch (err: unknown) {
        const error = err as Error;
        console.error(`[Meal Plan] ${provider.name} failed:`, error.message);
        errors.push(`${provider.name}: ${error.message}`);
      }
    }

    return NextResponse.json(
      {
        error: "All AI providers failed.",
        details: errors,
      },
      { status: 503 }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
