import type { Brand } from '@/interfaces/brand'
import type { Category } from '@/interfaces/category'
import type { Product as ProductBase } from '@/interfaces/product' // ProductBase ya tiene los campos base
import type { PriceGroup } from '@/interfaces/price-group'
import type { ProductStatus } from '@/interfaces/enums'

// Este tipo representará la fila de la tabla, incluyendo datos relacionados
export type ProductRow = Omit<
  ProductBase,
  'brand_id' | 'category_id' | 'price_group_id' | 'created_by' | 'status'
> & {
  id: number // Aseguramos que id es number
  status: ProductStatus
  brand: Pick<Brand, 'name'> | null
  category: Pick<Category, 'name'> | null
  price_group: Pick<PriceGroup, 'name'> | null
  // Si quieres mostrar quién lo creó, necesitarías un join a la tabla user y añadirlo aquí
  // created_by_user: { first_name: string, last_name: string } | null;
}

// Tipo para el formulario de creación/edición
export type ProductFormData = {
  name: string
  slug: string
  stock: number
  price?: number | null // Price es opcional si hay price_group_id
  price_group_id?: number | null
  brand_id: number
  category_id: number
  status: ProductStatus
} 