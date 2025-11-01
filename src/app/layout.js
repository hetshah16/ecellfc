import "./globals.css"

export const metadata = {
  title: "E-Cell Food Challenge",
  description: "Professional Food Stall Transaction Platform",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground font-sans antialiased">{children}</body>
    </html>
  )
}
