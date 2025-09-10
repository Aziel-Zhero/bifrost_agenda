"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface OverviewChartProps {
    data: { name: string; total: number }[];
}

export default function OverviewChart({ data }: OverviewChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            borderColor: 'hsl(var(--border))',
            borderRadius: 'var(--radius)',
          }}
          labelStyle={{
            color: 'hsl(var(--foreground))'
          }}
          formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Ganhos']}
        />
        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
            ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}