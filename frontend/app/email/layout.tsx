import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Draft Email — PilotPhD",
  description: "Write a personalized cold email to a professor",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
