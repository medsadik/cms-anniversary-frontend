"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface EmailMultiSelectProps {
  value: string[]
  onChange: (emails: string[]) => void
  suggestions: string[]
  placeholder?: string
}

export function EmailMultiSelect({
  value,
  onChange,
  suggestions,
  placeholder,
}: EmailMultiSelectProps) {
  const [inputValue, setInputValue] = useState("")
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter suggestions
  const filteredSuggestions = suggestions?.filter(
    (email) =>
      email.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value?.includes(email),
  )

  const handleAddEmail = (email: string) => {
    if (email && !value?.includes(email)) {
      onChange([...value, email])
      setInputValue("")
      setOpen(false)
      // Focus back to input after adding email
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  const handleRemoveEmail = (emailToRemove: string) => {
    onChange(value.filter((email) => email !== emailToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue) {
      e.preventDefault()
      if (inputValue.includes("@")) {
        handleAddEmail(inputValue)
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      handleRemoveEmail(value[value.length - 1])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    // Open popover when user types and there are suggestions
    if (e.target.value && filteredSuggestions?.length > 0) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }

  // Keep input focused when popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  return (
    <div className="space-y-2 relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            className="flex flex-wrap gap-2 p-2 border rounded-md bg-background min-h-[42px] cursor-text"
            onClick={() => {
              setOpen(true)
              inputRef.current?.focus()
            }}
          >
            {value?.map((email) => (
              <Badge key={email} variant="secondary" className="gap-1">
                {email}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveEmail(email)
                  }}
                  className="ml-1 hover:bg-muted rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}

            <Input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (inputValue && filteredSuggestions?.length > 0) {
                  setOpen(true)
                }
              }}
              placeholder={value?.length === 0 ? placeholder : ""}
              className="flex-1 border-0 shadow-none focus-visible:ring-0 min-w-[100px] h-auto p-0"
            />
          </div>
        </PopoverTrigger>

        {filteredSuggestions?.length > 0 && (
          <PopoverContent 
            className="w-[400px] p-0" 
            align="start"
            sideOffset={4}
            onOpenAutoFocus={(e) => e.preventDefault()} // 👈 Prevent focus steal
            onCloseAutoFocus={(e) => e.preventDefault()} // 👈 Prevent focus steal
          >
            <Command>
              <CommandList>
                <CommandEmpty>No suggestions found</CommandEmpty>
                <CommandGroup>
                  {filteredSuggestions?.map((email) => (
                    <CommandItem
                      key={email}
                      value={email}
                      onSelect={() => handleAddEmail(email)}
                      onMouseDown={(e) => {
                        e.preventDefault() // Prevent input blur
                        e.stopPropagation() // Prevent other events
                      }}
                    >
                      {email}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>

      <p className="text-xs text-muted-foreground">
        Type to search or enter email addresses. Press Enter to add.
      </p>
    </div>
  )
}