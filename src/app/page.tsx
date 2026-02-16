"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { User } from "@supabase/supabase-js"

interface Bookmark {
  id: string
  title: string
  url: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user ?? null)
    }

    getSession()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
  if (!user) return

  fetchBookmarks()

  const channel = supabase
    .channel("bookmarks-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "bookmarks",
      },
      () => {
        fetchBookmarks()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [user])


  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false })

    setBookmarks(data || [])
  }

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const addBookmark = async () => {
    if (!title || !url || !user) return

    await supabase.from("bookmarks").insert([
      {
        title,
        url,
        user_id: user.id,
      },
    ])

    setTitle("")
    setUrl("")
  }

  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id)
  }

  return (
    <div className="p-10 max-w-xl mx-auto">
      {!user ? (
        <button
          onClick={handleLogin}
          className="bg-black text-white px-6 py-3 rounded"
        >
          Sign in with Google
        </button>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold">My Bookmarks</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Title"
              className="border p-2 flex-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="URL"
              className="border p-2 flex-1"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              onClick={addBookmark}
              className="bg-blue-600 text-white px-4 rounded"
            >
              Add
            </button>
          </div>

          <ul className="space-y-3">
            {bookmarks.map((b) => (
              <li
                key={b.id}
                className="border p-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{b.title}</p>
                  <a
                    href={b.url}
                    target="_blank"
                    className="text-blue-600 text-sm"
                  >
                    {b.url}
                  </a>
                </div>
                <button
                  onClick={() => deleteBookmark(b.id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
