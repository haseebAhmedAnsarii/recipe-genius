"use client";

import { useState } from "react";
import MealPlanCalendar from "@/components/MealPlanCalendar";
import { MealPlanCalendarSkeleton } from "@/components/RecipeCardSkeleton";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface MealPlanData {
  days?: Record<string, unknown>;
  raw_text?: string;
}

export default function MealPlanPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlanData | null>(null);
  const [error, setError] = useState("");
  const [provider, setProvider] = useState("");
  const [preferences, setPreferences] = useState("");
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const generateMealPlan = async () => {
    setLoading(true);
    setError("");
    setMealPlan(null);
    setProvider("");
    setIsSaved(false);

    try {
      const response = await fetch("/api/generate-meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: preferences || undefined }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error + (data.details ? "\n" + data.details.join("\n") : ""));
        return;
      }
      setMealPlan(data.mealPlan as MealPlanData);
      setProvider(data.provider || "");
    } catch (err: unknown) {
      const error = err as Error;
      setError("Failed to generate meal plan. " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveMealPlan = async () => {
    if (!user || !mealPlan) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "users", user.uid, "mealPlans"), {
        ...mealPlan,
        provider,
        preferences,
        created_at: serverTimestamp(),
      });
      setIsSaved(true);
    } catch (err: unknown) {
      const error = err as Error;
      setError("Failed to save meal plan: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-900/30 text-violet-400 text-xs font-semibold rounded-full mb-4 border border-violet-800/50">
          <span className="text-base">📅</span>
          3-Day Meal Planner
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-violet-400 mb-3">
          Plan Your Next 3 Days
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Let AI create a balanced 3-day dinner plan. Customize with dietary
          preferences for personalized meals.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6 sm:p-8 mb-8 max-w-2xl mx-auto">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Dietary Preferences (optional)
            </label>
            <input
              type="text"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="e.g., vegetarian, low-carb, Mediterranean, no dairy..."
              disabled={loading}
              className="w-full px-4 py-3.5 bg-slate-900 border-2 border-slate-600 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-900/30 transition-all disabled:opacity-50"
            />
          </div>

          <button
            onClick={generateMealPlan}
            disabled={loading}
            className="w-full py-4 bg-violet-600 text-white font-bold text-base rounded-xl hover:shadow-xl hover:shadow-violet-900/40 hover:scale-[1.02] cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating your meal plan...
              </>
            ) : (
              <>🗓️ Generate 3-Day Meal Plan</>
            )}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="animate-in fade-in duration-300 mb-6">
          <div className="mb-4 text-center">
            <p className="text-slate-300 font-medium animate-pulse">🧑‍🍳 Planning your next 3 days of dinners...</p>
          </div>
          <MealPlanCalendarSkeleton />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border-2 border-red-800/50 rounded-2xl p-6 mb-6 animate-in max-w-2xl mx-auto">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-bold text-red-400 mb-1">Generation Failed</h3>
              <p className="text-red-300/80 text-sm whitespace-pre-wrap">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Meal Plan Result */}
      {mealPlan && !loading && (
        <div className="animate-in">
          {mealPlan.raw_text ? (
            <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6 sm:p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-slate-100 mb-4">Your Meal Plan</h3>
              <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-slate-300">
                {mealPlan.raw_text}
              </div>
            </div>
          ) : mealPlan.days ? (
            <MealPlanCalendar days={mealPlan.days as Record<string, { title: string; description: string }>} />
          ) : null}

          {/* Save Button */}
          <div className="flex justify-center mt-8">
            {user ? (
              <button
                onClick={saveMealPlan}
                disabled={isSaved || saving}
                className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 ${isSaved
                    ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800/50"
                    : "bg-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-900/50"
                  } disabled:opacity-70`}
              >
                {saving ? "Saving..." : isSaved ? "✓ Saved to Meal Plans" : "💾 Save Meal Plan"}
              </button>
            ) : (
              <p className="text-sm text-slate-500">💡 Sign in to save meal plans</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
