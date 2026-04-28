"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmailMultiSelect } from "@/components/email-multi-select"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/use-translation"
import api from "@/lib/api"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const t = useTranslation()
  const [defaultCCList, setDefaultCCList] = useState<string[]>([])
  const [employees, setEmployees] = useState<Array<{ email: string }>>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [ccResponse, employeesResponse] = await Promise.all([
        api.get("/api/default-cc"),
        api.get("/api/employees"),
      ])
      setDefaultCCList(ccResponse.data || [])
      setEmployees(employeesResponse.data.data || [])
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await api.put("/api/default-cc", defaultCCList)
      toast({
        title: "Success",
        description: "Default CC list updated successfully",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">{t.settings.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.settings.subtitle}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.settings.defaultCCList}</CardTitle>
          <CardDescription>{t.settings.defaultCCDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <EmailMultiSelect
            value={defaultCCList}
            onChange={setDefaultCCList}
            suggestions={employees.map((e) => e.email)}
            placeholder="Add email addresses..."
          />
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? t.settings.saving : t.common.save}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SMTP Configuration</CardTitle>
          <CardDescription>Configure email server settings (Coming soon)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">SMTP configuration will be available in a future update</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>HR API Integration</CardTitle>
          <CardDescription>Configure HR system API credentials (Coming soon)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">HR API integration will be available in a future update</p>
        </CardContent>
      </Card>
    </div>
  )
}
