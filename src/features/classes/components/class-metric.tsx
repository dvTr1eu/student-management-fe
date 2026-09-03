import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type ClassMetricProps = {
  icon: LucideIcon;
  value: string;
  label: string;
};

export function ClassMetric({ icon: Icon, value, label }: ClassMetricProps) {
  return (
    <Card className="rounded-md">
      <CardContent className="flex items-center gap-3 p-4">
        <Icon className="size-5 text-muted-foreground" />
        <div>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
