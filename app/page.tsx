import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Link from "next/link";
import {
  FileText,
  Target,
  MessagesSquare,
  Sparkles,
  TrendingUp,
  Map,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Resume Analyzer",
    desc: "Upload your resume and get an ATS score, strengths, weaknesses, and keyword gaps in seconds.",
  },
  {
    icon: Target,
    title: "Job Match Scoring",
    desc: "Paste any job description and see exactly how well you match — and what to fix.",
  },
  {
    icon: MessagesSquare,
    title: "AI Mock Interviews",
    desc: "Practice HR, technical, and behavioral rounds with an AI that scores confidence and relevance.",
  },
  {
    icon: Sparkles,
    title: "Answer Improvement",
    desc: "Turn any rough answer into a polished, STAR-method response instantly.",
  },
  {
    icon: Map,
    title: "Placement Roadmap",
    desc: "A personalized day-by-day plan built from your degree, skills, and goals.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    desc: "Watch your readiness score climb with every session, question, and revision.",
  },
];

const steps = [
  { title: "Upload your resume", desc: "We parse your skills, projects, and experience automatically." },
  { title: "Get matched to roles", desc: "Paste a JD or pick a target role to see your fit score." },
  { title: "Practice with AI", desc: "Run mock interviews and get instant, specific feedback." },
  { title: "Track your growth", desc: "Follow your roadmap and watch your readiness score improve." },
];

const testimonials = [
  {
    name: "Ananya R.",
    role: "Final-year CS student",
    quote: "The mock interviews felt closer to my actual placement round than any prep book.",
  },
  {
    name: "Rohit K.",
    role: "Fresher, backend developer",
    quote: "My resume score went from 58 to 89 after following the suggested fixes.",
  },
  {
    name: "Priya S.",
    role: "MBA graduate",
    quote: "Having a clear daily roadmap made a chaotic placement season feel manageable.",
  },
];

const faqs = [
  { q: "Is my resume data kept private?", a: "Yes. Your documents are stored securely and never shared with third parties." },
  { q: "Which file formats can I upload?", a: "PDF and DOCX resumes are both supported." },
  { q: "Can I cancel Premium anytime?", a: "Yes, you can cancel from your profile settings at any time — no lock-in." },
  { q: "Does this work for non-technical roles?", a: "Yes, HR, behavioral, and role-specific question sets cover both technical and non-technical placements." },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-20 pb-28">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, rgba(29,185,84,0.14) 0%, rgba(10,10,10,0) 70%)",
          }}
        />
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-block rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent">
            Built for placement season
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Walk into every interview
            <br />
            <span className="text-accent">already prepared.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
            AI-powered resume scoring, job matching, and mock interviews —
            built for students and job seekers who want a real edge.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button className="px-8 py-4 text-base">Get Started — it&apos;s free</Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="secondary" className="px-8 py-4 text-base">
                See how it works
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">Everything you need to prep</h2>
            <p className="mt-4 text-text-secondary">
              One platform for resumes, interviews, and the roadmap that connects them.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="transition hover:border-accent/30">
                <f.icon className="mb-4 text-accent" size={28} />
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-bg-secondary px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">How it works</h2>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                  {i + 1}
                </div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-extrabold sm:text-4xl">
            Trusted by students preparing for placements
          </h2>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name}>
                <p className="text-sm leading-relaxed text-text-secondary">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6">
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-text-secondary">{t.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-extrabold sm:text-4xl">
            Frequently asked questions
          </h2>
          <div className="mt-12 space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-xl2 border border-white/5 bg-card p-5">
                <summary className="focus-ring cursor-pointer list-none text-sm font-semibold text-white">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm text-text-secondary">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="px-6 pb-24">
        <Card className="mx-auto max-w-4xl text-center" glass>
          <h2 className="text-2xl font-extrabold sm:text-3xl">Ready to prep smarter?</h2>
          <p className="mx-auto mt-3 max-w-md text-text-secondary">
            Join free and run your first resume analysis in under two minutes.
          </p>
          <Link href="/signup">
            <Button className="mt-8 px-8 py-4 text-base">Get Started</Button>
          </Link>
        </Card>
      </section>

      <Footer />
    </>
  );
}
