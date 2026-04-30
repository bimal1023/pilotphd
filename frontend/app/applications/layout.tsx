import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Applications — PilotPhD",
  description: "Track and manage your PhD applications",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
