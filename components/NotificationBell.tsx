"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  async function fetchNotifications() {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setNotifications(data as Notification[]);
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleOpen() {
    setOpen((o) => !o);
    if (!open && unreadCount > 0) {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
      await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="focus-ring relative rounded-lg p-2 text-text-secondary transition hover:bg-white/5 hover:text-white"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-warm text-[10px] font-bold text-black">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl2 border border-white/10 bg-card p-2 shadow-glass">
          <p className="px-2 py-1 text-xs font-semibold text-text-secondary">Notifications</p>
          {notifications.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-text-secondary">
              No notifications yet.
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="rounded-lg px-2 py-2 text-sm transition hover:bg-white/5"
                >
                  <p className="font-medium text-white">{n.title}</p>
                  {n.message && <p className="mt-0.5 text-xs text-text-secondary">{n.message}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
