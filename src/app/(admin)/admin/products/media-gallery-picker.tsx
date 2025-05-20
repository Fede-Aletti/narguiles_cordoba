'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Image as ImageIcon, Loader2, Check } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { cn } from '@/lib/utils'
import type { IMediaItem } from '@/interfaces/media'

interface MediaGalleryPickerProps {
  onSelectMedia: (media: IMediaItem) => void
  selectedMediaIds?: string[]
  multiSelect?: boolean
}

async function fetchGalleryMediaItems(): Promise<IMediaItem[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('media_item')
    .select('id, url, name, alt_text, tags, created_at, folder_id, created_by')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export function MediaGalleryPicker({ 
  onSelectMedia, 
  selectedMediaIds = [], 
  multiSelect = false
}: MediaGalleryPickerProps) {
  const [open, setOpen] = useState(false)

  const { data: mediaItems, isLoading, error } = useQuery<IMediaItem[], Error>({
    queryKey: ['gallery-media-items'],
    queryFn: fetchGalleryMediaItems,
  })

  console.log("MediaGalleryPicker data:", { mediaItems, isLoading, error });

  const handleSelectImage = (media: IMediaItem) => {
    onSelectMedia(media)
    if (!multiSelect) {
      setOpen(false) // Cerrar solo en modo single select
    }
  }

  const isSelected = (id: string) => selectedMediaIds.includes(id)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1"
        >
          <ImageIcon className="h-4 w-4" />
          <span>{multiSelect ? 'Seleccionar imágenes' : 'Galería'}</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-4/5 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Selecciona {multiSelect ? 'imágenes' : 'una imagen'}</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-[200px]">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !mediaItems?.length ? (
            <p className="text-center py-4 text-sm text-muted-foreground">
              No hay imágenes disponibles
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mediaItems.map((media) => (
                <div
                  key={media.id}
                  onClick={() => handleSelectImage(media)}
                  className={cn(
                    "relative group aspect-square rounded-md overflow-hidden border-2 cursor-pointer transition-all",
                    isSelected(media.id) 
                      ? "border-primary ring-1 ring-primary" 
                      : "border-transparent hover:border-gray-300"
                  )}
                >
                  <Image
                    src={media.url}
                    alt={media.alt_text || media.name || "Imagen"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                  {isSelected(media.id) && (
                    <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {multiSelect && (
          <div className="flex justify-end mt-4">
            <Button onClick={() => setOpen(false)}>Listo</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
} 