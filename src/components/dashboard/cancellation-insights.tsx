"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Wand2, Loader2, Lightbulb, TrendingDown } from "lucide-react";

import { getCancellationInsights } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { CancellationInsightsOutput } from "@/ai/flows/cancellation-insights";

const formSchema = z.object({
  cancellationData: z.string().min(50, "Forneça pelo menos 50 caracteres de dados para análise."),
});

type FormValues = z.infer<typeof formSchema>;

export default function CancellationInsights() {
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<CancellationInsightsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cancellationData: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setInsights(null);
    setError(null);
    
    const result = await getCancellationInsights(data);

    if (result.success) {
      setInsights(result.data);
    } else {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-primary" />
          Insights de Cancelamento com IA
        </CardTitle>
        <CardDescription>
          Cole os dados de cancelamento (motivos, datas, clientes) para
          receber uma análise e sugestões para reduzir a taxa de cancelamento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="cancellationData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dados de Cancelamento</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: 15/07 - João Silva, motivo: pessoal. 16/07 - Maria Oliveira, motivo: conflito de agenda..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Gerar Insights
            </Button>
          </form>
        </Form>

        {error && (
          <div className="mt-6 rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-semibold">Erro na Análise</p>
            <p>{error}</p>
          </div>
        )}

        {insights && (
          <div className="mt-6 space-y-6">
            <h3 className="text-lg font-semibold">Resultados da Análise</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingDown className="h-5 w-5" />
                    Padrões e Motivos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{insights.summary}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lightbulb className="h-5 w-5" />
                    Sugestões de Melhoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   <p className="text-sm text-muted-foreground">{insights.suggestions}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
