import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Osanka LM",
  description: "Fitness studio management",
};

// Root layout — html/body здесь, провайдеры в [locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
