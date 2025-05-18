// src/app/admin/price-groups/price-group-form.tsx
'use client'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'

const schema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  price: z.coerce.number().positive('El precio debe ser mayor a 0'),
})

export function PriceGroupForm({ onSubmit, defaultValues, loading }: {
  onSubmit: (data: { name: string, price: number }) => void,
  defaultValues?: { name: string, price: number },
  loading?: boolean
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || { name: '', price: 0 }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nombre del grupo de precio" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} placeholder="0.00" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </form>
    </Form>
  )
}