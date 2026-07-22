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
import { SavedRecipe, SavedMealPlan } from "@/types";
import Link from "next/link";
import toast from "react-hot-toast";

import SavedRecipeList from "@/components/SavedRecipeList";
import SavedMealPlanList from "@/components/SavedMealPlanList";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

export default function SavedRecipesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Recipes State
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [recipeToDelete, setRecipeToDelete] = useState<SavedRecipe | null>(null);
  const [pendingRecipeDeletes, setPendingRecipeDeletes] = useState<string[]>([]);

  // Meal Plans State
  const [mealPlans, setMealPlans] = useState<SavedMealPlan[]>([]);
  const [loadingMealPlans, setLoadingMealPlans] = useState(true);
  const [mealPlanToDelete, setMealPlanToDelete] = useState<SavedMealPlan | null>(null);
  const [pendingMealPlanDeletes, setPendingMealPlanDeletes] = useState<string[]>([]);

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

  const handleDeleteRecipe = async (recipe: SavedRecipe) => {
    if (!user) return;
    const { id } = recipe;
    
    setPendingRecipeDeletes(prev => [...prev, id]);

    const timeoutId = setTimeout(async () => {
      try {
        await deleteDoc(doc(db, "users", user.uid, "recipes", id));
        setPendingRecipeDeletes(prev => prev.filter(deleteId => deleteId !== id));
      } catch (err) {
        console.error("Delete recipe failed:", err);
        toast.error("Failed to delete recipe");
        setPendingRecipeDeletes(prev => prev.filter(deleteId => deleteId !== id));
      }
    }, 6000);

    toast.success(
      (t) => (
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="font-medium text-slate-100">Recipe deleted</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="relative flex items-center justify-center w-6 h-6">
              <svg className="w-6 h-6 -rotate-90 absolute" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-slate-600/50" />
                <circle
                  cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="none"
                  className="text-cyan-500"
                  style={{ strokeDasharray: 62.8, animation: 'countdown 6s linear forwards' }}
                />
              </svg>
            </div>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                clearTimeout(timeoutId);
                setPendingRecipeDeletes(prev => prev.filter(deleteId => deleteId !== id));
                toast.success("Recipe restored!");
              }}
              className="px-3 py-1.5 bg-slate-700/80 hover:bg-slate-600 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            >
              Undo
            </button>
          </div>
        </div>
      ),
      { duration: 6000, style: { minWidth: '320px', padding: '16px' } }
    );
  };

  const handleDeleteMealPlan = async (plan: SavedMealPlan) => {
    if (!user) return;
    const { id } = plan;

    setPendingMealPlanDeletes(prev => [...prev, id]);

    const timeoutId = setTimeout(async () => {
      try {
        await deleteDoc(doc(db, "users", user.uid, "mealPlans", id));
        setPendingMealPlanDeletes(prev => prev.filter(deleteId => deleteId !== id));
      } catch (err) {
        console.error("Delete meal plan failed:", err);
        toast.error("Failed to delete meal plan");
        setPendingMealPlanDeletes(prev => prev.filter(deleteId => deleteId !== id));
      }
    }, 6000);

    toast.success(
      (t) => (
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="font-medium text-slate-100">Meal plan deleted</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="relative flex items-center justify-center w-6 h-6">
              <svg className="w-6 h-6 -rotate-90 absolute" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-slate-600/50" />
                <circle
                  cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="none"
                  className="text-cyan-500"
                  style={{ strokeDasharray: 62.8, animation: 'countdown 6s linear forwards' }}
                />
              </svg>
            </div>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                clearTimeout(timeoutId);
                setPendingMealPlanDeletes(prev => prev.filter(deleteId => deleteId !== id));
                toast.success("Meal plan restored!");
              }}
              className="px-3 py-1.5 bg-slate-700/80 hover:bg-slate-600 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            >
              Undo
            </button>
          </div>
        </div>
      ),
      { duration: 6000, style: { minWidth: '320px', padding: '16px' } }
    );
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
        <SavedRecipeList
          recipes={recipes.filter(r => !pendingRecipeDeletes.includes(r.id))}
          loading={loadingRecipes}
          onDeleteRequest={setRecipeToDelete}
        />
      ) : (
        <SavedMealPlanList
          mealPlans={mealPlans.filter(p => !pendingMealPlanDeletes.includes(p.id))}
          loading={loadingMealPlans}
          onDeleteRequest={setMealPlanToDelete}
        />
      )}

      {/* Delete Confirmation Modals */}
      <DeleteConfirmModal
        isOpen={!!recipeToDelete}
        title="Delete Recipe?"
        message={`Are you sure you want to delete "${recipeToDelete?.title || 'this recipe'}"? You will have a few seconds to undo this action afterwards.`}
        onCancel={() => setRecipeToDelete(null)}
        onConfirm={() => {
          if (recipeToDelete) handleDeleteRecipe(recipeToDelete);
          setRecipeToDelete(null);
        }}
      />

      <DeleteConfirmModal
        isOpen={!!mealPlanToDelete}
        title="Delete Meal Plan?"
        message={`Are you sure you want to delete this ${mealPlanToDelete?.preferences?.diet || "Standard"} meal plan? You will have a few seconds to undo this action afterwards.`}
        onCancel={() => setMealPlanToDelete(null)}
        onConfirm={() => {
          if (mealPlanToDelete) handleDeleteMealPlan(mealPlanToDelete);
          setMealPlanToDelete(null);
        }}
      />
    </div>
  );
}
