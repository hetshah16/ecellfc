import Image from "next/image"
import Link from "next/link"

export default function StallCard({ stall }) {
  return (
    <Link href={`/stall/${stall.stall_id}`}>
      <div className="group relative h-full rounded-2xl overflow-hidden bg-card border border-border transition-all cursor-pointer
        hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">

        {/* Image header */}
        <div className="relative h-28">
          <Image
            src={stall.photo_url}
            alt={stall.stall_name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* theme overlay */}
          {/* <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px]" /> */}

          {/* subtle badge */}
          <span className="absolute top-2 left-2 px-2 py-1 text-[10px] font-semibold rounded-full
            bg-card/90 text-foreground border border-border">
            Stall #{stall.stall_id}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col h-[calc(100%-7rem)]">
          <h3 className="font-bold text-base text-foreground mb-1 line-clamp-1">
            {stall.stall_name}
          </h3>

          <p className="text-xs text-muted-foreground mb-4">
            Freshly prepared • Tap to explore
          </p>

          {/* CTA */}
          <div className="mt-auto flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition">
              View stall
            </span>

            <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center
              group-hover:bg-primary group-hover:border-primary transition">
              <svg
                className="w-4 h-4 text-muted-foreground group-hover:text-primary-foreground transition"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* focus ring */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent
          group-hover:ring-primary/30 transition" />
      </div>
    </Link>
  )
}
