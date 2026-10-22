import Link from "next/link"

// Arched window shape, echoing the Amalfi hero arch
const archRadius = "50% 50% 1.1rem 1.1rem / 62.5% 62.5% 1.1rem 1.1rem"

export default function StallCard({ stall }) {
  const id = Number(stall.stall_id) || 0
  const initial = String(stall.stall_id).padStart(2)
  const number = String(stall.stall_id).padStart(2, "0")

  return (
    <Link
      href={`/stall/${stall.stall_id}`}
      className="group block h-full rounded-[1.9rem] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
    >
      <article className="liquid-glass relative flex h-full flex-col overflow-hidden rounded-[1.9rem] p-2.5 transition-all duration-500 ease-out group-hover:-translate-y-1.5 group-hover:shadow-xl sm:p-3">
        {/* Arched majolica window */}
        <div className="relative aspect-[5/4] overflow-hidden shadow-md" style={{ borderRadius: archRadius }}>
          <div
            className="tile-frame absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110"
            style={{ backgroundPosition: `${(id * 48) % 144}px ${(id * 48) % 96}px` }}
          />
          {/* depth + inner arch line */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#13235a]/55 via-[#13235a]/5 to-white/20" />
          <div className="absolute inset-1.5 border border-white/70 sm:inset-2" style={{ borderRadius: archRadius }} />

          {/* Monogram seal */}
          <div className="absolute inset-0 grid place-items-center">
            <span className="liquid-glass grid h-14 w-14 place-items-center rounded-full transition-transform duration-500 group-hover:scale-110 sm:h-16 sm:w-16">
              <span className="serif text-2xl font-black text-[#1b3a8f] sm:text-3xl">{initial}</span>
            </span>
          </div>

          {/* Specular sweep on hover */}
          <div className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[480%]" />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col px-1.5 pt-4 pb-1.5 text-center sm:px-2">
          <p className="text-[10px] font-bold tracking-[0.2em] text-gold uppercase sm:text-[11px]">
            <span className="script text-sm tracking-normal normal-case">Bancarella</span> · N° {number}
          </p>
          <h3 className="mt-0.5 line-clamp-2 text-lg leading-snug font-bold transition-colors group-hover:text-primary sm:text-xl">
            {stall.stall_name}
          </h3>

          <div className="mx-auto my-3 h-px w-12 bg-gradient-to-r from-transparent via-gold/70 to-transparent" />

          <span className="mt-auto inline-flex items-center justify-center gap-2 self-center rounded-full bg-white/70 py-1.5 pr-1.5 pl-4 text-xs font-semibold whitespace-nowrap text-[#13235a] ring-1 ring-white transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground sm:text-sm">
            Explore &amp; Order
            <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground transition-colors duration-300 group-hover:bg-white group-hover:text-primary">
              <svg
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </span>
        </div>
      </article>
    </Link>
  )
}
