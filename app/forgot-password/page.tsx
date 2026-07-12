"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import Card from "@/components/Card";
import Button from "@/components/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Reset link sent — check your inbox.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-extrabold">Reset your password</h1>
        <p className="mt-1 text-sm text-text-secondary">
          We&apos;ll email you a link to set a new password.
        </p>
        {sent ? (
          <p className="mt-6 text-sm text-accent">Check your email for the reset link.</p>
        ) : (
          <form onSubmit={handleReset} className="mt-6 space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="focus-ring w-full rounded-lg border border-white/10 bg-bg-secondary px-4 py-2.5 text-sm outline-none"
            />
            <Button type="submit" className="w-full">
              Send Reset Link
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
