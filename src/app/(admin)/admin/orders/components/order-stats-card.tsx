"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStats } from "../utils/order-analytics";
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, CreditCard } from "lucide-react";

interface OrderStatsCardProps {
  stats: OrderStats;
  title: string;
  description: string;
  metric: keyof OrderStats;
  previousValue?: number;
  formatValue?: (value: number) => string;
  formattedValue?: string;
  icon: "orders" | "revenue" | "items" | "average";
}

export function OrderStatsCard({ 
  stats, 
  title, 
  description, 
  metric, 
  previousValue, 
  formatValue,
  formattedValue,
  icon
}: OrderStatsCardProps) {
  const value = stats[metric] || 0;
  
  // Calculate percentage change if previous value provided
  let percentChange = 0;
  let trending: "up" | "down" | "neutral" = "neutral";
  
  if (previousValue !== undefined && previousValue > 0) {
    percentChange = ((value - previousValue) / previousValue) * 100;
    trending = percentChange > 0 ? "up" : percentChange < 0 ? "down" : "neutral";
  }

  // Use formattedValue if provided, otherwise use formatValue or convert to string
  const displayValue = formattedValue 
    ? formattedValue 
    : formatValue 
      ? formatValue(value) 
      : value.toString();

  const renderIcon = () => {
    const iconClasses = "h-5 w-5";
    
    switch (icon) {
      case "orders":
        return <ShoppingCart className={iconClasses} />;
      case "revenue":
        return <DollarSign className={iconClasses} />;
      case "items":
        return <Package className={iconClasses} />;
      case "average":
        return <CreditCard className={iconClasses} />;
      default:
        return <ShoppingCart className={iconClasses} />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <div className={`
            p-2 rounded-full 
            ${trending === "up" 
              ? "bg-green-100 text-green-700" 
              : trending === "down" 
                ? "bg-red-100 text-red-700" 
                : "bg-gray-100 text-gray-700"}
          `}>
            {renderIcon()}
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold">{displayValue}</div>
          {previousValue !== undefined && (
            <div className="flex items-center text-sm">
              {trending === "up" ? (
                <>
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">
                    +{Math.abs(percentChange).toFixed(1)}%
                  </span>
                </>
              ) : trending === "down" ? (
                <>
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                  <span className="text-red-600 font-medium">
                    -{Math.abs(percentChange).toFixed(1)}%
                  </span>
                </>
              ) : (
                <span className="text-gray-500">Sin cambios</span>
              )}
              <span className="text-gray-500 ml-1">desde el período anterior</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 