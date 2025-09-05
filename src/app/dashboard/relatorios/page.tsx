import { Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { appointments, clients } from "@/lib/mock-data";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import type { AppointmentReport } from "@/types";

export default function RelatoriosPage() {

  const appointmentReports: AppointmentReport[] = appointments.map(appt => {
    const client = clients.find(c => c.name === appt.clientName);
    return {
      ...appt,
      whatsapp: client?.whatsapp || 'N/A',
      telegram: client?.telegram || 'N/A'
    }
  })


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relatório de Agendamentos</h1>
          <p className="text-muted-foreground">
            Visualize todos os agendamentos cadastrados no sistema.
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
          <DataTable columns={columns} data={appointmentReports} />
        </CardContent>
      </Card>
    </div>
  );
}
