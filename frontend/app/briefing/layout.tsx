import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Daily Briefing — PilotPhD",
  description: "Your personalized PhD application morning summary",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
