import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/ui/auth-provider";
import { ToastProvider } from "@/components/ui/toast";
import PWAInstallBanner from "@/components/PWAInstallBanner";

export const viewport: Viewport = {
  themeColor: "#0A0F1E",
};

export const metadata: Metadata = {
  title: "StudyFlow — AI-Powered Study Task Manager",
  description: "Manage homework, assignments, and daily tasks with AI-powered scheduling",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "StudyFlow",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark"
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0A0F1E" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="StudyFlow" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0b0c16] text-white font-sans">
        <AuthProvider>
          <ToastProvider>
            {children}
            <PWAInstallBanner />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


