"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2, FileText, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/use-translation"
import api from "@/lib/api"
import { TemplateEditorDialog } from "@/components/template-editor-dialog"
import { TestEmailDialog } from "@/components/test-email-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
interface Template {
  id?: string
  name: string
  type: "BIRTHDAY" | "WORK_ANNIVERSARY"
  subject: string
  body: string
  createdAt?: string
  updatedAt?: string
}



export default function TemplatesPage() {
  const { toast } = useToast()
  const t = useTranslation()
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)
  const [testDialogOpen, setTestDialogOpen] = useState(false)
  const [templateToTest, setTemplateToTest] = useState<Template | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await api.get("/api/templates")
      setTemplates(response.data.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedTemplate(null)
    setEditorOpen(true)
  }

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template)
    setEditorOpen(true)
  }

  const handleSave = async (template: Template) => {
    try {
      if (template.id) {
        await api.put(`/api/templates/${template.id}`, template)
        toast({
          title: "Success",
          description: "Template updated successfully",
        })
      } else {
        await api.post("/api/templates", template)
        toast({
          title: "Success",
          description: "Template created successfully",
        })
      }
      fetchTemplates()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleDeleteClick = (id: string) => {
    setTemplateToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return

    try {
      await api.delete(`/api/templates/${templateToDelete}`)
      toast({
        title: "Success",
        description: "Template deleted successfully",
      })
      fetchTemplates()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
    }
  }

  const handleTestClick = (template: Template) => {
    setTemplateToTest(template)
    setTestDialogOpen(true)
  }

  const handleSendTest = async (data: { email: string; ccList: string[] }) => {
    if (!templateToTest) return

    try {
      await api.post("/api/templates/test-email", {
        templateType: templateToTest.type,
        email: data.email,
        ccList: data.ccList,
      })
      toast({
        title: "Success",
        description: `Test email sent to ${data.email}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      })
      throw error
    }
  }

  const getTypeBadgeColor = (type: string) => {
    return type === "BIRTHDAY" ? "bg-pink-500/10 text-pink-500" : "bg-purple-500/10 text-purple-500"
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }
 return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.templates.title}</h1>
          <p className="mt-2 text-muted-foreground">{t.templates.subtitle}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t.templates.createTemplate}
        </Button>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No templates yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Get started by creating your first email template</p>
            <Button onClick={handleCreate} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{template.name}</CardTitle>
                    <Badge className={getTypeBadgeColor(template.type)}>
                      {template.type === "BIRTHDAY" ? t.templates.birthday : t.templates.workAnniversary}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleTestClick(template)}>
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(template.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Subject</div>
                  <div className="mt-1 text-sm">{template.subject}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Body Preview</div>
                  <div
                    className="mt-1 line-clamp-3 text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: template.body }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Last updated: {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : "—"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor Dialog */}
      <TemplateEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        template={selectedTemplate}
        onSave={handleSave}
      />

      {/* Test Email Dialog */}
      <TestEmailDialog
        open={testDialogOpen}
        onOpenChange={setTestDialogOpen}
        template={templateToTest}
        onSend={handleSendTest}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.templates.deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription>{t.templates.deleteWarning}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>{t.common.delete}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
