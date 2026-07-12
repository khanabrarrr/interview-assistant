import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/Card";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-3xl font-extrabold">About PlacementAI</h1>
        <p className="mt-4 text-text-secondary">
          PlacementAI was built for one reason: placement season is stressful, and
          most prep resources are generic. We wanted something that reads your actual
          resume, matches it to real job descriptions, and runs interview practice
          that adapts to how you answer — not a static bank of questions.
        </p>
        <Card className="mt-8">
          <p className="text-text-secondary">
            The platform combines resume parsing, AI-driven feedback, and progress
            tracking so students and job seekers can walk into interviews with a
            clear sense of where they stand and what to fix next.
          </p>
        </Card>
      </main>
      <Footer />
    </>
  );
}
