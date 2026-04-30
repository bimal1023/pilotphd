import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In — PilotPhD",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
