// "use client"

// import type React from "react"
// // import { useSession } from "next-auth/react"
// import { useRouter } from "next/navigation"
// import { useEffect, useState } from "react"

// export function AuthGuard({ children }: { children: React.ReactNode }) {
//   // const { data: session, status } = useSession()
//   const router = useRouter()
//   const [isReady, setIsReady] = useState(false)

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/login")
//     } else if (status === "authenticated") {
//       setIsReady(true)
//     }
//   }, [status, router])

//   if (status === "loading" || !isReady) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
//       </div>
//     )
//   }

//   return <>{children}</>
// }
