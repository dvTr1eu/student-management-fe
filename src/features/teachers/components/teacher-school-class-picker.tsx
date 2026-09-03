import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

export type SchoolOption = { id: string; name: string }
export type ClassOption = { id: string; name: string }

type TeacherSchoolClassPickerProps = {
  schools: SchoolOption[]
  classesBySchool: Record<string, ClassOption[]>
  schoolIds: string[]
  taughtClassIds: string[]
  onSchoolIdsChange: (ids: string[]) => void
  onTaughtClassIdsChange: (ids: string[]) => void
  isLoading?: boolean
}

export function TeacherSchoolClassPicker({
  schools,
  classesBySchool,
  schoolIds,
  taughtClassIds,
  onSchoolIdsChange,
  onTaughtClassIdsChange,
  isLoading,
}: TeacherSchoolClassPickerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // Expand schools that are selected or have taught classes
  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev }
      for (const school of schools) {
        const classes = classesBySchool[school.id] ?? []
        const hasTaughtClass = classes.some((c) =>
          taughtClassIds.includes(c.id),
        )
        if (
          (schoolIds.includes(school.id) || hasTaughtClass) &&
          next[school.id] === undefined
        ) {
          next[school.id] = true
        }
      }
      return next
    })
  }, [schoolIds, schools, classesBySchool, taughtClassIds])

  if (schools.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Chưa có trường đang hoạt động.
      </p>
    )
  }

  return (
    <div className="grid gap-1 rounded-md border p-2">
      {isLoading ? (
        <p className="px-1 py-2 text-sm text-muted-foreground">Đang tải lớp…</p>
      ) : null}
      {schools.map((school) => {
        const classes = classesBySchool[school.id] ?? []
        const schoolChecked = schoolIds.includes(school.id)
        const isOpen = expanded[school.id] ?? schoolChecked

        return (
          <Collapsible
            key={school.id}
            open={isOpen}
            onOpenChange={(open) =>
              setExpanded((prev) => ({ ...prev, [school.id]: open }))
            }
          >
            <div className="flex items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted/50">
              <Checkbox
                checked={schoolChecked}
                onCheckedChange={(value) => {
                  if (value) {
                    onSchoolIdsChange(
                      schoolIds.includes(school.id)
                        ? schoolIds
                        : [...schoolIds, school.id],
                    )
                    setExpanded((prev) => ({ ...prev, [school.id]: true }))
                  } else {
                    onSchoolIdsChange(
                      schoolIds.filter((id) => id !== school.id),
                    )
                    const classIdSet = new Set(classes.map((c) => c.id))
                    onTaughtClassIdsChange(
                      taughtClassIds.filter((id) => !classIdSet.has(id)),
                    )
                  }
                }}
                aria-label={`Chọn trường ${school.name}`}
              />
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-medium"
                >
                  <span className="truncate">{school.name}</span>
                  <ChevronDown
                    className={cn(
                      'ms-auto size-4 shrink-0 text-muted-foreground transition-transform',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent>
              {classes.length === 0 ? (
                <p className="ps-8 pb-2 text-xs text-muted-foreground">
                  Chưa có lớp Active.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 ps-8 pb-2 sm:grid-cols-3">
                  {classes.map((item) => {
                    const checked = taughtClassIds.includes(item.id)
                    return (
                      <label
                        key={item.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => {
                            if (value) {
                              if (!schoolIds.includes(school.id)) {
                                onSchoolIdsChange([...schoolIds, school.id])
                              }
                              if (!taughtClassIds.includes(item.id)) {
                                onTaughtClassIdsChange([
                                  ...taughtClassIds,
                                  item.id,
                                ])
                              }
                            } else {
                              onTaughtClassIdsChange(
                                taughtClassIds.filter((id) => id !== item.id),
                              )
                            }
                          }}
                        />
                        <span className="truncate">{item.name}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )
      })}
    </div>
  )
}
