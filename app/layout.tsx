import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "AceInterview — Your AI Interview Coach",
  description:
    "AI-powered resume analysis, job matching, and mock interviews for students and job seekers preparing for placements.",
  keywords: [
    "AI interview assistant",
    "resume analyzer",
    "placement preparation",
    "mock interview AI",
    "job description matcher",
  ],
  openGraph: {
    title: "AceInterview — Your AI Interview Coach",
    description:
      "Practice smarter with AI mock interviews, resume scoring, and personalized placement roadmaps.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg text-white antialiased">
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#1E1E1E",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.08)",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
