export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  MARKETING = 'marketing',
  CLIENT = 'client'
}

export enum GenderType {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}

export enum ProductStatus {
  IN_STOCK = 'in_stock',
  OUT_OF_STOCK = 'out_of_stock',
  RUNNING_LOW = 'running_low'
}

export enum OrderStatus {
  IN_CART = 'in_cart',
  PLACED = 'placed',
  CONFIRMED = 'confirmed',
  PROCESSED = 'processed',
  PICKUP = 'pickup',
  DELIVERED = 'delivered'
}

export const PRODUCT_STATUS_VALUES: ProductStatus[] = [
  ProductStatus.IN_STOCK,
  ProductStatus.OUT_OF_STOCK,
  ProductStatus.RUNNING_LOW
];

export const PRODUCT_STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: ProductStatus.IN_STOCK, label: 'En Stock' },
  { value: ProductStatus.OUT_OF_STOCK, label: 'Sin Stock' },
  { value: ProductStatus.RUNNING_LOW, label: 'Poco Stock' }
];

export const ORDER_STATUS_VALUES: OrderStatus[] = [
  OrderStatus.IN_CART,
  OrderStatus.PLACED,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSED,
  OrderStatus.PICKUP,
  OrderStatus.DELIVERED
];

