"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RichTextEditor } from "@/components/rich-text-editor"

interface Template {
  id?: string
  name: string
  type: "BIRTHDAY" | "WORK_ANNIVERSARY"
  subject: string
  body: string
}

interface TemplateEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: Template | null
  onSave: (template: Template) => Promise<void>
}

const placeholders = [
  { value: "{{firstName}}", label: "First Name" },
  { value: "{{lastName}}", label: "Last Name" },
]

export function TemplateEditorDialog({ open, onOpenChange, template, onSave }: TemplateEditorDialogProps) {
  const [formData, setFormData] = useState<Template>({
    name: "",
    type: "BIRTHDAY",
    subject: "",
    body: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (template) {
      setFormData(template)
    } else {
      setFormData({
        name: "",
        type: "BIRTHDAY",
        subject: "",
        body: "",
      })
    }
  }, [template, open])

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

  const insertPlaceholder = (placeholder: string) => {
    setFormData({
      ...formData,
      body: formData.body + placeholder,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? "Edit Template" : "Create Template"}</DialogTitle>
          <DialogDescription>
            {template ? "Update the email template details" : "Create a new email template for anniversaries"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              placeholder="e.g., Birthday Email Template"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "BIRTHDAY" | "WORK_ANNIVERSARY") => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BIRTHDAY">Birthday</SelectItem>
                <SelectItem value="WORK_ANNIVERSARY">Work Anniversary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="e.g., Happy Birthday {{firstName}}!"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center ">
              <Label htmlFor="body">Email Body</Label>
              <div className="flex gap-1 ml-2">
                {placeholders.map((ph) => (
                  <Button
                    key={ph.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertPlaceholder(ph.value)}
                    className="text-xs"
                  >
                    {ph.label}
                  </Button>
                ))}
              </div>
            </div>
            <RichTextEditor
              value={formData.body}
              onChange={(value) => setFormData({ ...formData, body: value })}
              placeholder="Write your email template here. Use placeholders like {{firstName}}, {{lastName}}, {{yearsOfService}}, {{managerName}}"
            />
            <p className="text-xs text-muted-foreground">
              Available placeholders: {placeholders.map((p) => p.value).join(", ")}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : template ? "Update Template" : "Create Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
