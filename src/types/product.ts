import type { IBrand } from '@/interfaces/brand'
import type { ICategory } from '@/interfaces/category'
import type { IProduct as ProductBase } from '@/interfaces/product' // IProduct already uses string IDs
import type { IPriceGroup } from '@/interfaces/price-group' // Changed from PriceGroup
import type { ProductStatus } from '@/interfaces/enums'
import { z } from 'zod'
import { PRODUCT_STATUS_VALUES } from '@/interfaces/enums'

// Este tipo representará la fila de la tabla, incluyendo datos relacionados
export type ProductRow = Omit<
  ProductBase,
  // Omitting IDs for related entities, as ProductRow will have the full objects.
  // Also omitting fields redefined below or not needed for row display.
  'brand_id' | 'category_id' | 'price_group_id' | 'created_by' 
  // 'status' is redefined, 'product_media' and 'images' are kept from ProductBase if not omitted.
> & {
  // id is already string in ProductBase (IProduct)
  // name, slug, description, stock, price are from ProductBase
  // created_at, updated_at, deleted_at are from ProductBase
  // product_media and images are from ProductBase

  // Redefine status to ensure it's not omitted by mistake if it was in the Omit list.
  status: ProductStatus;

  // Expect the full related objects as they are in IProduct (which is ProductBase)
  // These are not strictly needed here if ProductBase already has them and they are not in Omit<...>
  // However, making them explicit here can clarify the ProductRow structure.
  // If ProductBase (IProduct) defines them as optional (e.g. brand?: IBrand | null),
  // this will align. If ProductBase omits them, then this adds them back.
  brand: ProductBase['brand']; 
  category: ProductBase['category'];
  price_group: ProductBase['price_group'];
};

// Tipo para el formulario de creación/edición
export const productFormSchema = z.object({
  name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  slug: z.string().optional(), 
  description: z.string().optional().nullable(),
  stock: z.coerce.number().int().min(0, { message: 'El stock no puede ser negativo.' }),
  price: z.coerce.number().positive({ message: 'El precio debe ser positivo.' }).optional().nullable(),
  price_group_id: z.string().uuid({ message: "ID de grupo de precios debe ser un UUID válido."}).optional().nullable(),
  brand_id: z.string().uuid({ message: "ID de marca debe ser un UUID válido."}).optional().nullable(), // Made optional and nullable
  category_id: z.string().uuid({ message: "ID de categoría debe ser un UUID válido."}).optional().nullable(), // Made optional and nullable
  status: z.enum(PRODUCT_STATUS_VALUES as [string, ...string[]], {
    errorMap: () => ({ message: "Selecciona un estado válido." })
  }),
  selectedMediaIds: z.array(z.string().uuid()).optional(),
}).refine(data => data.price || data.price_group_id, {
  message: "Debes especificar un precio o un grupo de precios.",
  path: ["price"], 
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

// This ProductFormData seems redundant if ProductFormValues is used, but let's update it too.
export interface ProductFormData {
  id?: string; // string UUID
  name: string;
  slug?: string;
  description?: string | null;
  stock: number; // stock is number
  price: number | null;
  price_group_id: string | null; // string UUID
  brand_id: string | null; // Updated to allow null from schema change
  category_id: string | null; // Updated to allow null from schema change
  status: ProductStatus; // Corrected from string to ProductStatus
  selectedMediaIds?: string[]; // Array of string UUIDs
}

// Media type for product images, aligning with IMediaItem's relevant fields
export interface Media { // This was used in columns.tsx for product_media.media
  id: string; // string UUID
  url: string;
  alt_text?: string | null; // Changed from alt to alt_text to match IMediaItem
  name?: string; // Added name to match IMediaItem
} 