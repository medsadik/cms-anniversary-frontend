// // Authentication utilities
// export interface User {
//   id: string
//   username: string
//   email: string
//   token: string
// }

// export const AUTH_TOKEN_KEY = "auth_token"
// export const USER_DATA_KEY = "user_data"

// export function setAuthToken(token: string): void {
//   if (typeof window !== "undefined") {
//     localStorage.setItem(AUTH_TOKEN_KEY, token)
//   }
// }

// export function getAuthToken(): string | null {
//   if (typeof window !== "undefined") {
//     return localStorage.getItem(AUTH_TOKEN_KEY)
//   }
//   return null
// }

// export function setUserData(user: User): void {
//   if (typeof window !== "undefined") {
//     localStorage.setItem(USER_DATA_KEY, JSON.stringify(user))
//   }
// }

// export function getUserData(): User | null {
//   if (typeof window !== "undefined") {
//     const data = localStorage.getItem(USER_DATA_KEY)
//     return data ? JSON.parse(data) : null
//   }
//   return null
// }

// export function clearAuth(): void {
//   if (typeof window !== "undefined") {
//     localStorage.removeItem(AUTH_TOKEN_KEY)
//     localStorage.removeItem(USER_DATA_KEY)
//   }
// }

// export function isAuthenticated(): boolean {
//   return !!getAuthToken()
// }
