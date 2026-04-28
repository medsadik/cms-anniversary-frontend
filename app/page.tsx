"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  // This page only renders when AuthProvider has isSuccess=true (auth is complete),
  // so always redirect to dashboard.
  useEffect(() => {
    router.replace("/dashboard")
  }, [router])

  return null
}
