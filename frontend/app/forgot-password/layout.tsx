import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Forgot Password — PilotPhD",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
