"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

export default function PasswordInput({ className = "", style, ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <span className="relative block w-full min-w-0">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`${className} pr-10`}
        style={style ? { ...style, paddingRight: style.paddingRight ?? 40 } : undefined}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </span>
  )
}