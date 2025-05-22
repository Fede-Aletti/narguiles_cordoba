"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  TooltipProps 
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DailyOrderStats } from "../utils/order-analytics";

interface OrderCountChartProps {
  data: DailyOrderStats[];
}

export function OrderCountChart({ data }: OrderCountChartProps) {
  // Process data to format dates and ensure proper numerical values
  const chartData = data.map(item => ({
    date: item.date,
    orders: Number(item.order_count),
    displayDate: format(new Date(item.date), 'dd MMM', { locale: es })
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Cantidad de Órdenes</CardTitle>
        <CardDescription>
          Número de órdenes diarias en los últimos 30 días
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}`, "Órdenes"]}
                labelFormatter={(label) => `Fecha: ${label}`}
              />
              <Bar 
                dataKey="orders" 
                fill="#82ca9d" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 