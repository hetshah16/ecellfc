"use client"

import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import AdminNavbar from "../components/AdminNavbar"

export default function PageSettingsAdminPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState(null)
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingPages, setSavingPages] = useState([])
  const savingPagesRef = useRef(new Set())

  // 🔐 verify superadmin
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get(
          "/api/superhhhppp/762rfvyiorbvuiefnciedlks64378uiw/me"
        )
        setAdmin(res.data.admin)
      } catch {
        router.push("/2345wertyujnbfvdctc4w567uieoi/fsaa-sdhhx-ppej/login")
      }
    }
    fetchAdmin()
  }, [router])

  // 📄 fetch page settings
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await axios.get("/api/superhhhppp/762rfvyiorbvuiefnciedlks64378uiw/page-settings")
        setPages(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchPages()
  }, [])

  const updatePage = async (page) => {
  if (savingPagesRef.current.has(page.page_key)) return
  savingPagesRef.current.add(page.page_key)
  setSavingPages(Array.from(savingPagesRef.current))
  try {
    await axios.post(
      "/api/superhhhppp/762rfvyiorbvuiefnciedlks64378uiw/page-settings/update",
      {
        ...page,
        opens_at: localToUTC(page.opens_at),
        closes_at: localToUTC(page.closes_at),
        updated_by: admin.superadmin_id,
      }
    )
    alert("Saved")
  } catch (err) {
    alert("Failed to update")
  } finally {
    savingPagesRef.current.delete(page.page_key)
    setSavingPages(Array.from(savingPagesRef.current))
  }
}


    const localToUTC = (localDateTime) => {
        if (!localDateTime) return null

        const date = new Date(localDateTime) // browser local time (IST)
        return date.toISOString().slice(0, 19).replace("T", " ")
    }
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">⚙️ Page Settings</h1>

        <div className="space-y-6">
          {pages.map((page, idx) => (
            <div
              key={page.page_key}
              className="bg-card border rounded-2xl p-6 space-y-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">
                    {page.page_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Key: {page.page_key}
                  </p>
                </div>

                <label className="flex min-h-11 cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-5 w-5"
                    checked={!!page.is_enabled}
                    onChange={(e) => {
                      const copy = [...pages]
                      copy[idx].is_enabled = e.target.checked ? 1 : 0
                      setPages(copy)
                    }}
                  />
                  Enabled
                </label>
              </div>

              <input
                type="text"
                placeholder="Down message"
                value={page.down_message || ""}
                onChange={(e) => {
                  const copy = [...pages]
                  copy[idx].down_message = e.target.value
                  setPages(copy)
                }}
                className="w-full border rounded-lg px-3 py-2"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="datetime-local"
                  value={page.opens_at ? page.opens_at.slice(0, 16) : ""}
                  onChange={(e) => {
                    const copy = [...pages]
                    copy[idx].opens_at = e.target.value
                    setPages(copy)
                  }}
                  className="border rounded-lg px-3 py-2"
                />

                <input
                  type="datetime-local"
                  value={page.closes_at ? page.closes_at.slice(0, 16) : ""}
                  onChange={(e) => {
                    const copy = [...pages]
                    copy[idx].closes_at = e.target.value
                    setPages(copy)
                  }}
                  className="border rounded-lg px-3 py-2"
                />
              </div>

              <button
                onClick={() => updatePage(page)}
                disabled={savingPages.includes(page.page_key)}
                className="px-4 py-2 rounded-lg border bg-primary text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingPages.includes(page.page_key) ? (
                  <span className="inline-flex items-center gap-2" role="status">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving...
                  </span>
                ) : "Save Changes"}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
