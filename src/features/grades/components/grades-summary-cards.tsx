type SummaryCard = {
  value: string | number
  label: string
}

type GradesSummaryCardsProps = {
  cards: SummaryCard[]
}

export function GradesSummaryCards({ cards }: GradesSummaryCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border bg-background px-4 py-3"
        >
          <p className="text-2xl font-semibold tracking-tight">{card.value}</p>
          <p className="text-sm text-muted-foreground">{card.label}</p>
        </div>
      ))}
    </div>
  )
}
