"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { useState } from "react";

export default function Header() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      setShowAuthModal(false);
      setEmail("");
      setPassword("");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setAuthError(error.message || "Authentication failed");
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-cyan-500 rounded-xl flex items-center justify-center shadow-md shadow-cyan-900/50 group-hover:shadow-cyan-800/60 transition-shadow">
                <span className="text-white text-lg">🍳</span>
              </div>
              <span className="text-xl font-bold text-cyan-400">
                RecipeGenius
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all"
              >
                Recipe Generator
              </Link>
              <Link
                href="/meal-plan"
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all"
              >
                Meal Planner
              </Link>
              {user && (
                <Link
                  href="/saved"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all"
                >
                  Saved Collection
                </Link>
              )}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
              ) : user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full ring-2 ring-cyan-800"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <span className="text-sm text-slate-300 max-w-[120px] truncate">
                      {user.displayName || user.email}
                    </span>
                  </div>
                  <button
                    onClick={signOut}
                    className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-900/20 hover:scale-105 cursor-pointer rounded-lg transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-cyan-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-900/50 hover:scale-105 cursor-pointer transition-all active:scale-95"
                >
                  Sign In
                </button>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 pt-2 border-t border-slate-700 animate-in slide-in-from-top">
              <nav className="flex flex-col gap-1">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all"
                >
                  🍳 Recipe Generator
                </Link>
                <Link
                  href="/meal-plan"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all"
                >
                  📅 Meal Plan
                </Link>
                {user && (
                  <Link
                    href="/saved"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all"
                  >
                    ❤️ Saved Recipes
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-md overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-cyan-600 px-6 py-8 text-center">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">🍳</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-cyan-100 text-sm mt-1">
                {isSignUp ? "Join RecipeGenius today" : "Sign in to save your recipes"}
              </p>
            </div>

            <div className="p-6">
              {/* Google Sign In */}
              <button
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                    setShowAuthModal(false);
                  } catch (err: unknown) {
                    const error = err as { message?: string };
                    setAuthError(error.message || "Google sign-in failed");
                  }
                }}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-slate-600 rounded-xl hover:bg-slate-800 hover:border-slate-500 hover:scale-[1.02] cursor-pointer transition-all font-medium text-slate-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-sm text-slate-500">or</span>
                <div className="flex-1 h-px bg-slate-700" />
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-600 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-900/30 transition-all"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-600 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-900/30 transition-all"
                />
                {authError && (
                  <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 px-3 py-2 rounded-lg">{authError}</p>
                )}
                <button
                  type="submit"
                  className="w-full py-3 bg-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-900/50 hover:scale-[1.02] cursor-pointer transition-all active:scale-[0.98]"
                >
                  {isSignUp ? "Create Account" : "Sign In"}
                </button>
              </form>

              {/* Toggle */}
              <p className="text-center text-sm text-slate-500 mt-4">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  onClick={() => { setIsSignUp(!isSignUp); setAuthError(""); }}
                  className="text-cyan-400 font-semibold hover:underline"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </p>

              {/* Close */}
              <button
                onClick={() => { setShowAuthModal(false); setAuthError(""); setEmail(""); setPassword(""); }}
                className="w-full mt-3 py-2 text-sm text-slate-600 hover:text-slate-400 hover:scale-105 cursor-pointer transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
