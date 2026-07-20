"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import RecipeCard, { Recipe } from "@/components/RecipeCard";
import { RecipeListSkeleton, MealPlanListSkeleton } from "@/components/RecipeCardSkeleton";
import MealPlanCalendar from "@/components/MealPlanCalendar";
import Link from "next/link";
import toast from "react-hot-toast";

interface SavedRecipe extends Recipe {
  id: string;
  provider?: string;
  ingredients_used?: string[];
  created_at?: { seconds: number };
}

interface SavedMealPlan {
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

export default function SavedRecipesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Recipes State
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [recipeToDelete, setRecipeToDelete] = useState<SavedRecipe | null>(null);

  // Meal Plans State
  const [mealPlans, setMealPlans] = useState<SavedMealPlan[]>([]);
  const [loadingMealPlans, setLoadingMealPlans] = useState(true);
  const [expandedMealPlanId, setExpandedMealPlanId] = useState<string | null>(null);
  const [mealPlanToDelete, setMealPlanToDelete] = useState<SavedMealPlan | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<"recipes" | "mealPlans">("recipes");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "recipes"),
      orderBy("created_at", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recipeList: SavedRecipe[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SavedRecipe[];
      setRecipes(recipeList);
      setLoadingRecipes(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "mealPlans"),
      orderBy("created_at", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const planList: SavedMealPlan[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SavedMealPlan[];
      setMealPlans(planList);
      setLoadingMealPlans(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "recipes", recipeId));
      toast.success("Recipe deleted from Favorites");
    } catch (err) {
      console.error("Delete recipe failed:", err);
      toast.error("Failed to delete recipe");
    }
  };

  const handleDeleteMealPlan = async (planId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "mealPlans", planId));
      toast.success("Meal plan deleted");
    } catch (err) {
      console.error("Delete meal plan failed:", err);
      toast.error("Failed to delete meal plan");
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="spinner mx-auto" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-900/30 text-rose-400 text-xs font-semibold rounded-full mb-4 border border-rose-800/50">
          <span className="text-base">❤️</span>
          Your Collection
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-rose-400 mb-3">
          Saved Collection
        </h1>
        <p className="text-slate-400 text-lg">
          All your favorite AI-generated recipes and meal plans
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700/50 flex items-center gap-1 inline-flex">
          <button
            onClick={() => setActiveTab("recipes")}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "recipes"
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 cursor-pointer"
              }`}
          >
            Recipes
          </button>
          <button
            onClick={() => setActiveTab("mealPlans")}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "mealPlans"
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 cursor-pointer"
              }`}
          >
            Meal Plans
          </button>
        </div>
      </div>

      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-cyan-500 hover:text-cyan-300 hover:bg-cyan-900/20 px-3 py-1.5 rounded-lg transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Generator
        </Link>
      </div>

      {activeTab === "recipes" ? (
        loadingRecipes ? (
          <RecipeListSkeleton />
        ) : recipes.length === 0 ? (
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
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-slate-500">
              {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} saved
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="animate-in">
                  {expandedRecipeId === recipe.id ? (
                    <div>
                      <RecipeCard recipe={recipe} onDelete={() => setRecipeToDelete(recipe)} />
                      <button
                        onClick={() => setExpandedRecipeId(null)}
                        className="mt-2 w-full text-sm text-slate-600 hover:text-slate-400 py-2 transition-colors cursor-pointer"
                      >
                        Collapse
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => setExpandedRecipeId(recipe.id)}
                      className="bg-slate-800 rounded-2xl shadow-md border border-slate-700 p-5 cursor-pointer hover:shadow-xl hover:shadow-black/30 hover:border-cyan-800/50 transition-all group"
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
                          onClick={(e) => { e.stopPropagation(); setRecipeToDelete(recipe); }}
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
        )
      ) : (
        loadingMealPlans ? (
          <MealPlanListSkeleton />
        ) : mealPlans.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">No saved meal plans yet</h3>
            <p className="text-slate-500 mb-6">Generate a meal plan and save it for later!</p>
            <Link
              href="/meal-plan"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-900/50 hover:scale-105 active:scale-95 transition-all"
            >
              ✨ Generate Meal Plan
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-slate-500">
              {mealPlans.length} plan{mealPlans.length !== 1 ? "s" : ""} saved
            </p>
            <div className="grid grid-cols-1 gap-6">
              {mealPlans.map((plan) => (
                <div key={plan.id} className="animate-in">
                  {expandedMealPlanId === plan.id ? (
                    <div className="bg-slate-800 rounded-2xl shadow-md border border-slate-700 p-5">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="font-bold text-slate-100 text-xl">
                            {plan.preferences?.diet || "Standard"} Diet Plan
                          </h3>
                          <p className="text-slate-400 mt-1">
                            {plan.preferences?.targetCalories || "Any"} calories/day
                          </p>
                        </div>
                        <button
                          onClick={() => setExpandedMealPlanId(null)}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 hover:scale-105 cursor-pointer text-slate-200 rounded-lg text-sm transition-all"
                        >
                          Close
                        </button>
                      </div>

                      {plan.raw_text ? (
                        <div className="prose prose-invert prose-cyan max-w-none bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                          <div className="whitespace-pre-wrap text-slate-300 text-sm">{plan.raw_text}</div>
                        </div>
                      ) : plan.days ? (
                        <MealPlanCalendar days={plan.days as Record<string, { title: string; description: string }>} />
                      ) : null}
                    </div>
                  ) : (
                    <div
                      onClick={() => setExpandedMealPlanId(plan.id)}
                      className="bg-slate-800 rounded-2xl shadow-md border border-slate-700 p-5 cursor-pointer hover:shadow-xl hover:shadow-black/30 hover:border-cyan-800/50 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-100 text-lg group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                            <span>📅</span> {plan.preferences?.diet || "Standard"} Plan
                          </h3>
                          <div className="flex items-center gap-3 mt-3 flex-wrap">
                            <span className="text-xs bg-emerald-900/20 text-emerald-400 border border-emerald-800/30 px-2.5 py-1 rounded-full">
                              🔥 {plan.preferences?.targetCalories || "Any"} calories
                            </span>

                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setMealPlanToDelete(plan); }}
                          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 cursor-pointer hover:text-red-400 hover:bg-red-900/20 hover:scale-110 transition-all"
                          title="Delete plan"
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
        )
      )}

      {/* Delete Recipe Confirmation Modal */}
      {recipeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-100 mb-2">Delete Recipe?</h3>
            <p className="text-slate-400 mb-6">
              Are you sure you want to delete "{recipeToDelete.title || 'this recipe'}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRecipeToDelete(null)}
                className="px-4 py-2 rounded-xl font-medium text-slate-300 hover:bg-slate-700 hover:scale-105 cursor-pointer transition-all"
              >
                No, keep it
              </button>
              <button
                onClick={() => {
                  handleDeleteRecipe(recipeToDelete.id);
                  setRecipeToDelete(null);
                }}
                className="px-4 py-2 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 hover:scale-105 cursor-pointer transition-all shadow-lg shadow-red-500/20"
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Meal Plan Confirmation Modal */}
      {mealPlanToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-100 mb-2">Delete Meal Plan?</h3>
            <p className="text-slate-400 mb-6">
              Are you sure you want to delete this {mealPlanToDelete.preferences?.diet || "Standard"} meal plan? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setMealPlanToDelete(null)}
                className="px-4 py-2 rounded-xl font-medium text-slate-300 hover:bg-slate-700 hover:scale-105 cursor-pointer transition-all"
              >
                No, keep it
              </button>
              <button
                onClick={() => {
                  handleDeleteMealPlan(mealPlanToDelete.id);
                  setMealPlanToDelete(null);
                }}
                className="px-4 py-2 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 hover:scale-105 cursor-pointer transition-all shadow-lg shadow-red-500/20"
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
