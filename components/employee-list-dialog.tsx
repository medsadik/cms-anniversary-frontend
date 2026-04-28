"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Calendar, Cake } from "lucide-react"

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  birthDate: string
  entryDate: string
  manager: string
}

interface EmailLog {
  id: number
  recipientEmail: string
  subject: string
  body: string
  type: string
  ccList?: string
  sentAt: string
  status: string
  errorMessage?: string
}

interface EmployeeListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employees: Employee[] | EmailLog[]
  title: string
  description: string
  type: "birthday" | "anniversary" | "email"
}

export function EmployeeListDialog({
  open,
  onOpenChange,
  employees,
  title,
  description,
  type,
}: EmployeeListDialogProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",

    })
  }

  const Icon = type === "birthday" ? Cake : type === "anniversary" ? Calendar : Mail
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon
              className={`h-5 w-5 ${
                type === "birthday"
                  ? "text-pink-500"
                  : type === "anniversary"
                  ? "text-purple-500"
                  : "text-blue-500"
              }`}
            />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {employees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {type === "birthday"
                ? "No birthdays this week"
                : type === "anniversary"
                ? "No anniversaries this week"
                : "No emails sent today"}
            </div>
          ) : type === "email" ? (
            // === EMAIL LOG DISPLAY ===
            (employees as EmailLog[]).map((email) => (
              <div
                key={email.id}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                    @
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base truncate">{email.recipientEmail}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate capitalize">{email.type}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium">{formatDate(email.sentAt)}</div>
                  <div className="text-xs text-muted-foreground mt-1">Sent</div>
                </div>
              </div>
            ))
          ) : (
            // === EMPLOYEE DISPLAY ===
            (employees as Employee[])?.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(employee.firstName, employee.lastName)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base">
                    {employee.firstName} {employee.lastName}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium">
                    {formatDate(type === "birthday" ? employee.birthDate : employee.entryDate)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {type === "birthday" ? "Birthday" : "Anniversary"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
