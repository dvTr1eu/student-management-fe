import { useEffect, useRef, useState } from 'react'
import { Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type GradesScoreCellProps = {
  value: number | null
  locked?: boolean
  autoEdit?: boolean
  onSave: (value: number | null) => void
  onEditStart?: () => void
  onEditEnd?: () => void
  onMoveDown?: () => void
  onMoveNext?: () => void
}

export function GradesScoreCell({
  value,
  locked,
  autoEdit = false,
  onSave,
  onEditStart,
  onEditEnd,
  onMoveDown,
  onMoveNext,
}: GradesScoreCellProps) {
  const [editing, setEditing] = useState(autoEdit)
  const [draft, setDraft] = useState(value == null ? '' : String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoEdit) setEditing(true)
  }, [autoEdit])

  useEffect(() => {
    if (editing) {
      setDraft(value == null ? '' : String(value))
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing, value])

  if (locked) {
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        {value == null ? '—' : value.toFixed(1)}
        <Lock className="size-3" />
      </span>
    )
  }

  function startEdit() {
    setEditing(true)
    onEditStart?.()
  }

  function commit(nextMove?: 'down' | 'next') {
    const trimmed = draft.trim()
    if (trimmed === '') {
      onSave(null)
    } else {
      const parsed = Number(trimmed.replace(',', '.'))
      if (Number.isNaN(parsed) || parsed < 0 || parsed > 10) {
        setDraft(value == null ? '' : String(value))
        setEditing(false)
        onEditEnd?.()
        return
      }
      onSave(Math.round(parsed * 10) / 10)
    }
    setEditing(false)
    onEditEnd?.()
    if (nextMove === 'down') onMoveDown?.()
    if (nextMove === 'next') onMoveNext?.()
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={startEdit}
        className={cn(
          'w-full rounded px-1 py-0.5 text-start tabular-nums hover:bg-muted/60',
          value == null && 'text-muted-foreground',
        )}
      >
        {value == null ? '—' : value.toFixed(1)}
      </button>
    )
  }

  return (
    <Input
      ref={inputRef}
      value={draft}
      inputMode="decimal"
      className="h-7 w-14 px-1 text-center tabular-nums"
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => commit()}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          commit('down')
        } else if (event.key === 'Tab') {
          event.preventDefault()
          commit('next')
        } else if (event.key === 'Escape') {
          setDraft(value == null ? '' : String(value))
          setEditing(false)
          onEditEnd?.()
        }
      }}
    />
  )
}
