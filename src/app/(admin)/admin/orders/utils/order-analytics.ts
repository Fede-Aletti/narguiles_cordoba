import { createClient } from "@/utils/supabase/server";

export type OrderStats = {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  total_items_sold: number;
};

export type DailyOrderStats = {
  date: string;
  order_count: number;
  total_revenue: number;
  average_order_value: number;
};

export type OrderStatusDistribution = {
  status: string;
  count: number;
  total_amount: number;
};

export type TopSellingProduct = {
  product_id: string;
  product_name: string;
  product_slug: string;
  total_quantity: number;
  total_revenue: number;
};

export async function getOrderStats(
  startDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  endDate: Date = new Date()
): Promise<OrderStats> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc('get_order_stats', {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString()
  });
  
  if (error) {
    console.error('Error fetching order stats:', error);
    return {
      total_orders: 0,
      total_revenue: 0,
      average_order_value: 0,
      total_items_sold: 0
    };
  }
  
  return data[0] || {
    total_orders: 0,
    total_revenue: 0,
    average_order_value: 0,
    total_items_sold: 0
  };
}

export async function getDailyOrderStats(
  startDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  endDate: Date = new Date()
): Promise<DailyOrderStats[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc('get_daily_order_stats', {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString()
  });
  
  if (error) {
    console.error('Error fetching daily order stats:', error);
    return [];
  }
  
  return data || [];
}

export async function getOrderStatusDistribution(): Promise<OrderStatusDistribution[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('order_status_distribution')
    .select('*');
  
  if (error) {
    console.error('Error fetching order status distribution:', error);
    return [];
  }
  
  return data || [];
}

export async function getTopSellingProducts(limit: number = 5): Promise<TopSellingProduct[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('top_selling_products')
    .select('*')
    .limit(limit);
  
  if (error) {
    console.error('Error fetching top selling products:', error);
    return [];
  }
  
  return data || [];
} 