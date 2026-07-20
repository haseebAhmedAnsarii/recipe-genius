"use client";

import { useState, useRef } from "react";

interface IngredientInputProps {
  ingredients: string[];
  onAdd: (ingredient: string) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export default function IngredientInput({
  ingredients,
  onAdd,
  onRemove,
  disabled = false,
}: IngredientInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed && !ingredients.includes(trimmed.toLowerCase())) {
      onAdd(trimmed.toLowerCase());
      setInput("");
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type an ingredient (e.g., chicken, tomatoes, basil)..."
            disabled={disabled}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border-2 border-slate-600 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-900/30 transition-all disabled:opacity-50"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!input.trim() || disabled}
          className="px-6 py-3.5 bg-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-900/50 transition-all active:scale-95 disabled:opacity-50 disabled:hover:shadow-none disabled:active:scale-100 whitespace-nowrap"
        >
          <span className="hidden sm:inline">+ Add</span>
          <span className="sm:hidden">+</span>
        </button>
      </div>

      {/* Ingredient Tags */}
      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ingredient, index) => (
            <span
              key={index}
              className="group inline-flex items-center gap-1.5 px-3.5 py-2 bg-cyan-900/30 text-cyan-400 text-sm font-medium rounded-xl border border-cyan-800/50 hover:bg-cyan-900/50 transition-all animate-in fade-in zoom-in-95"
            >
              {ingredient}
              <button
                onClick={() => onRemove(index)}
                disabled={disabled}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-cyan-800/60 text-cyan-600 hover:text-cyan-300 transition-all"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {ingredients.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-4 border-2 border-dashed border-slate-700 rounded-xl">
          🥘 Add ingredients you have on hand to generate a recipe
        </p>
      )}
    </div>
  );
}
