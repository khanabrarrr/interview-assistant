import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-3xl font-extrabold">Terms &amp; Conditions</h1>
        <p className="mt-4 text-sm text-text-secondary">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-text-secondary">
          <p>
            This placeholder should be replaced with counsel-reviewed terms before launch. It should cover
            acceptable use, account responsibilities, subscription billing and cancellation, AI-generated
            content disclaimers (interview feedback is guidance, not a guarantee of employment outcomes),
            intellectual property, limitation of liability, and termination.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
