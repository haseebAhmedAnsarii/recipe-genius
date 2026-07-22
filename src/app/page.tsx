"use client";

import { useState } from "react";
import IngredientInput from "@/components/IngredientInput";
import { useAIGeneration } from "@/hooks/useAIGeneration";
import RecipeCard from "@/components/RecipeCard";
import { Recipe } from "@/types";
import RecipeCardSkeleton from "@/components/RecipeCardSkeleton";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

export default function HomePage() {
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const {
    data: recipe,
    loading,
    error,
    provider,
    saving,
    isSaved,
    generate,
    save
  } = useAIGeneration<Recipe>();

  const handleAddIngredient = (ingredient: string) => {
    setIngredients((prev) => [...prev, ingredient]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const generateRecipe = async () => {
    if (ingredients.length === 0) return;
    await generate("/api/generate-recipe", { ingredients }, "recipe");
  };

  const saveRecipe = async () => {
    if (!user || !recipe) return;
    await save(
      async () => {
        await addDoc(collection(db, "users", user.uid, "recipes"), {
          ...recipe,
          provider,
          ingredients_used: ingredients,
          created_at: serverTimestamp(),
        });
      },
      "Recipe Saved to Favorites!",
      "Failed to save recipe"
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-900/30 text-cyan-400 text-xs font-semibold rounded-full mb-4 border border-cyan-800/50">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          AI-Powered Recipe Generation
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-teal-400 mb-3">
          What&apos;s in Your Kitchen?
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Add the ingredients you have on hand, and our AI will create a
          delicious recipe just for you.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6 sm:p-8 mb-6">
        <IngredientInput
          ingredients={ingredients}
          onAdd={handleAddIngredient}
          onRemove={handleRemoveIngredient}
          disabled={loading}
        />

        <button
          onClick={generateRecipe}
          disabled={ingredients.length === 0 || loading}
          className="mt-6 w-full py-4 bg-teal-500 text-white font-bold text-base rounded-xl hover:shadow-xl hover:shadow-cyan-900/40 hover:scale-[1.02] cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating recipe...
            </>
          ) : (
            <>✨ Generate Recipe</>
          )}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="animate-in fade-in duration-300 mb-6">
          <div className="mb-4 text-center">
            <p className="text-slate-300 font-medium animate-pulse">🤖 Consulting our AI chef...</p>
          </div>
          <RecipeCardSkeleton />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border-2 border-red-800/50 rounded-2xl p-6 mb-6 animate-in">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-bold text-red-400 mb-1">Oops, our chef dropped the pan. Please try generating again!</h3>
              <p className="text-red-300/80 text-sm whitespace-pre-wrap">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Result */}
      {recipe && !loading && (
        <div className="animate-in">
          <RecipeCard
            recipe={recipe}
            onSave={user ? saveRecipe : undefined}
            isSaved={isSaved}
            saving={saving}
          />
          {!user && (
            <p className="text-center text-sm text-slate-500 mt-4">
              💡 Sign in to save recipes to your favorites
            </p>
          )}
        </div>
      )}
    </div>
  );
}
