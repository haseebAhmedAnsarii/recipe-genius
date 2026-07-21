import { SavedMealPlan } from "@/types";
import { useState } from "react";
import MealPlanCalendar from "@/components/MealPlanCalendar";
import { MealPlanListSkeleton } from "@/components/RecipeCardSkeleton";
import Link from "next/link";

interface Props {
  mealPlans: SavedMealPlan[];
  loading: boolean;
  onDeleteRequest: (plan: SavedMealPlan) => void;
}

export default function SavedMealPlanList({ mealPlans, loading, onDeleteRequest }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) return <MealPlanListSkeleton />;

  if (mealPlans.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        {mealPlans.length} plan{mealPlans.length !== 1 ? "s" : ""} saved
      </p>
      <div className="grid grid-cols-1 gap-6">
        {mealPlans.map((plan) => (
          <div key={plan.id} className="animate-in">
            {expandedId === plan.id ? (
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
                    onClick={() => setExpandedId(null)}
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
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target === e.currentTarget) setExpandedId(plan.id);
                }}
                onClick={() => setExpandedId(plan.id)}
                className="bg-slate-800 rounded-2xl shadow-md border border-slate-700 p-5 cursor-pointer hover:shadow-xl hover:shadow-black/30 hover:border-cyan-800/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all group"
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
                    onClick={(e) => { e.stopPropagation(); onDeleteRequest(plan); }}
                    aria-label={`Delete ${plan.preferences?.diet || "Standard"} plan`}
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
  );
}
