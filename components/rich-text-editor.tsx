"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Palette,
  Highlighter,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onInsertPlaceholder?: (placeholder: string) => void
}

export function RichTextEditor({ value, onChange, placeholder, className, onInsertPlaceholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [textColorOpen, setTextColorOpen] = useState(false)
  const [bgColorOpen, setBgColorOpen] = useState(false)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  const insertLink = () => {
    const url = prompt("Enter URL:")
    if (url) {
      execCommand("createLink", url)
    }
  }

  const changeTextColor = (color: string) => {
    execCommand("foreColor", color)
    setTextColorOpen(false)
  }

  const changeBackgroundColor = (color: string) => {
    execCommand("hiliteColor", color)
    setBgColorOpen(false)
  }

  const colors = [
    { name: "Black", value: "#000000" },
    { name: "Dark Gray", value: "#4B5563" },
    { name: "Gray", value: "#9CA3AF" },
    { name: "Red", value: "#EF4444" },
    { name: "Orange", value: "#F97316" },
    { name: "Yellow", value: "#EAB308" },
    { name: "Green", value: "#10B981" },
    { name: "Emerald", value: "#059669" },
    { name: "Blue", value: "#3B82F6" },
    { name: "Indigo", value: "#6366F1" },
    { name: "Purple", value: "#A855F7" },
    { name: "Pink", value: "#EC4899" },
  ]

  const highlightColors = [
    { name: "None", value: "transparent" },
    { name: "Yellow", value: "#FEF08A" },
    { name: "Green", value: "#BBF7D0" },
    { name: "Blue", value: "#BFDBFE" },
    { name: "Purple", value: "#E9D5FF" },
    { name: "Pink", value: "#FBCFE8" },
    { name: "Red", value: "#FECACA" },
    { name: "Orange", value: "#FED7AA" },
  ]

  const formatButtons = [
    { icon: Bold, command: "bold", title: "Bold (Ctrl+B)" },
    { icon: Italic, command: "italic", title: "Italic (Ctrl+I)" },
    { icon: Underline, command: "underline", title: "Underline (Ctrl+U)" },
  ]

  const headingButtons = [
    { icon: Heading1, command: "formatBlock", value: "h1", title: "Heading 1" },
    { icon: Heading2, command: "formatBlock", value: "h2", title: "Heading 2" },
    { icon: Heading3, command: "formatBlock", value: "h3", title: "Heading 3" },
  ]

  const listButtons = [
    { icon: List, command: "insertUnorderedList", title: "Bullet List" },
    { icon: ListOrdered, command: "insertOrderedList", title: "Numbered List" },
  ]

  const alignButtons = [
    { icon: AlignLeft, command: "justifyLeft", title: "Align Left" },
    { icon: AlignCenter, command: "justifyCenter", title: "Align Center" },
    { icon: AlignRight, command: "justifyRight", title: "Align Right" },
  ]

  return (
    <div className={cn("rounded-lg border bg-background", isFocused && "ring-2 ring-ring ring-offset-2", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b p-2">
        {/* Format buttons */}
        {formatButtons.map(({ icon: Icon, command, title }) => (
          <Button
            key={command}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand(command)}
            title={title}
            className="h-8 w-8 p-0"
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}

        <div className="mx-1 w-px bg-border" />

        {/* Heading buttons */}
        {headingButtons.map(({ icon: Icon, command, value, title }) => (
          <Button
            key={value}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand(command, value)}
            title={title}
            className="h-8 w-8 p-0"
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}

        <div className="mx-1 w-px bg-border" />

        {/* List buttons */}
        {listButtons.map(({ icon: Icon, command, title }) => (
          <Button
            key={command}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand(command)}
            title={title}
            className="h-8 w-8 p-0"
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}

        <div className="mx-1 w-px bg-border" />

        {/* Align buttons */}
        {alignButtons.map(({ icon: Icon, command, title }) => (
          <Button
            key={command}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand(command)}
            title={title}
            className="h-8 w-8 p-0"
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}

        <div className="mx-1 w-px bg-border" />

        <Popover open={textColorOpen} onOpenChange={setTextColorOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" title="Text Color" className="h-8 w-8 p-0">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-2">
              <p className="text-sm font-medium">Text Color</p>
              <div className="grid grid-cols-6 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => changeTextColor(color.value)}
                    className="h-8 w-8 rounded border-2 border-border hover:border-foreground transition-colors"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={bgColorOpen} onOpenChange={setBgColorOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" title="Highlight Color" className="h-8 w-8 p-0">
              <Highlighter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-2">
              <p className="text-sm font-medium">Highlight Color</p>
              <div className="grid grid-cols-4 gap-2">
                {highlightColors.map((color) => (
                  <button
                    key={color.value}
                    onMouseDown={(e) => e.preventDefault()}
                    type="button"
                    onClick={() => changeBackgroundColor(color.value)}
                    className="h-8 w-full rounded border-2 border-border hover:border-foreground transition-colors"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="mx-1 w-px bg-border" />

        {/* Link button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertLink}
          title="Insert Link"
          className="h-8 w-8 p-0"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="min-h-[200px] p-4 outline-none prose prose-sm max-w-none dark:prose-invert"
        data-placeholder={placeholder}
        style={{
          wordBreak: "break-word",
        }}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
