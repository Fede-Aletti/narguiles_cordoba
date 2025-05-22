"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { DiscountType, IDiscount } from "@/interfaces/discount";
import { fetchBrandsForSelect, fetchCategoriesForSelect, fetchProductsForSelect } from "@/lib/queries/product-queries"; // Assuming product-queries exports these for select
import { useQuery } from "@tanstack/react-query";
import type { BrandSelectOption, CategorySelectOption, ProductSelectOption } from "@/lib/queries/product-queries"; // Assuming these types are exported
import { Checkbox } from "@/components/ui/checkbox";

// Zod schema for the form
const discountFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().optional().nullable(),
  code: z.string().optional().nullable(),
  discount_type: z.enum(["percentage", "fixed_amount"] as [DiscountType, ...DiscountType[]]),
  value: z.number().min(0, "El valor debe ser positivo."),
  minimum_purchase_amount: z.number().min(0).optional().nullable(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  usage_limit: z.number().int().min(0).optional().nullable(),
  is_active: z.boolean().default(true),
  brand_ids: z.array(z.string()).optional(),
  category_ids: z.array(z.string()).optional(),
  product_ids: z.array(z.string()).optional(),
}).refine(data => {
  if (data.start_date && data.end_date && data.end_date < data.start_date) {
    return false;
  }
  return true;
}, {
  message: "La fecha de fin no puede ser anterior a la fecha de inicio.",
  path: ["end_date"],
});

export type DiscountFormValues = z.infer<typeof discountFormSchema>;

interface DiscountFormProps {
  setOpen: (open: boolean) => void;
  discountData?: IDiscount; // For editing
  isEditing?: boolean;
  onSubmit: (values: DiscountFormValues) => void;
  loading?: boolean;
}

export function DiscountForm({
  setOpen,
  discountData,
  isEditing = false,
  onSubmit,
  loading,
}: DiscountFormProps) {
  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountFormSchema),
    defaultValues: discountData
      ? {
          name: discountData.name || "",
          description: discountData.description === undefined ? null : discountData.description,
          code: discountData.code === undefined ? null : discountData.code,
          discount_type: discountData.discount_type || "percentage",
          value: discountData.value || 0,
          minimum_purchase_amount: discountData.minimum_purchase_amount === undefined ? null : discountData.minimum_purchase_amount,
          start_date: discountData.start_date ? new Date(discountData.start_date) : undefined,
          end_date: discountData.end_date ? new Date(discountData.end_date) : undefined,
          usage_limit: discountData.usage_limit === undefined ? null : discountData.usage_limit,
          is_active: typeof discountData.is_active === 'boolean' ? discountData.is_active : true,
          brand_ids: discountData.brands?.map(b => b.id) || [],
          category_ids: discountData.categories?.map(c => c.id) || [],
          product_ids: discountData.products?.map(p => p.id) || [],
        }
      : {
          name: "",
          description: null,
          code: null,
          discount_type: "percentage",
          value: 0,
          minimum_purchase_amount: null,
          start_date: undefined,
          end_date: undefined,
          usage_limit: null,
          is_active: true,
          brand_ids: [],
          category_ids: [],
          product_ids: [],
        },
  });

  const { data: brands } = useQuery<BrandSelectOption[], Error>({ queryKey: ['brandsForSelect'], queryFn: fetchBrandsForSelect });
  const { data: categories } = useQuery<CategorySelectOption[], Error>({ queryKey: ['categoriesForSelect'], queryFn: fetchCategoriesForSelect });
  const { data: products } = useQuery<ProductSelectOption[], Error>({ queryKey: ['productsForSelect'], queryFn: fetchProductsForSelect });

  const handleSubmit = (values: DiscountFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre del Descuento</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción (Opcional)</FormLabel>
            <FormControl><Textarea {...field} value={field.value ?? ""} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        
        <FormField control={form.control} name="code" render={({ field }) => (
          <FormItem>
            <FormLabel>Código (Opcional)</FormLabel>
            <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
            <FormDescription>Código que los clientes usarán para aplicar el descuento.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="discount_type" render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Descuento</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="percentage">Porcentaje</SelectItem>
                  <SelectItem value="fixed_amount">Monto Fijo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="value" render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
              <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
              <FormDescription>{form.watch("discount_type") === "percentage" ? "% de descuento" : "Monto a descontar"}</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="minimum_purchase_amount" render={({ field }) => (
            <FormItem>
              <FormLabel>Monto Mínimo de Compra (Opcional)</FormLabel>
              <FormControl><Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))} /></FormControl>
              <FormMessage />
            </FormItem>
        )} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="start_date" render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Inicio (Opcional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                      {field.value ? format(field.value, "PPP") : <span>Selecciona una fecha</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="end_date" render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Fin (Opcional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                      {field.value ? format(field.value, "PPP") : <span>Selecciona una fecha</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => form.getValues("start_date") ? date < form.getValues("start_date")! : false} initialFocus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="usage_limit" render={({ field }) => (
            <FormItem>
              <FormLabel>Límite de Uso (Opcional)</FormLabel>
              <FormControl><Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value, 10))} /></FormControl>
              <FormDescription>Número máximo de veces que se puede usar el descuento. Dejar vacío para ilimitado.</FormDescription>
              <FormMessage />
            </FormItem>
        )} />

        <FormField control={form.control} name="is_active" render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel>Activo</FormLabel>
              <FormDescription>Si el descuento está actualmente activo y puede ser utilizado.</FormDescription>
            </div>
            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
          </FormItem>
        )} />

        {/* TODO: Add multi-select for brands, categories, products */}
        <div>
          <h4 className="text-md font-medium mb-2">Aplicar a (Opcional):</h4>
          <div className="space-y-4">
            <FormField control={form.control} name="brand_ids" render={() => (
                <FormItem>
                    <FormLabel>Marcas</FormLabel>
                    {brands?.map(brand => (
                        <FormField key={brand.id} control={form.control} name="brand_ids" render={({field}) => {
                            return <FormItem key={brand.id} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox 
                                        checked={field.value?.includes(brand.id)} 
                                        onCheckedChange={(checked) => {
                                            return checked 
                                                ? field.onChange([...(field.value || []), brand.id]) 
                                                : field.onChange(field.value?.filter(value => value !== brand.id))
                                        }}
                                    />
                                </FormControl>
                                <FormLabel className="font-normal">{brand.name}</FormLabel>
                            </FormItem>
                        }}/>
                    ))}
                </FormItem>
            )}/>
             {/* Repeat for categories and products */}
          </div>
        </div>


        <Button type="submit" disabled={loading} className="w-full">
          {isEditing ? "Actualizar Descuento" : "Crear Descuento"}
        </Button>
      </form>
    </Form>
  );
} 