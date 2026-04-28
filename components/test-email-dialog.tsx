"use client"

import { useEffect, useState } from "react"
import { Send } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { EmailMultiSelect } from "@/components/email-multi-select"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  entryDate: string;
  manager: string;
}

interface Template {
  id: string
  name: string
  type: "BIRTHDAY" | "WORK_ANNIVERSARY"
  subject: string
  body: string
}

interface TestEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: Template | null
  onSend: (data: { email: string; ccList: string[] }) => Promise<void>
}

export function TestEmailDialog({ open, onOpenChange, template, onSend }: TestEmailDialogProps) {
 const [to, setTo] = useState("")
  const [ccList, setCcList] = useState<string[]>([])
  const [isSending, setIsSending] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

 useEffect(() => {
    fetchEmployees()
  }, [])
  const fetchEmployees = async () => {
    try {
      const response = await api.get("/api/employees")
      setEmployees(response.data.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  const emailSuggestions = employees.map((emp) => emp.email)
  const handleSend = async () => {
    if (!to.trim()) return

    setIsSending(true)
    try {
      await onSend({ email: to.trim(), ccList })
      setTo("")
      setCcList([])
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in parent
    } finally {
      setIsSending(false)
    }
  }

  if (!template) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Test Email Template</DialogTitle>
          <DialogDescription>Send a test email to verify the template looks correct</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Info */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Template:</span>
              <span className="text-sm">{template.name}</span>
              <Badge variant="outline" className="ml-auto">
                {template.type === "BIRTHDAY" ? "Birthday" : "Work Anniversary"}
              </Badge>
            </div>
          </div>

          {/* Recipient Email */}
          <div className="space-y-2">
            <Label htmlFor="to">Recipient Email *</Label>
            <Input
              id="to"
              type="email"
              placeholder="recipient@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          {/* CC List */}
          <div className="space-y-2">
            <Label htmlFor="ccList">CC List (Optional)</Label>
            <EmailMultiSelect
              value={ccList}
              onChange={setCcList}
              suggestions={emailSuggestions}
              placeholder="Add CC recipients..."
            />
            <p className="text-xs text-muted-foreground">Type email addresses and press Enter to add them</p>
          </div>

          {/* Template Preview */}
          <div className="space-y-2">
            <Label>Template Preview</Label>
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <div>
                <div className="text-xs font-medium text-muted-foreground">Subject:</div>
                <div className="text-sm mt-1">{template.subject}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">Body:</div>
                <div
                  className="text-sm mt-1 max-h-40 overflow-y-auto prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: template.body }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Note: Placeholders like {"{{firstName}}"} will be replaced with actual employee data
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!to.trim() || isSending}>
            <Send className="mr-2 h-4 w-4" />
            {isSending ? "Sending..." : "Send Test Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
