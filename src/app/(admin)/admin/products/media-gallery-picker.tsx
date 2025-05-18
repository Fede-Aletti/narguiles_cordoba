'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Image as ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { fetchMedia } from '@/actions/media-actions'
import { cn } from '@/lib/utils'

interface MediaGalleryPickerProps {
  onSelectMedia: (media: { id: number; url: string; alt?: string }) => void
  selectedUrl?: string
}

export function MediaGalleryPicker({ onSelectMedia, selectedUrl }: MediaGalleryPickerProps) {
  const [open, setOpen] = useState(false)

  const { data: mediaItems, isLoading } = useQuery({
    queryKey: ['media-gallery'],
    queryFn: fetchMedia,
  })

  const handleSelectImage = (media: { id: number; url: string; alt?: string }) => {
    onSelectMedia(media)
    setOpen(false) // Cerrar el popover después de seleccionar
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
          >
            <ImageIcon className="h-4 w-4" />
            <span>Galería</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <div className="p-3 border-b">
            <h4 className="font-medium">Selecciona una imagen</h4>
            <p className="text-sm text-muted-foreground">
              Elige una imagen de la galería para asociarla al producto
            </p>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-[100px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !mediaItems?.length ? (
              <p className="text-center py-4 text-sm text-muted-foreground">
                No hay imágenes disponibles
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {mediaItems.map((media) => (
                  <div
                    key={media.id}
                    onClick={() => handleSelectImage(media)}
                    className={cn(
                      "relative cursor-pointer rounded-md overflow-hidden border-2 aspect-square",
                      selectedUrl === media.url ? "border-primary" : "border-transparent hover:border-gray-300"
                    )}
                  >
                    <Image
                      src={media.url}
                      alt={media.alt || "Imagen"}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      {selectedUrl && (
        <div className="relative h-8 w-8 rounded overflow-hidden border">
          <Image 
            src={selectedUrl} 
            alt="Imagen seleccionada"
            fill
            className="object-cover"
            sizes="32px"
          />
        </div>
      )}
    </div>
  )
} 