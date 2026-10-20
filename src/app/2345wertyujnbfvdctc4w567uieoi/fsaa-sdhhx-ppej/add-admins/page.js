"use client"

import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import AdminNavbar from "../components/AdminNavbar"

const adminsApi = "/api/superhhhppp/762rfvyiorbvuiefnciedlks64378uiw/admins"

export default function AddAdminsPage() {
  const router = useRouter()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [createSuccess, setCreateSuccess] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [editingAdminId, setEditingAdminId] = useState(null)
  const [newPassword, setNewPassword] = useState("")
  const [superadminPassword, setSuperadminPassword] = useState("")
  const [editing, setEditing] = useState(false)
  const [editError, setEditError] = useState("")
  const [editSuccess, setEditSuccess] = useState("")
  const createRef = useRef(false)
  const editRef = useRef(false)

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        await axios.get("/api/superhhhppp/762rfvyiorbvuiefnciedlks64378uiw/me")
        const res = await axios.get(adminsApi)
        setAdmins(res.data.admins || [])
      } catch (error) {
        if ([401, 403].includes(error.response?.status)) {
          router.push("/2345wertyujnbfvdctc4w567uieoi/fsaa-sdhhx-ppej/login")
        } else {
          setCreateError("Failed to load admins")
          console.error("Failed to load admins:", error)
        }
      } finally {
        setLoading(false)
      }
    }

    loadAdmins()
  }, [router])

  async function createAdmin(event) {
    event.preventDefault()
    if (createRef.current) return
    createRef.current = true
    setCreating(true)
    setCreateError("")
    setCreateSuccess("")

    try {
      const res = await axios.post(adminsApi, { email, password })
      setAdmins((current) => [res.data.admin, ...current])
      setEmail("")
      setPassword("")
      setCreateSuccess("Admin account created successfully.")
    } catch (error) {
      setCreateError(error.response?.data?.error || "Failed to create admin")
    } finally {
      createRef.current = false
      setCreating(false)
    }
  }

  function startPasswordEdit(admin) {
    setEditingAdminId(admin.admin_id)
    setNewPassword("")
    setSuperadminPassword("")
    setEditError("")
    setEditSuccess("")
  }

  function cancelPasswordEdit() {
    if (editing) return
    setEditingAdminId(null)
    setNewPassword("")
    setSuperadminPassword("")
    setEditError("")
  }

  async function updateAdminPassword(event) {
    event.preventDefault()
    if (editRef.current || !editingAdminId) return
    editRef.current = true
    setEditing(true)
    setEditError("")
    setEditSuccess("")

    try {
      await axios.patch(adminsApi, {
        admin_id: editingAdminId,
        new_password: newPassword,
        superadmin_password: superadminPassword,
      })
      setEditSuccess("Admin password updated successfully.")
      setNewPassword("")
      setSuperadminPassword("")
      setEditingAdminId(null)
    } catch (error) {
      setEditError(error.response?.data?.error || "Failed to update admin password")
    } finally {
      editRef.current = false
      setEditing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
          <span className="text-sm text-muted-foreground">Loading admins...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <header>
          <h1 className="text-3xl font-bold">Add Admins</h1>
          <p className="mt-1 text-muted-foreground">
            Create admin accounts and manage their passwords.
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-5 text-xl font-semibold">Create admin account</h2>
          <form onSubmit={createAdmin} className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              Email
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
                placeholder="admin@example.com"
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              Password
              <input
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
                placeholder="At least 6 characters"
              />
            </label>
            <p className="text-sm text-muted-foreground sm:col-span-2">
              New accounts are created as regular admins (superadmin access is disabled).
            </p>
            {createError && (
              <p className="text-sm text-destructive sm:col-span-2" role="alert">{createError}</p>
            )}
            {createSuccess && (
              <p className="text-sm text-green-600 sm:col-span-2" role="status">{createSuccess}</p>
            )}
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 sm:justify-self-start"
            >
              {creating ? (
                <span className="inline-flex items-center gap-2" role="status">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/40 border-t-current" />
                  Creating...
                </span>
              ) : "Create Admin"}
            </button>
          </form>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Existing admins</h2>
          {admins.length === 0 ? (
            <p className="rounded-2xl border border-border bg-card py-10 text-center text-muted-foreground">
              No regular admin accounts found.
            </p>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <article
                  key={admin.admin_id}
                  className="rounded-2xl border border-border bg-card p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{admin.email}</p>
                      <p className="text-xs text-muted-foreground">Admin ID: {admin.admin_id}</p>
                    </div>
                    {editingAdminId !== admin.admin_id && (
                      <button
                        type="button"
                        onClick={() => startPasswordEdit(admin)}
                        className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
                      >
                        Change password
                      </button>
                    )}
                  </div>

                  {editingAdminId === admin.admin_id && (
                    <form onSubmit={updateAdminPassword} className="mt-5 grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2 text-sm font-medium">
                        New admin password
                        <input
                          type="password"
                          autoComplete="new-password"
                          minLength={6}
                          required
                          value={newPassword}
                          onChange={(event) => setNewPassword(event.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2"
                        />
                      </label>
                      <label className="space-y-2 text-sm font-medium">
                        Superadmin account password
                        <input
                          type="password"
                          autoComplete="current-password"
                          required
                          value={superadminPassword}
                          onChange={(event) => setSuperadminPassword(event.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2"
                        />
                      </label>
                      {editError && (
                        <p className="text-sm text-destructive sm:col-span-2" role="alert">{editError}</p>
                      )}
                      <div className="flex gap-2 sm:col-span-2">
                        <button
                          type="submit"
                          disabled={editing}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                        >
                          {editing ? "Saving..." : "Save password"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelPasswordEdit}
                          disabled={editing}
                          className="rounded-lg border border-border px-4 py-2 text-sm font-medium disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </article>
              ))}
            </div>
          )}
          {editSuccess && <p className="mt-3 text-sm text-green-600" role="status">{editSuccess}</p>}
        </section>
      </main>
    </div>
  )
}
