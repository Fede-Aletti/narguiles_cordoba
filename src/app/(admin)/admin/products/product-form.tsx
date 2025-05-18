"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // o from 'react-hot-toast'
import { createProductAction, updateProductAction } from "@/actions/product-actions";
import {
  fetchCategoriesForSelect,
  fetchBrandsForSelect,
  fetchPriceGroupsForSelect,
  useProductMediaQuery,
} from "@/lib/queries/product-queries";
import {
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_STATUS_VALUES,
  ProductStatus,
} from "@/interfaces/enums"; // Import PRODUCT_STATUS_OPTIONS
import type { Media, ProductFormData } from "@/types/product";
import { useEffect, useState } from "react";
import { MediaGalleryPicker } from './media-gallery-picker';
import Image from 'next/image';
import { X } from 'lucide-react';


// Definir PRODUCT_STATUS_OPTIONS en enums.ts o aquí
// export const PRODUCT_STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
//   { value: 'in_stock', label: 'En Stock' },
//   { value: 'out_of_stock', label: 'Agotado' },
//   { value: 'running_low', label: 'Poco Stock' },
// ];

const productFormSchema = z.object({
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

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  setOpen: (open: boolean) => void; // Para cerrar el diálogo
  productData?: ProductFormData;
  isEditing?: boolean;
}

export function ProductForm({ setOpen, productData, isEditing = false }: ProductFormProps) {
  const queryClient = useQueryClient();
  const [selectedMedia, setSelectedMedia] = useState<Media[]>([]);

  const { data: productMedia } = useProductMediaQuery(productData?.id);

  useEffect(() => {
    if (productMedia && productMedia.length > 0) {
      setSelectedMedia(productMedia as unknown as Media[]);
      form.setValue(
        'selectedMediaIds', 
        productMedia.map(m => typeof m === 'object' && m !== null && 'id' in m ? m.id : null)
          .filter(Boolean) as number[]
      );
    }
  }, [productMedia]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: isEditing && productData 
      ? {
          name: productData.name,
          slug: productData.slug,
          stock: productData.stock,
          price: productData.price,
          price_group_id: productData.price_group_id,
          brand_id: productData.brand_id,
          category_id: productData.category_id,
          status: productData.status,
          selectedMediaIds: [],
        }
      : {
          name: '',
          slug: '',
          stock: 0,
          price: undefined,
          price_group_id: undefined,
          status: PRODUCT_STATUS_VALUES[0],
          selectedMediaIds: [],
        }
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categoriesForSelect"],
    queryFn: fetchCategoriesForSelect,
  });

  const { data: brands, isLoading: isLoadingBrands } = useQuery({
    queryKey: ["brandsForSelect"],
    queryFn: fetchBrandsForSelect,
  });

  const { data: priceGroups, isLoading: isLoadingPriceGroups } = useQuery({
    queryKey: ["priceGroupsForSelect"],
    queryFn: fetchPriceGroupsForSelect,
  });

  const selectedPriceGroupId = form.watch("price_group_id");

  useEffect(() => {
    if (selectedPriceGroupId) {
      const selectedGroup = priceGroups?.find(
        (pg) => pg.id === selectedPriceGroupId
      );
      if (selectedGroup) {
        form.setValue("price", selectedGroup.price, { shouldValidate: true });
      }
    }
  }, [selectedPriceGroupId, priceGroups, form]);

  const handleSelectMedia = (media: Media, isMultiple = false) => {
    if (isMultiple) {
      if (selectedMedia.some(m => m.id === media.id)) {
        const filtered = selectedMedia.filter(m => m.id !== media.id);
        setSelectedMedia(filtered);
        form.setValue('selectedMediaIds', filtered.map(m => m.id));
      } else {
        const newSelection = [...selectedMedia, media];
        setSelectedMedia(newSelection);
        form.setValue('selectedMediaIds', newSelection.map(m => m.id));
      }
    } else {
      setSelectedMedia([media]);
      form.setValue('selectedMediaIds', [media.id]);
    }
  };

  const createMutation = useMutation({
    mutationFn: createProductAction,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof form.getValues) => {
      if (!productData?.id) throw new Error('ID de producto no encontrado');
      return updateProductAction(productData.id, data as unknown as ProductFormData);
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-media', productData?.id] });
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  function onSubmit(values: typeof form.getValues) {
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values as unknown as ProductFormData);
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Producto</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Shisha Deluxe"
                  {...field}
                  aria-describedby="name-message"
                />
              </FormControl>
              <FormMessage id="name-message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (Opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: shisha-deluxe"
                  {...field}
                  aria-describedby="slug-message"
                />
              </FormControl>
              <FormDescription>
                Si se deja vacío, se generará automáticamente.
              </FormDescription>
              <FormMessage id="slug-message" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    aria-describedby="stock-message"
                  />
                </FormControl>
                <FormMessage id="stock-message" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger aria-label="Seleccionar estado del producto">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRODUCT_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price_group_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grupo de Precios (Opcional)</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value ? parseInt(value) : undefined)
                  }
                  value={field.value?.toString() ?? undefined}
                  defaultValue={field.value?.toString() ?? undefined}
                  disabled={isLoadingPriceGroups}
                >
                  <FormControl>
                    <SelectTrigger aria-label="Seleccionar grupo de precios">
                      <SelectValue
                        placeholder={
                          isLoadingPriceGroups
                            ? "Cargando..."
                            : "Selecciona un grupo"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {priceGroups?.map((group) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.name} ({Number(group.price).toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Si seleccionas un grupo, el precio se establecerá
                  automáticamente.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio (si no usa Grupo)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? null
                          : parseFloat(e.target.value)
                      )
                    }
                    disabled={!!selectedPriceGroupId}
                    aria-describedby="price-message"
                  />
                </FormControl>
                <FormMessage id="price-message" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value?.toString()}
                disabled={isLoadingCategories}
              >
                <FormControl>
                  <SelectTrigger aria-label="Seleccionar categoría">
                    <SelectValue
                      placeholder={
                        isLoadingCategories
                          ? "Cargando..."
                          : "Selecciona una categoría"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brand_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marca</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value?.toString()}
                disabled={isLoadingBrands}
              >
                <FormControl>
                  <SelectTrigger aria-label="Seleccionar marca">
                    <SelectValue
                      placeholder={
                        isLoadingBrands ? "Cargando..." : "Selecciona una marca"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {brands?.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Imágenes del producto</h3>
            <MediaGalleryPicker 
              onSelectMedia={(media) => handleSelectMedia(media, true)} 
              selectedMediaIds={selectedMedia.map(m => m.id)}
              multiSelect={true}
            />
          </div>
          
          {selectedMedia.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {selectedMedia.map(media => (
                <div key={media.id} className="relative group aspect-square border rounded-md overflow-hidden">
                  <Image
                    src={media.url}
                    alt={media.alt || "Imagen del producto"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <button
                    type="button"
                    onClick={() => handleSelectMedia(media, true)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center"
                  >
                    <X className="h-6 w-6 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
          {createMutation.isPending || updateMutation.isPending
            ? isEditing ? "Actualizando..." : "Creando..."
            : isEditing ? "Actualizar Producto" : "Crear Producto"}
        </Button>
      </form>
    </Form>
  );
}
