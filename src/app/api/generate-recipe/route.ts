import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const RECIPE_SYSTEM_PROMPT = `You are a professional chef and recipe creator. Given a list of ingredients, create a delicious recipe using those ingredients. You may add common pantry staples (salt, pepper, oil, etc.) if needed.
CRITICAL INSTRUCTION: If any ingredient in the provided list is clearly a typo, a fake word (like keyboard mashing), or a non-food item, you MUST completely IGNORE it. Do not include it in the recipe, title, or instructions.

You MUST respond with ONLY Markdown in this exact format, no other text:

# Recipe Name
A brief appetizing description of the dish

**Time:** 30 minutes
**Servings:** 4

## Ingredients
- 1 cup ingredient name
- 2 tbsp another ingredient

## Instructions
1. Step 1 instruction
2. Step 2 instruction

## Nutrition
Calories: 350
Protein: 25g
Carbs: 30g
Fat: 12g

## Tips
A helpful cooking tip for this recipe`;

const VALIDATION_SYSTEM_PROMPT = `You are an expert culinary AI. Your task is to check the list of ingredients provided by the user.
If the list contains AT LEAST ONE valid, real food item, you MUST strickly respond with ONLY the one word "yes" (even if there are other fake or unrecognizable ingredients).
If ALL of the ingredients are completely fake, totally wrong, or unrecognizable, you MUST strickly respond with ONLY the one word "no".
Do not include any other text, punctuation, or explanation.`;

function parseRecipeMarkdown(text: string): Record<string, unknown> | null {
  try {
    const lines = text.split('\n').map(l => l.trim());
    const recipe: any = {
      ingredients: [],
      instructions: [],
      nutrition: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
      tips: ""
    };

    let currentSection = '';

    for (const line of lines) {
      if (line.startsWith('# ')) {
        recipe.title = line.replace('# ', '').trim();
        currentSection = 'description';
      } else if (line.startsWith('## Ingredients')) {
        currentSection = 'ingredients';
      } else if (line.startsWith('## Instructions')) {
        currentSection = 'instructions';
      } else if (line.startsWith('## Nutrition')) {
        currentSection = 'nutrition';
      } else if (line.startsWith('## Tips')) {
        currentSection = 'tips';
      } else if (line.startsWith('**Time:**')) {
        recipe.cooking_time = line.replace('**Time:**', '').trim();
      } else if (line.startsWith('**Servings:**')) {
        recipe.servings = parseInt(line.replace('**Servings:**', '').trim()) || 4;
      } else if (line.length > 0) {
        if (currentSection === 'description') {
          recipe.description = (recipe.description ? recipe.description + '\n' : '') + line;
        } else if (currentSection === 'ingredients' && line.startsWith('- ')) {
          const item = line.substring(2).trim();
          // Naive split: first word is quantity, second is unit, rest is name
          const parts = item.split(' ');
          if (parts.length >= 3 && /^[\d\./½¼¾]+/.test(parts[0])) {
            recipe.ingredients.push({ quantity: parts[0], unit: parts[1], name: parts.slice(2).join(' ') });
          } else {
            recipe.ingredients.push({ quantity: '', unit: '', name: item });
          }
        } else if (currentSection === 'instructions' && /^\d+\.\s/.test(line)) {
          recipe.instructions.push(line.replace(/^\d+\.\s/, '').trim());
        } else if (currentSection === 'nutrition') {
          if (line.startsWith('Calories:')) recipe.nutrition.calories = parseInt(line.replace('Calories:', '').trim()) || 0;
          if (line.startsWith('Protein:')) recipe.nutrition.protein_g = parseFloat(line.replace('Protein:', '').trim()) || 0;
          if (line.startsWith('Carbs:')) recipe.nutrition.carbs_g = parseFloat(line.replace('Carbs:', '').trim()) || 0;
          if (line.startsWith('Fat:')) recipe.nutrition.fat_g = parseFloat(line.replace('Fat:', '').trim()) || 0;
        } else if (currentSection === 'tips') {
          recipe.tips = (recipe.tips ? recipe.tips + '\n' : '') + line;
        }
      }
    }

    if (!recipe.title) return null;
    return recipe;
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
  const response = result.response;
  return response.text();
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
          max_new_tokens: 2048,
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
    const { ingredients } = await request.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: "Please provide at least one ingredient." },
        { status: 400 }
      );
    }

    // Step 1: Validate Ingredients
    const validationUserPrompt = `Ingredients to validate: ${ingredients.join(", ")}`;
    let isValidIngredients = false;
    let validationCompleted = false;

    for (const provider of providers) {
      if (validationCompleted) break;
      try {
        console.log(`[Validation] Trying provider: ${provider.name}`);
        const validationResponse = await provider.fn(VALIDATION_SYSTEM_PROMPT, validationUserPrompt);
        const cleanResponse = validationResponse.trim().toLowerCase().replace(/[^a-z]/g, '');


        if (cleanResponse === "yes" || cleanResponse.includes("yes")) {
          isValidIngredients = true;
          validationCompleted = true;
        } else if (cleanResponse === "no" || cleanResponse.includes("no")) {
          isValidIngredients = false;
          validationCompleted = true;
        }
      } catch (err) {
        console.error(`[Validation] ${provider.name} failed:`, (err as Error).message);
      }
    }

    if (!validationCompleted) {
      return NextResponse.json(
        { error: "Could not validate ingredients. Please try again." },
        { status: 503 }
      );
    }

    if (!isValidIngredients) {
      return NextResponse.json(
        { error: "no recipe found or invalid ingredient(s)" },
        { status: 400 }
      );
    }

    const userPrompt = `Create a recipe using ONLY the valid food ingredients from this list: ${ingredients.join(", ")}. If any item is a typo, fake word, or non-food item, completely IGNORE it and do NOT include it in your recipe. Remember to respond with ONLY Markdown format.`;

    const errors: string[] = [];

    for (const provider of providers) {
      try {
        console.log(`[Recipe] Trying provider: ${provider.name}`);
        const responseText = await provider.fn(RECIPE_SYSTEM_PROMPT, userPrompt);

        const recipe = parseRecipeMarkdown(responseText);
        if (recipe) {
          return NextResponse.json({ recipe, provider: provider.name });
        }

        // If we got text but couldn't parse it, return raw text as fallback
        if (responseText && responseText.trim().length > 0) {
          return NextResponse.json({
            recipe: { raw_text: responseText },
            provider: provider.name,
          });
        }

        errors.push(`${provider.name}: Empty response`);
      } catch (err: unknown) {
        const error = err as Error;
        console.error(`${provider.name} failed:`, error.message);
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
