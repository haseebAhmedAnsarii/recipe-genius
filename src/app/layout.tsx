import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "RecipeGenius – Smart Recipe Generator & Meal Planner",
  description:
    "Generate delicious recipes from your ingredients using AI. Plan your weekly meals effortlessly with RecipeGenius.",
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
          <Header />
          <main className="pt-20 min-h-screen">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
