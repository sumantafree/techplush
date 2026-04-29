import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "@/components/session-provider";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TechPulse – Daily Tech Intelligence Dashboard",
    template: "%s | TechPulse",
  },
  description:
    "Stay ahead in tech. Daily curated dashboard for AI, marketing, social media, research papers, and tech's impact on human life.",
  keywords: ["tech news", "AI", "digital marketing", "research", "dashboard"],
  authors: [{ name: "TechPulse" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "TechPulse – Daily Tech Intelligence Dashboard",
    description: "Your morning briefing on everything tech.",
    siteName: "TechPulse",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechPulse",
    description: "Daily tech intelligence dashboard for creators & bloggers.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="antialiased">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
