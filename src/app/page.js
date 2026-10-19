import Link from "next/link"
import BrandMark from "./components/amalfi/BrandMark"
import { LemonBranch, Tile } from "./components/amalfi/Lemon"

const features = [
  {
    title: "Instant Payments",
    description: "Quick and secure E-coin transactions with real-time confirmations",
    tile: "flower",
  },
  {
    title: "Secure Platform",
    description: "Enterprise-grade security protecting your transactions and data",
    tile: "star",
  },
  {
    title: "Easy to Use",
    description: "Intuitive interface designed for everyone, no technical knowledge needed",
    tile: "diamond",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
        <nav className="liquid-glass mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full pl-3 pr-2 sm:pl-4">
          <BrandMark labelClassName="hidden sm:inline" />
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-white/60 hover:text-primary"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 px-3 pt-8 pb-16 sm:px-6 sm:pt-12">
        <section className="tile-frame relative mx-auto max-w-6xl rounded-[2.5rem] p-3 shadow-xl ring-1 ring-white/80 sm:p-6">
          <div
            className="relative overflow-hidden px-5 pt-20 pb-12 text-center sm:px-12 sm:pt-28 sm:pb-16"
            style={{
              borderTopLeftRadius: "50% 9rem",
              borderTopRightRadius: "50% 9rem",
              borderBottomLeftRadius: "2rem",
              borderBottomRightRadius: "2rem",
              backgroundColor: "#fffdf7",
              backgroundImage:
                "repeating-linear-gradient(90deg, rgb(42 81 184 / 0.05) 0 12px, transparent 12px 24px, rgb(241 205 63 / 0.08) 24px 36px, transparent 36px 48px)",
              boxShadow: "inset 0 0 0 2px #13235a, inset 0 0 0 7px #fffdf7, inset 0 0 0 8px rgb(19 35 90 / 0.25)",
            }}
          >
            {/* lemons spilling into the arch */}
            <LemonBranch className="animate-float pointer-events-none absolute -top-4 -left-10 w-48 sm:w-80" />
            <LemonBranch flip className="animate-float pointer-events-none absolute -top-4 -right-10 w-48 sm:w-80" />

            <div className="animate-rise relative">
              <p className="script text-2xl text-primary sm:text-4xl">E-Cell S.P.I.T. invites you</p>

              <h1 className="mt-4 leading-[0.85]">
                <span className="block text-[4.5rem] font-black tracking-tight text-[#1b3a8f] sm:text-[8rem]">FOOD</span>
                <span className="block text-[2.6rem] font-black tracking-tight text-sky sm:text-[5.25rem]">CHALLENGE</span>
                <span className="mt-2 block text-[2.8rem] font-black text-gold sm:text-[5rem]">2026</span>
              </h1>

              <div className="mx-auto mt-6 max-w-xl">
                <p className="script text-left text-2xl text-gold sm:text-4xl">Come for the food</p>
                <p className="script text-right text-2xl text-primary sm:text-4xl">Stay for the company</p>
              </div>

              <div className="mx-auto mt-10 max-w-2xl space-y-3">
                <h2 className="text-2xl font-bold sm:text-3xl">Food Stall Transactions Made Simple</h2>
                <p className="text-base text-muted-foreground sm:text-lg">
                  Fast, secure, and rewarding E-coin transactions. Discover amazing food stalls, earn rewards, and
                  manage your dining experience effortlessly.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/signup"
                  className="rounded-full bg-primary px-9 py-4 text-base font-semibold text-primary-foreground"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/login"
                  className="glass-pill rounded-full px-8 py-4 text-base font-semibold text-foreground transition hover:bg-white/80"
                >
                  Already have an account? <span className="text-primary">Login</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <div className="mx-auto mt-16 grid w-full max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={i}
              className="liquid-glass animate-rise group rounded-[1.75rem] p-6 transition-transform duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${150 + i * 120}ms` }}
            >
              <Tile variant={feature.tile} className="mb-5 h-12 w-12 rounded-xl shadow-md ring-2 ring-white" />
              <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto">
        <div className="tile-band border-y border-[#13235a]/20" />
        <div className="bg-[#13235a] py-10 text-center">
          <p className="serif text-2xl font-bold text-[#fffdf7]">E-Cell S.P.I.T., Food Challenge</p>
          <p className="mt-3 text-sm text-[#fffdf7]/70">© 2026 E-Cell Food Challenge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
