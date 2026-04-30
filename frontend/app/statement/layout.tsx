import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Refine Statement — PilotPhD",
  description: "Get expert feedback on your personal statement",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
