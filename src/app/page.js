"use client"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/50 backdrop-blur-md border-b border-border">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
              E
            </div>
            <span className="hidden sm:inline">E-Cell Food</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 text-foreground hover:text-primary transition-colors font-medium"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Get Started
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">Food Stall Transactions Made Simple</h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Fast, secure, and rewarding E-coin transactions. Discover amazing food stalls, earn rewards, and manage
              your dining experience effortlessly.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={() => router.push("/signup")}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-semibold transition-colors shadow-lg"
            >
              Create Free Account
            </button>
            <button
              onClick={() => router.push("/login")}
              className="px-8 py-3 bg-card text-foreground border border-border rounded-lg hover:bg-card/80 font-semibold transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-5xl mx-auto w-full mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Instant Payments",
              description: "Quick and secure E-coin transactions with real-time confirmations",
            },
            {
              title: "Secure Platform",
              description: "Enterprise-grade security protecting your transactions and data",
            },
            {
              title: "Easy to Use",
              description: "Intuitive interface designed for everyone, no technical knowledge needed",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors"
            >
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>© 2025 E-Cell Food Challenge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
