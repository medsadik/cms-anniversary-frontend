"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.replace("#", "?"))
    const hasAuthCallback =
      searchParams.get("code") ||
      searchParams.get("state") ||
      hashParams.get("code") ||
      hashParams.get("state")

    if (!hasAuthCallback) {
      router.replace("/dashboard")
    }
    // If auth tokens are present, AuthProvider handles the callback and redirects
  }, [router])

  return null
}
