import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-3xl font-extrabold">Privacy Policy</h1>
        <p className="mt-4 text-sm text-text-secondary">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-text-secondary">
          <p>
            This placeholder policy should be replaced with counsel-reviewed language before launch.
            It should cover what data is collected (account info, uploaded resumes, interview transcripts),
            how it is stored (Supabase, encrypted at rest), how long it is retained, whether it is used
            to improve AI models, and how users can request deletion.
          </p>
          <p>
            Include sections on: data we collect, how we use it, third-party processors (Google Gemini, Supabase),
            cookies, user rights (access, correction, deletion), data retention, children&apos;s privacy,
            and how to contact us about privacy concerns.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
