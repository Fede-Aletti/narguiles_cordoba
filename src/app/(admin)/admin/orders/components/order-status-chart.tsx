"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";
import { OrderStatusDistribution } from "../utils/order-analytics";

interface OrderStatusChartProps {
  data: OrderStatusDistribution[];
}

// Map status values to Spanish display names
const statusDisplayNames: Record<string, string> = {
  in_cart: "En Carrito",
  placed: "Colocada",
  confirmed: "Confirmada",
  processed: "Procesada",
  pickup: "Para Retirar",
  delivered: "Entregada"
};

// Color palette for different statuses
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B'];

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const chartData = data.map((item, index) => ({
    name: statusDisplayNames[item.status] || item.status,
    value: Number(item.count),
    amount: Number(item.total_amount)
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  };

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 border border-border rounded-md shadow-sm">
          <p className="font-medium text-sm">{payload[0].name}</p>
          <p className="text-sm">Cantidad: <span className="font-semibold">{payload[0].value}</span></p>
          <p className="text-sm">Total: <span className="font-semibold">{formatCurrency(payload[0].payload.amount)}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Distribución por Estado</CardTitle>
        <CardDescription>
          Distribución de órdenes por estado en los últimos 90 días
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={customTooltip} />
              <Legend layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 