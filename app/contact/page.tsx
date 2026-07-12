"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/Card";
import Button from "@/components/Button";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Wire this up to an API route (e.g. app/api/contact/route.ts) that
    // emails you or writes to a `contact_messages` table in Supabase.
    toast.success("Message received — we'll get back to you soon.");
    setName("");
    setEmail("");
    setMessage("");
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-xl px-6 py-20">
        <h1 className="text-3xl font-extrabold">Contact us</h1>
        <p className="mt-3 text-text-secondary">Questions, feedback, partnership ideas — we read everything.</p>
        <Card className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="focus-ring w-full rounded-lg border border-white/10 bg-bg-secondary px-4 py-2.5 text-sm outline-none"
            />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="focus-ring w-full rounded-lg border border-white/10 bg-bg-secondary px-4 py-2.5 text-sm outline-none"
            />
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message"
              rows={5}
              className="focus-ring w-full rounded-lg border border-white/10 bg-bg-secondary p-3 text-sm outline-none"
            />
            <Button type="submit">Send Message</Button>
          </form>
        </Card>
      </main>
      <Footer />
    </>
  );
}
