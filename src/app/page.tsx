"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";

interface Bookmark {
  id: string;
  title: string;
  url: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    fetchBookmarks();

    const channel = supabase
      .channel("bookmarks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchBookmarks();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    setBookmarks(data || []);
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const addBookmark = async () => {
    if (!title || !url || !user) return;

    const optimisticBookmark = {
      id: crypto.randomUUID(),
      title,
      url,
    };

    setBookmarks((prev) => [optimisticBookmark, ...prev]);
    setTitle("");
    setUrl("");

    await supabase.from("bookmarks").insert([
      {
        title,
        url,
        user_id: user.id,
      },
    ]);
  };

  const deleteBookmark = async (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  const displayName =user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 text-white">
        {!user ? (
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">
              Smart Bookmark
            </h1>
            <p className="text-white/80">
              Save and manage your personal bookmarks in real-time.
            </p>
            <button
              onClick={handleLogin}
              className="bg-white text-indigo-700 px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
            >
              Sign in with Google
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-semibold">
                  Welcome, {displayName}
                </h2>
                <p className="text-white/70 text-sm">
                  Your personal bookmark dashboard
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500/70 px-4 py-2 rounded-lg text-sm cursor-pointer transition-all duration-200 hover:bg-red-500 hover:shadow-md active:scale-95"
              >
                Logout
              </button>
            </div>

            {/* Add Bookmark */}
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                placeholder="Title"
                className="flex-1 px-4 py-2 rounded-lg bg-white/20 placeholder-white/70 outline-none focus:ring-2 focus:ring-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="URL"
                className="flex-1 px-4 py-2 rounded-lg bg-white/20 placeholder-white/70 outline-none focus:ring-2 focus:ring-white"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button
                onClick={addBookmark}
                className="bg-emerald-500 px-4 rounded-lg font-medium cursor-pointer transition-all duration-200 hover:bg-emerald-400 hover:scale-105 hover:shadow-md active:scale-95"
              >
                Add
              </button>
            </div>

            {/* Bookmark List */}
            {bookmarks.length === 0 ? (
              <div className="text-center text-white/70 py-10">
                No bookmarks yet. Start by adding one 🚀
              </div>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {bookmarks.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white/15 backdrop-blur-md border border-white/20 p-4 rounded-xl flex justify-between items-center hover:bg-white/20 transition"
                  >
                    <div>
                      <p className="font-semibold">{b.title}</p>
                      <a
                        href={b.url}
                        target="_blank"
                        className="text-sm text-blue-200 hover:underline"
                      >
                        {b.url}
                      </a>
                    </div>
                    <button
                      onClick={() => deleteBookmark(b.id)}
                      className="text-red-300 cursor-pointer transition-all duration-200 hover:text-red-500 hover:scale-110"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
