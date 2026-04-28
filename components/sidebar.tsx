"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
// import { signOut } from "next-auth/react"
import { LayoutDashboard, Users, FileText, Mail, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/use-translation"
import { LanguageSwitcher } from "@/components/language-switcher"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslation()

  const navigation = [
    { name: t.nav.dashboard, href: "/dashboard", icon: LayoutDashboard },
    { name: t.nav.employees, href: "/employees", icon: Users },
    { name: t.nav.templates, href: "/templates", icon: FileText },
    { name: t.nav.logs, href: "/logs", icon: Mail },
    { name: t.nav.settings, href: "/settings", icon: Settings },
  ]

  const handleLogout = async () => {
    const { logout } = await import("@/app/keycloak/keycloakConfig")
    await logout()
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-6">
        <div className="flex items-center">
          <Mail className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-semibold">Anniversary Admin</span>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          {t.nav.logout}
        </Button>
      </div>
    </div>
  )
}
