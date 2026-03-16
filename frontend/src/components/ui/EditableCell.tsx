'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Check, X, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { clsx } from 'clsx'
import { useAutosave } from '@/hooks/useAutosave'

interface EditableCellProps {
  value: string
  onSave: (value: string) => Promise<void> | void
  className?: string
  placeholder?: string
  useAutosaveMode?: boolean
}

export function EditableCell({ 
  value: initialValue, 
  onSave, 
  className, 
  placeholder = 'Type...',
  useAutosaveMode = false 
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  // Handle Autosave behavior if enabled
  useAutosave(
    value,
    async (newValue) => {
      if (!useAutosaveMode || newValue === initialValue) return
      try {
        await onSave(newValue)
      } catch (err) {
        // Error already handled or toasted
      }
    },
    2000
  )

  const handleSave = async () => {
    if (value === initialValue) {
      setIsEditing(false)
      return
    }

    setIsLoading(true)
    try {
      await onSave(value)
      setIsEditing(false)
      toast.success('Field updated successfully')
    } catch (err) {
      toast.error('Failed to update field')
      setValue(initialValue)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setValue(initialValue)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') handleCancel()
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 min-w-[120px]">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={useAutosaveMode ? () => setIsEditing(false) : undefined}
          disabled={isLoading}
          placeholder={placeholder}
          className={clsx(
            "w-full px-2 py-1 text-sm bg-white border border-indigo-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-100",
            className
          )}
        />
        {!useAutosaveMode && (
          <div className="flex items-center">
            <button 
              onClick={handleSave} 
              disabled={isLoading}
              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
            >
              <Check size={14} />
            </button>
            <button 
              onClick={handleCancel} 
              disabled={isLoading}
              className="p-1 text-rose-600 hover:bg-rose-50 rounded"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div 
      onClick={() => setIsEditing(true)}
      className={clsx(
        "group flex items-center gap-2 cursor-pointer py-1 px-2 -ml-2 rounded-lg hover:bg-indigo-50/50 transition-colors truncate",
        className
      )}
    >
      <span className={clsx("font-semibold", !value && "text-slate-400 italic")}>
        {value || placeholder}
      </span>
      <Edit2 size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}
