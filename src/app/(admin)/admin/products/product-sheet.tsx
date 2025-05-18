'use client'

import React from 'react'
import { ProductForm } from './product-form'
import { ProductFormData, ProductRow } from '@/types/product'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { PlusCircle, Pencil } from 'lucide-react'

interface ProductSheetProps {
  productData?: ProductRow
  isEditing?: boolean
  triggerButton?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ProductSheet({ 
  productData, 
  isEditing = false, 
  triggerButton,
  open,
  onOpenChange
}: ProductSheetProps) {
  const [localOpen, setLocalOpen] = React.useState(false)
  
  // Usar props controlled si están presentes, o el estado local si no
  const isOpen = open !== undefined ? open : localOpen
  const setOpen = onOpenChange || setLocalOpen

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {triggerButton || (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Producto
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto max-h-screen">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}</SheetTitle>
          <SheetDescription>
            {isEditing 
              ? 'Modifica los detalles del producto existente.'
              : 'Completa los detalles del nuevo producto. Haz clic en guardar cuando termines.'}
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-4">
          <ProductForm 
            setOpen={setOpen} 
            productData={productData as unknown as ProductFormData} 
            isEditing={isEditing} 
          />
        </div>
      </SheetContent>
    </Sheet>
  )
} 