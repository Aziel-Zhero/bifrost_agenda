
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';

export default function DashboardRedirectPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-8 text-center">
       <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Bem-vindo ao Bifrost Central</h1>
        <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Sua plataforma completa para gerenciamento de agendamentos e clientes. Navegue pelas seções para começar.
        </p>
      </div>
      <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center">
        <Button asChild size="lg">
          <Link href="/dashboard/agenda">Ver Agenda</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/dashboard/meus-clientes">Meus Clientes</Link>
        </Button>
      </div>
    </div>
  );
}
