"use client";

import { useState } from "react";

import { Recipe } from "@/types";

interface RecipeCardProps {
  recipe: Recipe;
  onSave?: () => void;
  isSaved?: boolean;
  saving?: boolean;
  onDelete?: () => void;
}

export default function RecipeCard({ recipe, onSave, isSaved, saving, onDelete }: RecipeCardProps) {

  if (recipe.raw_text) {
    return (
      <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
        <div className="p-6 sm:p-8">
          <h3 className="text-xl font-bold text-slate-100 mb-4">Generated Recipe</h3>
          <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-slate-300">
            {recipe.raw_text}
          </div>
        </div>
      </div>
    );
  }

  const tips = Array.isArray(recipe.tips) ? recipe.tips : recipe.tips ? [recipe.tips] : [];

  return (
    <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden hover:shadow-2xl hover:shadow-black/30 hover:border-slate-600 transition-all duration-300">
      {/* Header */}
      <div className="bg-teal-600 px-6 sm:px-8 py-6">
        <h3 className="text-2xl font-bold text-white">{recipe.title}</h3>
        <p className="text-cyan-100 mt-1 text-sm leading-relaxed">{recipe.description}</p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-900/20 rounded-xl p-4 text-center border border-amber-800/30">
            <p className="text-2xl mb-1">⏱️</p>
            <p className="text-sm font-semibold text-amber-300">{recipe.cooking_time}</p>
            <p className="text-xs text-amber-600">Cooking Time</p>
          </div>
          <div className="bg-cyan-900/20 rounded-xl p-4 text-center border border-cyan-800/30">
            <p className="text-2xl mb-1">👥</p>
            <p className="text-sm font-semibold text-cyan-300">{recipe.servings} servings</p>
            <p className="text-xs text-cyan-700">Yield</p>
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <h4 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-emerald-900/40 border border-emerald-800/40 rounded-lg flex items-center justify-center text-sm">🥬</span>
            Ingredients
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recipe.ingredients?.map((ing, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300 bg-slate-700/50 rounded-lg px-3 py-2 border border-slate-600/30">
                <span className="text-emerald-400 mt-0.5">●</span>
                <span>
                  <strong className="text-slate-100">{ing.quantity} {ing.unit}</strong>{" "}{ing.name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions with typing effect */}
        <div>
          <h4 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-cyan-900/40 border border-cyan-800/40 rounded-lg flex items-center justify-center text-sm">📋</span>
            Instructions
          </h4>
          <ol className="space-y-3">
            {recipe.instructions?.map((instruction, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-teal-500 text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-300 leading-relaxed pt-1">{instruction}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Nutrition */}
        {recipe.nutrition && (
          <div>
            <h4 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-violet-900/40 border border-violet-800/40 rounded-lg flex items-center justify-center text-sm">📊</span>
              Nutrition per Serving
            </h4>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-orange-900/20 rounded-xl p-3 text-center border border-orange-800/30">
                <p className="text-lg font-bold text-orange-400">{recipe.nutrition.calories}</p>
                <p className="text-xs text-orange-600">Calories</p>
              </div>
              <div className="bg-red-900/20 rounded-xl p-3 text-center border border-red-800/30">
                <p className="text-lg font-bold text-red-400">{recipe.nutrition.protein_g}g</p>
                <p className="text-xs text-red-600">Protein</p>
              </div>
              <div className="bg-yellow-900/20 rounded-xl p-3 text-center border border-yellow-800/30">
                <p className="text-lg font-bold text-yellow-400">{recipe.nutrition.carbs_g}g</p>
                <p className="text-xs text-yellow-600">Carbs</p>
              </div>
              <div className="bg-violet-900/20 rounded-xl p-3 text-center border border-violet-800/30">
                <p className="text-lg font-bold text-violet-400">{recipe.nutrition.fat_g}g</p>
                <p className="text-xs text-violet-600">Fat</p>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        {tips.length > 0 && (
          <div className="bg-amber-900/20 border border-amber-800/40 rounded-xl p-4">
            <h4 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-1.5">💡 Pro Tips</h4>
            {tips.map((tip, i) => (
              <p key={i} className="text-sm text-amber-300/80 leading-relaxed">{tip}</p>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {onSave && (
            <button
              onClick={onSave}
              disabled={isSaved || saving}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 ${isSaved
                ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800/50"
                : "bg-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-900/50"
                } disabled:opacity-70`}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : isSaved ? "✓ Saved to Favorites" : "❤️ Save to Favorites"}
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-3 rounded-xl font-semibold text-sm text-red-400 bg-red-900/20 border border-red-800/30 cursor-pointer hover:bg-red-900/40 hover:scale-[1.03] hover:shadow-lg hover:shadow-red-900/20 transition-all active:scale-[0.98]"
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
