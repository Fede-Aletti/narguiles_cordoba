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
import { createProductAction } from "@/actions/product-actions";
import {
  fetchCategoriesForSelect,
  fetchBrandsForSelect,
  fetchPriceGroupsForSelect,
} from "@/lib/queries/product-queries";
import {
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_STATUS_VALUES,
  ProductStatus,
} from "@/interfaces/enums"; // Import PRODUCT_STATUS_OPTIONS
import type { ProductFormData } from "@/types/product";
import { useEffect, useState } from "react";
import { MediaGalleryPicker } from './media-gallery-picker';
import Image from 'next/image';

// Definir PRODUCT_STATUS_OPTIONS en enums.ts o aquí
// export const PRODUCT_STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
//   { value: 'in_stock', label: 'En Stock' },
//   { value: 'out_of_stock', label: 'Agotado' },
//   { value: 'running_low', label: 'Poco Stock' },
// ];

const productFormSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
    slug: z.string().optional(), // El slug se puede autogenerar si se deja vacío
    stock: z.coerce
      .number()
      .int()
      .min(0, { message: "El stock no puede ser negativo." }),
    price: z.coerce
      .number()
      .positive({ message: "El precio debe ser positivo." })
      .optional()
      .nullable(),
    price_group_id: z.coerce.number().int().positive().optional().nullable(),
    brand_id: z.coerce
      .number()
      .int()
      .positive({ message: "Selecciona una marca." }),
    category_id: z.coerce
      .number()
      .int()
      .positive({ message: "Selecciona una categoría." }),
    status: z.enum(PRODUCT_STATUS_VALUES as [string, ...string[]], {
      errorMap: () => ({ message: "Selecciona un estado válido." }),
    }),
    media_id: z.number().optional().nullable(),
    media_url: z.string().optional(),
  })
  .refine((data) => data.price || data.price_group_id, {
    message: "Debes especificar un precio o un grupo de precios.",
    path: ["price"], // O price_group_id, o un path general
  });

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  setOpen: (open: boolean) => void; // Para cerrar el diálogo
  productData?: ProductFormData;
  isEditing?: boolean;
}

export function ProductForm({ setOpen, productData, isEditing = false }: ProductFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      stock: 0,
      price: undefined,
      price_group_id: undefined,
      status: PRODUCT_STATUS_VALUES[0],
    },
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

  const mutation = useMutation({
    mutationFn: createProductAction,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["products"] }); // Invalida la cache de productos
        setOpen(false); // Cierra el diálogo
        form.reset();
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error(`Error inesperado: ${error.message}`);
    },
  });

  function onSubmit(values: ProductFormValues) {
    // Asegurarse que los campos opcionales que son números se envíen como null si están vacíos
    const payload: ProductFormData = {
      ...values,
      price: values.price || null,
      price_group_id: values.price_group_id || null,
      slug: values.slug || "",
      status: values.status as ProductStatus,
    };
    mutation.mutate(payload);
  }

  // Estado para manejar la URL de la imagen seleccionada
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | undefined>(
    isEditing && productData?.media_url ? productData.media_url : undefined
  );
  
  // Manejar la selección de imagen
  const handleSelectMedia = (media: { id: number; url: string; alt?: string }) => {
    form.setValue('media_id', media.id);
    form.setValue('media_url', media.url);
    setSelectedMediaUrl(media.url);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    value={field.value ?? ""} // Controlar el valor para que sea string vacío si es null/undefined
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? null
                          : parseFloat(e.target.value)
                      )
                    }
                    disabled={!!selectedPriceGroupId} // Deshabilitar si hay un grupo de precios seleccionado
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
                onValueChange={(value) => field.onChange(parseInt(value))} // Convertir a número
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
                onValueChange={(value) => field.onChange(parseInt(value))} // Convertir a número
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

        <FormField
          control={form.control}
          name="media_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagen del Producto</FormLabel>
              <div className="flex items-center gap-4">
                <FormControl>
                  <Input 
                    {...form.register('media_url')}
                    placeholder="URL de la imagen" 
                    value={form.watch('media_url') || ''}
                    onChange={(e) => form.setValue('media_url', e.target.value)}
                  />
                </FormControl>
                <MediaGalleryPicker
                  onSelectMedia={handleSelectMedia}
                  selectedUrl={selectedMediaUrl}
                />
              </div>
              {selectedMediaUrl && (
                <div className="mt-2 relative w-full h-40 rounded-md overflow-hidden border">
                  <Image
                    src={selectedMediaUrl}
                    alt="Preview"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? "Creando Producto..." : "Crear Producto"}
        </Button>
      </form>
    </Form>
  );
}
