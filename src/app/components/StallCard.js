import Image from "next/image"
import Link from "next/link"

export default function StallCard({ stall }) {
  return (
    <Link href={`/stall/${stall.stall_id}`}>
      <div className="group h-full bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20 cursor-pointer">

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                {stall.stall_name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Stall Id: {stall.stall_id}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Explore and Order </span>
            <svg
              className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
