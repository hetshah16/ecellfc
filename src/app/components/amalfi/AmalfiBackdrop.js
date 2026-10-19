import { LemonBranch } from "./Lemon"

// Fixed, non-interactive scenery that sits behind every page:
// cream pinstripes, soft cobalt & lemon light, and lemon branches in the corners.
// The liquid-glass surfaces above it blur and tint this layer.
export default function AmalfiBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* cream paper with pale blue / lemon pinstripes */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "var(--amalfi-cream)",
          backgroundImage:
            "repeating-linear-gradient(90deg, rgb(42 81 184 / 0.045) 0 14px, transparent 14px 28px, rgb(241 205 63 / 0.07) 28px 42px, transparent 42px 56px)",
        }}
      />

      {/* soft light fields for the glass to refract */}
      <div
        className="animate-drift absolute -top-[18%] -left-[12%] h-[60vmax] w-[60vmax] rounded-full opacity-55 blur-3xl"
        style={{ background: "radial-gradient(circle at 40% 40%, #7f9ee6 0%, #2a51b8 38%, transparent 70%)" }}
      />
      <div
        className="animate-drift absolute -bottom-[22%] -right-[14%] h-[58vmax] w-[58vmax] rounded-full opacity-50 blur-3xl"
        style={{
          background: "radial-gradient(circle at 50% 50%, #f6dc63 0%, #f1cd3f 30%, transparent 68%)",
          animationDelay: "-9s",
        }}
      />
      <div
        className="absolute top-[38%] left-[55%] h-[34vmax] w-[34vmax] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #a9bdf0 0%, transparent 70%)" }}
      />

      {/* lemon branches */}
      <LemonBranch className="animate-float absolute -top-6 -left-10 w-[230px] sm:w-[300px] lg:w-[340px] opacity-95" />
      <LemonBranch
        flip
        className="animate-float absolute -bottom-16 -right-12 hidden w-[300px] rotate-180 opacity-90 md:block lg:w-[340px]"
      />

      {/* fine grain so gradients don't band */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}
