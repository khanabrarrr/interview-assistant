import Sidebar from "@/components/Sidebar";
import Card from "@/components/Card";

const stats = [
  { label: "Resume Score", value: "82", suffix: "/100" },
  { label: "Interview Readiness", value: "68", suffix: "%" },
  { label: "Practice Days", value: "12", suffix: " days" },
  { label: "Interviews Completed", value: "7", suffix: "" },
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10">
        <h1 className="text-2xl font-extrabold">Welcome back 👋</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Here&apos;s where your placement prep stands today.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <p className="text-sm text-text-secondary">{s.label}</p>
              <p className="mt-2 text-3xl font-extrabold">
                {s.value}
                <span className="text-base font-medium text-text-secondary">{s.suffix}</span>
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h2 className="font-semibold">Weak Areas</h2>
            <ul className="mt-4 space-y-2 text-sm text-text-secondary">
              <li>• System design fundamentals</li>
              <li>• STAR-method storytelling in behavioral rounds</li>
              <li>• SQL query optimization</li>
            </ul>
            <h2 className="mt-6 font-semibold">Strong Skills</h2>
            <ul className="mt-4 space-y-2 text-sm text-text-secondary">
              <li>• React &amp; frontend fundamentals</li>
              <li>• Data structures &amp; algorithms</li>
              <li>• Clear, confident communication</li>
            </ul>
          </Card>

          <Card>
            <h2 className="font-semibold">Daily Goal</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Complete 1 mock interview + review 5 flashcards.
            </p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-2/3 rounded-full bg-accent" />
            </div>
            <p className="mt-2 text-xs text-text-secondary">2/3 tasks complete</p>
          </Card>
        </div>

        <Card className="mt-6">
          <h2 className="font-semibold">Recent Activity</h2>
          <ul className="mt-4 divide-y divide-white/5 text-sm">
            <li className="flex items-center justify-between py-3">
              <span className="text-text-secondary">Completed Technical mock interview — Backend Developer</span>
              <span className="text-xs text-text-secondary">2h ago</span>
            </li>
            <li className="flex items-center justify-between py-3">
              <span className="text-text-secondary">Analyzed resume — score improved to 82</span>
              <span className="text-xs text-text-secondary">Yesterday</span>
            </li>
            <li className="flex items-center justify-between py-3">
              <span className="text-text-secondary">Matched resume to Frontend Engineer JD — 76% match</span>
              <span className="text-xs text-text-secondary">2 days ago</span>
            </li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
