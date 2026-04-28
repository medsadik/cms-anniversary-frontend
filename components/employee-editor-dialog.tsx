"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EmailMultiSelect } from "@/components/email-multi-select"
import { useTranslation } from "@/hooks/use-translation"

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  birthDate: string
  entryDate: string
  manager: string
  ccListEmails: string[]
}

interface EmployeeEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee | null
  onSave: (employee: Employee) => Promise<void>
  employees: Employee[]
}

export function EmployeeEditorDialog({ open, onOpenChange, employee, onSave, employees }: EmployeeEditorDialogProps) {
  const t = useTranslation()
  const [formData, setFormData] = useState<Employee>({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    birthDate: "",
    entryDate: "",
    manager: "",
    ccListEmails: [],
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (employee) {
      setFormData(employee)
    }
  }, [employee, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await onSave(formData)
      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  if (!employee) return null

  const emailSuggestions = employees.map((emp) => emp.email)
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.employees.editEmployee}</DialogTitle>
          <DialogDescription>{t.employees.subtitle}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t.employees.firstName}</Label>
              <Input
                id="firstName"
                placeholder="John"
                              disabled={true}

                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">{t.employees.lastName}</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                              disabled={true}

                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t.employees.email}</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@company.com"
              value={formData.email}
                            disabled={true}

              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate">{t.employees.birthDate}</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                              disabled={true}

                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entryDate">{t.employees.entryDate}</Label>
              <Input
                id="entryDate"
                type="date"
                              disabled={true}

                value={formData.entryDate}
                onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="manager">Manager</Label>
            <Input
              id="manager"
              placeholder="Manager Name"
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
            />
          </div> */}

          <div className="space-y-2">
            <Label htmlFor="ccList">{t.employees.ccList}</Label>
            <EmailMultiSelect
              value={formData.ccListEmails ?? []}
              onChange={(ccList) => setFormData({ ...formData, ccListEmails: ccList })}
              suggestions={emailSuggestions}
              placeholder="Type to search employee emails..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? t.common.loading : t.employees.editEmployee}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
