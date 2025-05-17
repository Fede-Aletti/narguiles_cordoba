export type UserRole = 'superadmin' | 'admin' | 'marketing' | 'client';
export type GenderType = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type ProductStatus = 'in_stock' | 'out_of_stock' | 'running_low';
export type OrderStatus = 'in_cart' | 'placed' | 'confirmed' | 'processed' | 'pickup' | 'delivered';

export const PRODUCT_STATUS_VALUES: ProductStatus[] = ['in_stock', 'out_of_stock', 'running_low'];

export const PRODUCT_STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'in_stock', label: 'En Stock' },
  { value: 'out_of_stock', label: 'Agotado' },
  { value: 'running_low', label: 'Poco Stock' },
];

