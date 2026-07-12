"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";
import { Pin, Trash2, Search } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  created_at: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchNotes() {
    setLoading(true);
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setNotes(data as Note[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  async function handleAdd() {
    if (!title.trim()) {
      toast.error("Give the note a title.");
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in first.");
      return;
    }
    const { error } = await supabase
      .from("notes")
      .insert({ title, content, user_id: user.id, pinned: false });
    if (error) {
      toast.error(error.message);
      return;
    }
    setTitle("");
    setContent("");
    fetchNotes();
  }

  async function togglePin(note: Note) {
    await supabase.from("notes").update({ pinned: !note.pinned }).eq("id", note.id);
    fetchNotes();
  }

  async function deleteNote(id: string) {
    await supabase.from("notes").delete().eq("id", id);
    fetchNotes();
  }

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.content.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10">
        <h1 className="text-2xl font-extrabold">Notes</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Jot down anything worth remembering for your interviews.
        </p>

        <Card className="mt-6 max-w-xl">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="focus-ring mb-3 w-full rounded-lg border border-white/10 bg-bg-secondary px-4 py-2.5 text-sm outline-none"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note…"
            rows={4}
            className="focus-ring w-full rounded-lg border border-white/10 bg-bg-secondary p-3 text-sm outline-none"
          />
          <Button onClick={handleAdd} className="mt-3">
            Add Note
          </Button>
        </Card>

        <div className="mt-8 flex max-w-xl items-center gap-2 rounded-lg border border-white/10 bg-bg-secondary px-4 py-2.5">
          <Search size={16} className="text-text-secondary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading && <p className="text-sm text-text-secondary">Loading…</p>}
          {!loading && filtered.length === 0 && (
            <p className="text-sm text-text-secondary">No notes yet — add your first one above.</p>
          )}
          {filtered.map((note) => (
            <Card key={note.id}>
              <div className="flex items-start justify-between">
                <h3 className="font-semibold">{note.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => togglePin(note)}
                    className={`focus-ring ${note.pinned ? "text-accent" : "text-text-secondary"}`}
                    aria-label="Pin note"
                  >
                    <Pin size={16} />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="focus-ring text-text-secondary hover:text-red-400"
                    aria-label="Delete note"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">{note.content}</p>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
