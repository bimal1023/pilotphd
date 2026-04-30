import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Find Professors — PilotPhD",
  description: "Discover researchers whose work aligns with yours, ranked by fit",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
