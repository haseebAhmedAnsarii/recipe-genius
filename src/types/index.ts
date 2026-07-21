export interface RecipeIngredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface RecipeNutrition {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface Recipe {
  title: string;
  description: string;
  cooking_time: string;
  servings: number | string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  nutrition: RecipeNutrition;
  tips: string | string[];
  raw_text?: string;
}

export interface MealNutrition {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface Meal {
  title: string;
  description: string;
}

export interface MealPlanDays {
  [day: string]: Meal;
}

export interface SavedRecipe extends Recipe {
  id: string;
  provider?: string;
  ingredients_used?: string[];
  created_at?: { seconds: number };
}

export interface SavedMealPlan {
  id: string;
  provider?: string;
  preferences?: {
    diet: string;
    targetCalories: number | string;
  };
  days?: Record<string, { title: string; description: string }>;
  raw_text?: string;
  created_at?: { seconds: number };
}

export interface MealPlanData {
  days?: Record<string, unknown>;
  raw_text?: string;
}
