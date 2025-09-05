import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  change,
}: StatsCardProps) {
  const isPositive = change && !change.startsWith("-");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p
            className={cn(
              "text-xs text-muted-foreground",
              isPositive ? "text-emerald-500" : "text-red-500"
            )}
          >
            {change} vs. último mês
          </p>
        )}
      </CardContent>
    </Card>
  );
}
