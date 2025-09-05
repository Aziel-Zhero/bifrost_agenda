import { Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { clients } from "@/lib/mock-data";
import { columns } from "../clientes/components/columns";
import { DataTable } from "../clientes/components/data-table";

export default function RelatoriosPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relatório de Clientes</h1>
          <p className="text-muted-foreground">
            Visualize todos os clientes cadastrados no sistema.
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Importar
            </Button>
            <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
            </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable columns={columns} data={clients} />
        </CardContent>
      </Card>
    </div>
  );
}
