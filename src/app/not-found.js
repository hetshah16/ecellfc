import Link from "next/link"
import { Tile } from "./components/amalfi/Lemon"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <div className="liquid-glass w-full max-w-md overflow-hidden rounded-[2rem] text-center">
        <div className="tile-band" />
        <div className="p-8 sm:p-10">
          <div className="mb-5 flex justify-center gap-2">
            <Tile variant="flower" className="h-10 w-10 rounded-lg shadow-md ring-2 ring-white" />
            <Tile variant="star" className="h-10 w-10 rounded-lg shadow-md ring-2 ring-white" />
            <Tile variant="diamond" className="h-10 w-10 rounded-lg shadow-md ring-2 ring-white" />
          </div>
          <p className="script text-2xl text-gold">Mamma mia!</p>
          <h1 className="mt-1 text-5xl font-black text-[#1b3a8f]">404</h1>
          <p className="mt-3 text-muted-foreground">This page could not be found.</p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-full bg-primary px-8 py-3.5 font-semibold text-primary-foreground"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
