'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Image as ImageIcon, Loader2, Check, Search } from 'lucide-react'
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
  const [searchTerm, setSearchTerm] = useState('')

  const { data: mediaItems, isLoading, error } = useQuery<IMediaItem[], Error>({
    queryKey: ['gallery-media-items'],
    queryFn: fetchGalleryMediaItems,
  })

  const filteredMediaItems = useMemo(() => {
    if (!mediaItems) return []
    if (!searchTerm) return mediaItems

    const lowerSearchTerm = searchTerm.toLowerCase()
    return mediaItems.filter(item => {
      const nameMatch = item.name?.toLowerCase().includes(lowerSearchTerm)
      const tagMatch = item.tags?.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
      return nameMatch || tagMatch
    })
  }, [mediaItems, searchTerm])

  const handleSelectImage = (media: IMediaItem) => {
    onSelectMedia(media)
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
      <SheetContent className="w-4/5 sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Selecciona {multiSelect ? 'imágenes' : 'una imagen'}</SheetTitle>
        </SheetHeader>

        <div className="relative mt-4 mb-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre o tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        
        <div className="flex-grow overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-[200px]">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-center py-4 text-sm text-red-500">
              Error al cargar imágenes: {error.message}
            </p>
          ) : !filteredMediaItems?.length ? (
            <p className="text-center py-4 text-sm text-muted-foreground">
              {searchTerm ? 'No hay imágenes que coincidan con tu búsqueda.' : 'No hay imágenes disponibles'}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-1">
              {filteredMediaItems.map((media) => (
                <div
                  key={media.id}
                  onClick={() => handleSelectImage(media)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectImage(media)}}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected(media.id)}
                  aria-label={`Seleccionar imagen ${media.alt_text || media.name}`}
                  className={cn(
                    "relative group aspect-square rounded-md overflow-hidden border-2 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-primary",
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
                  <span className="sr-only">{media.name}</span>
                  {media.tags && media.tags.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {media.tags.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {multiSelect && (
          <div className="flex justify-end mt-4 pt-4 border-t">
            <Button onClick={() => setOpen(false)}>Listo</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
} 