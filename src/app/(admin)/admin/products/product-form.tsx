"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { toast } from "sonner";
import {
  createProductAction,
  updateProductAction,
  type ProductFormData as ActionProductFormData,
} from "@/actions/product-actions";
import {
  fetchCategoriesForSelect,
  fetchBrandsForSelect,
  fetchPriceGroupsForSelect,
  useProductMediaItems,
  type CategorySelectOption,
  type BrandSelectOption,
  type PriceGroupSelectOption,
} from "@/lib/queries/product-queries";
import {
  PRODUCT_STATUS_OPTIONS,
  ProductStatus,
} from "@/interfaces/enums";
import {
  type Media,
  productFormSchema,
  type ProductFormValues,
  type ProductFormData,
} from "@/types/product";
import { useEffect, useState } from "react";
import { MediaGalleryPicker } from './media-gallery-picker';
import Image from 'next/image';
import { X } from 'lucide-react';

interface ProductFormProps {
  setOpen: (open: boolean) => void;
  productData?: ProductFormData;
  isEditing?: boolean;
}

export function ProductForm({ setOpen, productData, isEditing = false }: ProductFormProps) {
  const queryClient = useQueryClient();
  const [selectedMedia, setSelectedMedia] = useState<Media[]>([]);
  const [formReady, setFormReady] = useState(!isEditing);

  const { data: initialProductMedia } = useProductMediaItems(productData?.id);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: isEditing && productData
      ? {
          name: productData.name,
          slug: productData.slug ?? undefined,
          description: productData.description ?? null,
          stock: productData.stock,
          price: productData.price,
          price_group_id: productData.price_group_id ?? null,
          brand_id: productData.brand_id ?? null,
          category_id: productData.category_id ?? null,
          status: productData.status as ProductStatus,
          selectedMediaIds: productData.selectedMediaIds ?? [],
        }
      : {
          name: '',
          slug: '',
          description: null,
          stock: 0,
          price: null,
          price_group_id: null,
          brand_id: null,
          category_id: null,
          status: PRODUCT_STATUS_OPTIONS[0].value,
          selectedMediaIds: [],
        },
  });

  useEffect(() => {
    if (initialProductMedia && initialProductMedia.length > 0) {
      setSelectedMedia(initialProductMedia as Media[]);
      form.setValue(
        'selectedMediaIds',
        initialProductMedia.map(m => m.id).filter(Boolean) as string[]
      );
    }
  }, [initialProductMedia, form]);

  const { data: categories, isLoading: isLoadingCategories } = useQuery<CategorySelectOption[], Error>({
    queryKey: ["categoriesForSelect"],
    queryFn: fetchCategoriesForSelect,
  });

  const { data: brands, isLoading: isLoadingBrands } = useQuery<BrandSelectOption[], Error>({
    queryKey: ["brandsForSelect"],
    queryFn: fetchBrandsForSelect,
  });

  const { data: priceGroups, isLoading: isLoadingPriceGroups } = useQuery<PriceGroupSelectOption[], Error>({
    queryKey: ["priceGroupsForSelect"],
    queryFn: fetchPriceGroupsForSelect,
  });

  const isLoading = isLoadingCategories || isLoadingBrands || isLoadingPriceGroups;

  useEffect(() => {
    if (isEditing && productData && !isLoading) {
      console.log("Datos cargados, estableciendo valores del formulario:", {
        price_group_id: productData.price_group_id,
        brand_id: productData.brand_id,
        category_id: productData.category_id
      });
      
      form.setValue('price_group_id', productData.price_group_id ?? null);
      form.setValue('brand_id', productData.brand_id ?? null);
      form.setValue('category_id', productData.category_id ?? null);
      
      setFormReady(true);
    }
  }, [isEditing, productData, isLoading, form]);

  const selectedPriceGroupId = form.watch("price_group_id");

  useEffect(() => {
    if (isEditing) {
      const values = form.getValues();
      console.log("Valores actuales del formulario:", {
        price_group_id: values.price_group_id,
        brand_id: values.brand_id,
        category_id: values.category_id
      });
    }
  }, [isEditing, selectedPriceGroupId, form]);

  useEffect(() => {
    if (selectedPriceGroupId && priceGroups) {
      const selectedGroup = priceGroups.find(
        (pg) => pg.id === selectedPriceGroupId
      );
      if (selectedGroup && selectedGroup.price !== undefined) {
        form.setValue("price", selectedGroup.price, { shouldValidate: true });
      }
    } else if (!selectedPriceGroupId) {
    }
  }, [selectedPriceGroupId, priceGroups, form]);

  const handleSelectMedia = (mediaItem: Media, isMultiple = true) => {
    const currentSelectedIds = form.getValues('selectedMediaIds') || [];
    if (isMultiple) {
      if (currentSelectedIds.includes(mediaItem.id)) {
        const filtered = selectedMedia.filter(m => m.id !== mediaItem.id);
        setSelectedMedia(filtered);
        form.setValue('selectedMediaIds', filtered.map(m => m.id));
      } else {
        const newSelection = [...selectedMedia, mediaItem];
        setSelectedMedia(newSelection);
        form.setValue('selectedMediaIds', newSelection.map(m => m.id));
      }
    } else {
      setSelectedMedia([mediaItem]);
      form.setValue('selectedMediaIds', [mediaItem.id]);
    }
  };
  
  const currentSelectedMediaIds = form.watch('selectedMediaIds') || [];

  const createMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const payload: ActionProductFormData = {
        name: values.name,
        slug: values.slug ?? undefined,
        description: values.description === undefined ? null : values.description,
        stock: values.stock,
        price: values.price,
        price_group_id: values.price_group_id ?? null,
        brand_id: values.brand_id ?? null,
        category_id: values.category_id ?? null,
        status: values.status as ProductStatus,
        selectedMediaIds: values.selectedMediaIds ?? [],
      };
      return createProductAction(payload);
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['full-products'] });
      setOpen(false);
      form.reset();
      setSelectedMedia([]);
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      if (!productData?.id) throw new Error('ID de producto no encontrado para actualizar.');
      const payload: ActionProductFormData = {
        name: values.name,
        slug: values.slug ?? undefined,
        description: values.description === undefined ? null : values.description,
        stock: values.stock,
        price: values.price,
        price_group_id: values.price_group_id ?? null,
        brand_id: values.brand_id ?? null,
        category_id: values.category_id ?? null,
        status: values.status as ProductStatus,
        selectedMediaIds: values.selectedMediaIds ?? [],
      };
      return updateProductAction(productData.id, payload);
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['full-products'] });
      queryClient.invalidateQueries({ queryKey: ['product', productData?.slug] });
      queryClient.invalidateQueries({ queryKey: ['product-media-items', productData?.id] });
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  function onSubmit(values: ProductFormValues) {
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Producto</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Pipa de Silicona" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (URL)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: pipa-de-silicona (opcional)" {...field} />
              </FormControl>
              <FormDescription>
                Si se deja vacío, se generará automáticamente a partir del nombre.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Detalles del producto..." {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock Disponible</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Ej: 100" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price_group_id"
          render={({ field }) => {
            const valueExists = priceGroups?.some(group => group.id === field.value);
            const fieldValue = field.value === null || field.value === undefined || !valueExists ? "null" : field.value;
            
            return (
              <FormItem>
                <FormLabel>Grupo de Precios (Opcional)</FormLabel>
                <Select 
                  disabled={isLoadingPriceGroups}
                  onValueChange={(value) => field.onChange(value === "null" ? null : value)}
                  value={fieldValue}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingPriceGroups ? "Cargando..." : "Selecciona un grupo de precios"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="null">Ninguno</SelectItem>
                    {priceGroups?.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} ({group.price ? `$${group.price}` : 'Precio variable'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Si seleccionas un grupo, el precio se actualizará automáticamente. 
                  Puedes sobrescribirlo manualmente abajo.
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Ej: 1500.00" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormDescription>
                Precio final del producto. Se actualiza si eliges un grupo de precios.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brand_id"
          render={({ field }) => {
            const valueExists = brands?.some(brand => brand.id === field.value);
            const fieldValue = field.value === null || field.value === undefined || !valueExists ? "null" : field.value;
            
            return (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <Select 
                  disabled={isLoadingBrands}
                  onValueChange={(value) => field.onChange(value === "null" ? null : value)}
                  value={fieldValue}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingBrands ? "Cargando..." : "Selecciona una marca"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="null">-- Sin marca --</SelectItem>
                    {brands?.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => {
            const valueExists = categories?.some(category => category.id === field.value);
            const fieldValue = field.value === null || field.value === undefined || !valueExists ? "null" : field.value;
            
            return (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select 
                  disabled={isLoadingCategories}
                  onValueChange={(value) => field.onChange(value === "null" ? null : value)}
                  value={fieldValue}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingCategories ? "Cargando..." : "Selecciona una categoría"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="null">-- Sin categoría --</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
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

        <FormItem>
          <FormLabel>Imágenes del Producto</FormLabel>
          <div className="mb-4 flex flex-wrap gap-2">
            {selectedMedia.map(media => (
              <div key={media.id} className="relative group w-24 h-24">
                <Image src={media.url} alt={media.alt_text || 'Product image'} layout="fill" objectFit="cover" className="rounded" />
                <Button 
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                  onClick={() => {
                    const filtered = selectedMedia.filter(m => m.id !== media.id);
                    setSelectedMedia(filtered);
                    form.setValue('selectedMediaIds', filtered.map(m => m.id));
                  }}
                  aria-label={`Remover imagen ${media.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <MediaGalleryPicker 
            selectedMediaIds={currentSelectedMediaIds} 
            onSelectMedia={handleSelectMedia} 
            multiSelect={true}
          />
          <FormDescription>
            Selecciona una o más imágenes para el producto.
          </FormDescription>
        </FormItem>

        <Button 
          type="submit" 
          disabled={!formReady || isLoading || createMutation.isPending || updateMutation.isPending}
          className="w-full"
        >
          {isLoading ? (
            <span>Cargando datos...</span>
          ) : createMutation.isPending || updateMutation.isPending ? (
            <span>Guardando...</span>
          ) : isEditing ? (
            'Actualizar Producto'
          ) : (
            'Crear Producto'
          )}
        </Button>
      </form>
    </Form>
  );
}
