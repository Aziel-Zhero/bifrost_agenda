import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { clients } from "@/lib/mock-data";
import { columns } from "./components/columns";
import { DataTable } from "@/app/dashboard/clientes/components/data-table";

// Mocking current user
const currentUser = "Admin Master";

export default function MeusClientesPage() {
  const myClients = clients.filter(client => client.admin === currentUser);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meus Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie os clientes que são designados a você.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Cliente
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable columns={columns} data={myClients} />
        </CardContent>
      </Card>
    </div>
  );
}
