"use client";



import { MealPlanDays } from "@/types";

interface MealPlanCalendarProps {
  days: MealPlanDays;
}

const DAY_COLORS: Record<string, { bg: string; border: string; header: string; text: string; badge: string }> = {
  "Day 1": { bg: "bg-cyan-900/20", border: "border-cyan-800/40", header: "bg-cyan-700", text: "text-cyan-400", badge: "bg-cyan-900/40" },
  "Day 2": { bg: "bg-violet-900/20", border: "border-violet-800/40", header: "bg-violet-700", text: "text-violet-400", badge: "bg-violet-900/40" },
  "Day 3": { bg: "bg-amber-900/20", border: "border-amber-800/40", header: "bg-amber-700", text: "text-amber-400", badge: "bg-amber-900/40" },
};

const DAYS_ORDER = ["Day 1", "Day 2", "Day 3"];

export default function MealPlanCalendar({ days }: MealPlanCalendarProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {DAYS_ORDER.map((day) => {
          const meal = days[day];
          if (!meal) return null;

          const colors = DAY_COLORS[day] || DAY_COLORS["Day 1"];

          return (
            <div
              key={day}
              className={`rounded-2xl border-2 ${colors.border} ${colors.bg} overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/30`}
            >
              {/* Day Header */}
              <div className={`${colors.header} px-4 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className="text-white/80 text-lg">🍽️</span>
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">{day}</h3>
                </div>
                <span className="text-white/60 text-xs">Dinner</span>
              </div>

              {/* Meal Content */}
              <div className="p-4">
                <h4 className={`font-bold ${colors.text} text-base mb-1`}>{meal.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{meal.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
