import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/Card";

const topics = [
  { q: "How do I upload my resume?", a: "Go to Resume Analyzer, click the upload area, and choose a .txt, .pdf, or .docx file." },
  { q: "How does the mock interview work?", a: "Pick a role, level, type, and difficulty. The AI asks one question at a time and gives feedback after each answer." },
  { q: "Can I export my notes?", a: "Not yet — this is a good first feature to add via a new /api/notes/export route." },
  { q: "How do I upgrade to Premium?", a: "Visit the Pricing section on the homepage and select the Premium plan." },
];

export default function HelpPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-3xl font-extrabold">Help Center</h1>
        <div className="mt-8 space-y-4">
          {topics.map((t) => (
            <Card key={t.q}>
              <h3 className="font-semibold">{t.q}</h3>
              <p className="mt-2 text-sm text-text-secondary">{t.a}</p>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
