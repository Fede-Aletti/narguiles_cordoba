import type { Brand } from '@/interfaces/brand'
import type { Category } from '@/interfaces/category'
import type { Product as ProductBase } from '@/interfaces/product' // ProductBase ya tiene los campos base
import type { PriceGroup } from '@/interfaces/price-group'
import type { ProductStatus } from '@/interfaces/enums'
import { z } from 'zod'
import { PRODUCT_STATUS_VALUES } from '@/interfaces/enums'

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
export const productFormSchema = z.object({
  name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  slug: z.string().optional(), 
  stock: z.coerce.number().int().min(0, { message: 'El stock no puede ser negativo.' }),
  price: z.coerce.number().positive({ message: 'El precio debe ser positivo.' }).optional().nullable(),
  price_group_id: z.coerce.number().int().positive().optional().nullable(),
  brand_id: z.coerce.number().int().positive({ message: 'Selecciona una marca.' }),
  category_id: z.coerce.number().int().positive({ message: 'Selecciona una categoría.' }),
  status: z.enum(PRODUCT_STATUS_VALUES as [string, ...string[]], {
    errorMap: () => ({ message: "Selecciona un estado válido." })
  }),
  selectedMediaIds: z.array(z.number()).optional(),
}).refine(data => data.price || data.price_group_id, {
  message: "Debes especificar un precio o un grupo de precios.",
  path: ["price"], 
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export interface ProductFormData {
  id?: number;
  name: string;
  slug?: string;
  stock: number;
  price: number | null;
  price_group_id: number | null;
  brand_id: number;
  category_id: number;
  status: string;
  selectedMediaIds?: number[];
}

export interface Media {
  id: number;
  url: string;
  alt?: string;
} 