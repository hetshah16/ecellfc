// The E-Cell mark as a small majolica tile, plus optional wordmark.
export default function BrandMark({ label = "E-Cell FC 2k26", letter = "E", showLabel = true, labelClassName = "" }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-md ring-1 ring-white/70">
        <svg viewBox="0 0 36 36" className="absolute inset-0 h-full w-full opacity-35" aria-hidden="true">
          <path d="M18 2 L21.5 14.5 L34 18 L21.5 21.5 L18 34 L14.5 21.5 L2 18 L14.5 14.5Z" fill="#ffffff" />
        </svg>
        <span className="absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full bg-lemon" />
        <span className="serif relative text-lg font-bold leading-none">{letter}</span>
      </span>
      {showLabel && (
        <span className={`serif text-lg font-bold tracking-tight text-foreground ${labelClassName}`}>{label}</span>
      )}
    </span>
  )
}
