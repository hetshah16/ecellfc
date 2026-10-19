// Decorative Amalfi illustrations: lemons, leaves, blossoms, branches and tiles.
// Pure SVG, no assets to load.

import { useId } from "react"

export function LemonBranch({ className = "", flip = false }) {
  const id = useId().replace(/:/g, "")
  const g = `lemon-${id}`
  const h = `leaf-${id}`
  return (
    <svg
      viewBox="0 0 340 260"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={g} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#fff3a6" />
          <stop offset="45%" stopColor="#f3d443" />
          <stop offset="100%" stopColor="#d7a91c" />
        </radialGradient>
        <linearGradient id={h} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7cbb52" />
          <stop offset="100%" stopColor="#3f7a2a" />
        </linearGradient>
      </defs>

      {/* branch */}
      <path d="M-10 52 C 60 40, 130 70, 200 58 S 300 30, 350 40" fill="none" stroke="#4e6b2c" strokeWidth="5" strokeLinecap="round" />
      <path d="M150 62 C 156 90, 150 110, 140 128" fill="none" stroke="#4e6b2c" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M226 52 C 236 78, 244 98, 252 112" fill="none" stroke="#4e6b2c" strokeWidth="3.5" strokeLinecap="round" />

      {/* leaves */}
      {[
        [40, 46, -28, 1],
        [78, 62, 32, 0.9],
        [112, 50, -40, 1.05],
        [188, 70, 38, 1],
        [262, 40, -22, 0.95],
        [300, 46, 30, 0.85],
      ].map(([x, y, r, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
          <path d="M0 0 C 18 -16, 52 -16, 74 0 C 52 16, 18 16, 0 0 Z" fill={`url(#${h})`} />
          <path d="M4 0 L 68 0" stroke="#2f5f1f" strokeOpacity="0.45" strokeWidth="1.4" />
        </g>
      ))}

      {/* lemons */}
      <g transform="translate(92 118) rotate(-14)">
        <Lemon fill={`url(#${g})`} />
      </g>
      <g transform="translate(200 104) rotate(18) scale(0.92)">
        <Lemon fill={`url(#${g})`} />
      </g>

      {/* blossoms */}
      <Blossom x={58} y={86} />
      <Blossom x={250} y={72} s={0.8} />
    </svg>
  )
}

function Lemon({ fill }) {
  return (
    <g>
      <ellipse cx="54" cy="70" rx="48" ry="10" fill="#13235a" opacity="0.08" />
      <path
        d="M6 34 C 6 14, 30 2, 54 3 C 76 4, 94 16, 100 30 C 103 32, 107 33, 108 35 C 106 37, 103 38, 100 40 C 93 56, 74 66, 52 65 C 29 64, 11 53, 5 40 C 2 39, 0 37, 0 35 C 2 34, 4 34, 6 34 Z"
        fill={fill}
      />
      <ellipse cx="38" cy="20" rx="16" ry="6" fill="#ffffff" opacity="0.45" transform="rotate(-12 38 20)" />
    </g>
  )
}

export function Blossom({ x = 0, y = 0, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-8" rx="5.5" ry="8" fill="#ffffff" stroke="#e7e1cf" strokeWidth="0.8" transform={`rotate(${a})`} />
      ))}
      <circle r="3.4" fill="#f1cd3f" />
    </g>
  )
}

export function SingleLemon({ className = "" }) {
  const g = `lemon-single-${useId().replace(/:/g, "")}`
  return (
    <svg viewBox="0 0 110 70" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={g} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#fff3a6" />
          <stop offset="45%" stopColor="#f3d443" />
          <stop offset="100%" stopColor="#d7a91c" />
        </radialGradient>
      </defs>
      <Lemon fill={`url(#${g})`} />
    </svg>
  )
}

// One majolica tile. variant: "flower" | "star" | "diamond"
export function Tile({ variant = "flower", className = "" }) {
  if (variant === "star") {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
        <rect width="48" height="48" fill="#2a51b8" />
        <path d="M24 5 L28.5 19.5 L43 24 L28.5 28.5 L24 43 L19.5 28.5 L5 24 L19.5 19.5Z" fill="#fffdf7" />
        <circle cx="24" cy="24" r="4" fill="#f1cd3f" />
      </svg>
    )
  }
  if (variant === "diamond") {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
        <rect width="48" height="48" fill="#fffdf7" />
        <path d="M24 4 L44 24 L24 44 L4 24Z" fill="none" stroke="#2a51b8" strokeWidth="3.5" />
        <path d="M24 13 L35 24 L24 35 L13 24Z" fill="#f1cd3f" />
        <circle cx="24" cy="24" r="3.5" fill="#13235a" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <rect width="48" height="48" fill="#f1cd3f" />
      <g fill="#13235a">
        <ellipse cx="24" cy="11" rx="5" ry="8.5" />
        <ellipse cx="24" cy="37" rx="5" ry="8.5" />
        <ellipse cx="11" cy="24" rx="8.5" ry="5" />
        <ellipse cx="37" cy="24" rx="8.5" ry="5" />
        <circle cx="24" cy="24" r="6" />
      </g>
      <circle cx="24" cy="24" r="2.5" fill="#fffdf7" />
    </svg>
  )
}
