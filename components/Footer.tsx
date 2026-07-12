import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-bg-secondary">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <p className="text-lg font-extrabold">
              Placement<span className="text-accent">AI</span>
            </p>
            <p className="mt-3 text-sm text-text-secondary">
              AI-powered interview prep for students and job seekers.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">Product</p>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
              <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">Company</p>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">Legal</p>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/5 pt-6 text-center text-xs text-text-secondary">
          © {new Date().getFullYear()} PlacementAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
