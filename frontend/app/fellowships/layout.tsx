import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Find Fellowships — PilotPhD",
  description: "Discover PhD funding opportunities for your research",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
