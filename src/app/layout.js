import "./globals.css"
import { Playfair_Display, Plus_Jakarta_Sans, Kaushan_Script } from "next/font/google"
import AmalfiBackdrop from "./components/amalfi/AmalfiBackdrop"

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-jakarta" })
const kaushan = Kaushan_Script({ subsets: ["latin"], weight: "400", variable: "--font-kaushan" })

export const metadata = {
  title: "E-Cell Food Challenge",
  description: "Professional Food Stall Transaction Platform",
}

export const viewport = {
  themeColor: "#fbf8f1",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable} ${kaushan.variable}`}>
      <body className="bg-background text-foreground font-sans antialiased">
        <AmalfiBackdrop />
        {children}
      </body>
    </html>
  )
}
