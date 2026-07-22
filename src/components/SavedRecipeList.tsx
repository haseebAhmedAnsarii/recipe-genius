import { SavedRecipe } from "@/types";
import { useState } from "react";
import RecipeCard from "@/components/RecipeCard";
import { RecipeListSkeleton } from "@/components/RecipeCardSkeleton";
import Link from "next/link";

interface Props {
  recipes: SavedRecipe[];
  loading: boolean;
  onDeleteRequest: (recipe: SavedRecipe) => void;
}

export default function SavedRecipeList({ recipes, loading, onDeleteRequest }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) return <RecipeListSkeleton />;

  if (recipes.length === 0) {
    return (
      <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-12 text-center">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-xl font-bold text-slate-200 mb-2">No saved recipes yet</h3>
        <p className="text-slate-500 mb-6">Generate some recipes and save your favorites!</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-900/50 hover:scale-105 active:scale-95 transition-all"
        >
          ✨ Generate a Recipe
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} saved
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="animate-in">
            {expandedId === recipe.id ? (
              <RecipeCard 
                recipe={recipe} 
                onDelete={() => onDeleteRequest(recipe)} 
                onClose={() => setExpandedId(null)}
              />
            ) : (
              <div
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target === e.currentTarget) setExpandedId(recipe.id);
                }}
                onClick={() => setExpandedId(recipe.id)}
                className="bg-slate-800 rounded-2xl shadow-md border border-slate-700 p-6 sm:p-8 cursor-pointer hover:shadow-xl hover:shadow-black/30 hover:border-cyan-800/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-100 text-lg group-hover:text-cyan-400 transition-colors truncate">
                      {recipe.title || "Untitled Recipe"}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1 line-clamp-2">
                      {recipe.description || recipe.raw_text?.substring(0, 100)}
                    </p>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      {recipe.cooking_time && (
                        <span className="text-xs bg-amber-900/20 text-amber-400 border border-amber-800/30 px-2.5 py-1 rounded-full">
                          ⏱️ {recipe.cooking_time}
                        </span>
                      )}
                      {recipe.servings && (
                        <span className="text-xs bg-cyan-900/20 text-cyan-400 border border-cyan-800/30 px-2.5 py-1 rounded-full">
                          👥 {recipe.servings} servings
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteRequest(recipe); }}
                    aria-label={`Delete ${recipe.title || "recipe"}`}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 cursor-pointer hover:text-red-400 hover:bg-red-900/20 hover:scale-110 transition-all"
                    title="Delete recipe"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
