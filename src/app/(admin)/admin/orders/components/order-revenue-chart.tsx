"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
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

interface OrderRevenueChartProps {
  data: DailyOrderStats[];
}

export function OrderRevenueChart({ data }: OrderRevenueChartProps) {
  // Process data to format dates and ensure proper numerical values
  const chartData = data.map(item => ({
    date: item.date,
    revenue: Number(item.total_revenue),
    orders: Number(item.order_count),
    displayDate: format(new Date(item.date), 'dd MMM', { locale: es })
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ingresos por Órdenes</CardTitle>
        <CardDescription>
          Ingresos totales diarios de las órdenes en los últimos 30 días
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 20,
              }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), "Ingresos"]}
                labelFormatter={(label) => `Fecha: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8884d8" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 