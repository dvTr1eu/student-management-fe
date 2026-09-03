import { cn } from '@/lib/utils'

type SummaryCard = {
  id: string
  value: number
  label: string
  active?: boolean
  onClick?: () => void
}

type ScheduleTodaySummaryProps = {
  title: string
  cards: SummaryCard[]
}

export function ScheduleTodaySummary({
  title,
  cards,
}: ScheduleTodaySummaryProps) {
  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium">{title}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            disabled={!card.onClick}
            onClick={card.onClick}
            className={cn(
              'rounded-lg border bg-background px-4 py-3 text-start transition-colors',
              card.onClick && 'hover:bg-muted/40',
              card.active && 'border-primary bg-primary/5',
              !card.onClick && 'cursor-default',
            )}
          >
            <p className="text-2xl font-semibold tracking-tight">{card.value}</p>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
