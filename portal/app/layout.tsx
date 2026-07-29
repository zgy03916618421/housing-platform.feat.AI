import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Property Portal",
    template: "%s | Property Portal",
  },
  description:
    "A unified portal hosting two apps: Property Value Estimator (App 1) and Property Market Analysis (App 2).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* WCAG：跳转链接，键盘用户可跳过导航直达主内容 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-md focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main
          id="main-content"
          className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6"
        >
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
