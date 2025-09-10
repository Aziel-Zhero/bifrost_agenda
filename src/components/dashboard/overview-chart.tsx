
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface OverviewChartProps {
    data: { name: string; total: number }[];
}

// Define uma função para obter a cor da barra com base no índice do mês
const getPath = (x: number, y: number, width: number, height: number) => {
  return `M${x},${y + height}C${x + width / 3},${y + height} ${x + width / 2},${y + height / 3}
  ${x + width / 2}, ${y}
  C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${x + width}, ${y + height}
  Z`;
};

const TriangleBar = (props: any) => {
  const { fill, x, y, width, height } = props;

  return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
};


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
         {data.map((entry, index) => (
          <Bar
            key={`bar-${entry.name}`}
            dataKey="total"
            fill={`hsl(var(--chart-${(index % 5) + 1}))`} // Cycle through chart-1 to chart-5
            radius={[4, 4, 0, 0]}
            shape={<TriangleBar />}
            data={data.filter(d => d.name === entry.name)} // Pass only this bar's data
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

    