import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard — PilotPhD",
  description: "Your PhD application overview",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
