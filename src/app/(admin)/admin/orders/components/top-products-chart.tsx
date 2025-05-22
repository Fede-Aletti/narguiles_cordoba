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
  LabelList
} from "recharts";
import { TopSellingProduct } from "../utils/order-analytics";

interface TopProductsChartProps {
  data: TopSellingProduct[];
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  // Process data to format product names
  const chartData = data.map(item => ({
    name: item.product_name.length > 20 
      ? item.product_name.substring(0, 20) + '...' 
      : item.product_name,
    quantity: Number(item.total_quantity),
    revenue: Number(item.total_revenue),
    // Store full details for tooltip
    fullName: item.product_name,
    slug: item.product_slug
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  };

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border border-border rounded-md shadow-sm">
          <p className="font-medium">{payload[0].payload.fullName}</p>
          <p className="text-sm mt-1">Unidades vendidas: <span className="font-semibold">{payload[0].value}</span></p>
          <p className="text-sm">Ingresos generados: <span className="font-semibold">{formatCurrency(payload[0].payload.revenue)}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Productos Más Vendidos</CardTitle>
        <CardDescription>
          Los 5 productos más vendidos en los últimos 90 días
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 10,
                right: 30,
                left: 50,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 12 }}
                width={120}
              />
              <Tooltip content={customTooltip} />
              <Bar 
                dataKey="quantity" 
                fill="#8884d8"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 