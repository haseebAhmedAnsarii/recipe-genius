import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";
import OfflineDetector from "@/components/OfflineDetector";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

import { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  title: "RecipeGenius – Smart Recipe Generator & Meal Planner",
  description:
    "Generate delicious recipes from your ingredients using AI. Plan your weekly meals effortlessly with RecipeGenius.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RecipeGenius",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-pattern">
        <AuthProvider>
          <OfflineDetector />
          <Header />
          <main className="pt-20 min-h-screen">{children}</main>
        </AuthProvider>
        <Toaster 
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
