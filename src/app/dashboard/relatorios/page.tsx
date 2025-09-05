import CancellationInsights from "@/components/dashboard/cancellation-insights";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

export default function RelatoriosPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relatórios e Insights</h1>
          <p className="text-muted-foreground">
            Analise dados e extraia informações valiosas.
          </p>
        </div>
      </div>

      <CancellationInsights />

      <Card>
        <CardHeader>
          <CardTitle>Exportar Relatórios</CardTitle>
          <CardDescription>
            Gere relatórios completos em diversos formatos.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Relatório Diário (PDF)
          </Button>
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Relatório Mensal (CSV)
          </Button>
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Histórico por Cliente (Excel)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
