"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MediaForm } from "./media-form"; // We'll need to update MediaForm later
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  PlusCircle,
  FolderPlus,
  Image as ImageIcon,
  Edit3,
  Trash2,
  Search,
} from "lucide-react";

import {
  createMediaItem,
  updateMediaItem,
  deleteMediaItem,
  createMediaFolder, // Added for folder creation
  // We might need fetchMediaFolders if we want to refresh client-side after creation
} from "@/actions/media-actions";
import type {
  IMediaItem,
  IMediaFolder,
  CreateMediaItemPayload,
  UpdateMediaItemPayload,
} from "@/interfaces/media";
import Image from "next/image";

const ALL_FOLDERS_ID = "__ALL_FOLDERS__"; // Special ID for showing all items

// Interface for the payload to create a media folder
interface CreateMediaFolderActionPayload {
  name: string;
  parent_folder_id?: string | null;
}

interface MediaViewProps {
  initialMediaItems: IMediaItem[];
  initialMediaFolders: IMediaFolder[];
}

export function MediaView({
  initialMediaItems,
  initialMediaFolders,
}: MediaViewProps) {
  const queryClient = useQueryClient();

  const [mediaItems, setMediaItems] = useState<IMediaItem[]>(initialMediaItems);
  const [mediaFolders, setMediaFolders] =
    useState<IMediaFolder[]>(initialMediaFolders);

  const [currentFolderId, setCurrentFolderId] = useState<string | null | typeof ALL_FOLDERS_ID>(ALL_FOLDERS_ID); // Default to showing all items
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [isCreateItemFormOpen, setIsCreateItemFormOpen] = useState(false);
  const [editingMediaItem, setEditingMediaItem] = useState<IMediaItem | null>(
    null
  );

  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // Mutations (similar to MediaTable, adapted for new state management)
  const createFolderMutation = useMutation<
    IMediaFolder,
    Error,
    CreateMediaFolderActionPayload
  >({
    mutationFn: createMediaFolder,
    onSuccess: (newFolder) => {
      toast.success(`Folder \"${newFolder.name}\" created`);
      setMediaFolders((prev) =>
        [...prev, newFolder].sort((a, b) => a.name.localeCompare(b.name))
      );
      setIsCreateFolderModalOpen(false);
      setNewFolderName("");
      // queryClient.invalidateQueries({ queryKey: ["mediaFolders"] }); // If needed for other components
    },
    onError: (e: any) => toast.error(e.message || "Error creating folder"),
  });

  const createItemMutation = useMutation<
    IMediaItem,
    Error,
    CreateMediaItemPayload
  >({
    mutationFn: createMediaItem,
    onSuccess: (newItem) => {
      toast.success("Media item created");
      setMediaItems((prev) => [
        newItem,
        ...prev.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
      ]);
      setIsCreateItemFormOpen(false);
      setEditingMediaItem(null);
      // queryClient.invalidateQueries({ queryKey: ["mediaItems", currentFolderId] }); // Be more specific
    },
    onError: (e: any) => toast.error(e.message || "Error creating media item"),
  });

  const updateItemMutation = useMutation<
    IMediaItem,
    Error,
    { id: string; payload: UpdateMediaItemPayload }
  >({
    mutationFn: (vars) => updateMediaItem(vars.id, vars.payload),
    onSuccess: (updatedItem) => {
      toast.success("Media item updated");
      setMediaItems((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );
      setIsCreateItemFormOpen(false);
      setEditingMediaItem(null);
      // queryClient.invalidateQueries({ queryKey: ["mediaItems", currentFolderId] });
      // queryClient.invalidateQueries({ queryKey: ["mediaItem", updatedItem.id] });
    },
    onError: (e: any) => toast.error(e.message || "Error updating media item"),
  });

  const deleteItemMutation = useMutation<void, Error, string>({
    mutationFn: async (itemId: string) => {
      setDeletingItemId(itemId);
      try {
        await deleteMediaItem(itemId);
      } finally {
        setDeletingItemId(null);
      }
    },
    onSuccess: (_, deletedItemId) => {
      toast.success("Media item deleted");
      setMediaItems((prev) => prev.filter((item) => item.id !== deletedItemId));
      // queryClient.invalidateQueries({ queryKey: ["mediaItems", currentFolderId] });
    },
    onError: (e: any) => {
      toast.error(e.message || "Error deleting media item");
      setDeletingItemId(null);
    },
  });

  const handleOpenCreateItemForm = (itemToEdit: IMediaItem | null = null) => {
    setEditingMediaItem(itemToEdit);
    setIsCreateItemFormOpen(true);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name cannot be empty.");
      return;
    }
    // For now, all folders are created at root. Parent folder selection can be added later.
    createFolderMutation.mutate({
      name: newFolderName.trim(),
      parent_folder_id: null,
    });
  };

  const filteredMediaItems = useMemo(() => {
    return mediaItems
      .filter((item) => {
        if (currentFolderId === ALL_FOLDERS_ID) {
          return true; // Show all items if "Todas" is selected
        }
        // Filter by current folder (root or specific folder)
        const folderMatch = currentFolderId
          ? item.folder_id === currentFolderId
          : item.folder_id === null; 
        if (!folderMatch) return false;
        return true;
      })
      .filter((item) => {
        // Filter by search term (name or tags)
        if (!searchTerm.trim()) return true;
        const lowerSearchTerm = searchTerm.toLowerCase();
        const nameMatch = item.name?.toLowerCase().includes(lowerSearchTerm);
        const tagsMatch = item.tags?.some((tag) =>
          tag.toLowerCase().includes(lowerSearchTerm)
        );
        return nameMatch || tagsMatch;
      });
  }, [mediaItems, currentFolderId, searchTerm]);


  const isLoading =
    createItemMutation.isPending ||
    updateItemMutation.isPending ||
    deleteItemMutation.isPending ||
    createFolderMutation.isPending;

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
      {" "}
      {/* Adjust height as needed */}
      {/* Folders Panel */}
      <div className="w-1/4 border-r pr-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-3 sticky top-0 bg-background py-2">
          Carpetas
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="w-full mb-3"
          onClick={() => setIsCreateFolderModalOpen(true)}
          disabled={createFolderMutation.isPending}
        >
          <FolderPlus className="mr-2 h-4 w-4" /> Crear Carpeta
        </Button>
        <ul className="space-y-1">
          <li>
            <Button 
              variant={currentFolderId === ALL_FOLDERS_ID ? "secondary" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setCurrentFolderId(ALL_FOLDERS_ID)}
            >
              Todas (sin filtro de carpeta)
            </Button>
          </li>
          <li>
            <Button 
              variant={currentFolderId === null ? "secondary" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setCurrentFolderId(null)}
            >
              Raíz (sin carpeta)
            </Button>
          </li>
          {mediaFolders.map((folder) => (
            <li key={folder.id}>
              <Button
                variant={currentFolderId === folder.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setCurrentFolderId(folder.id)}
              >
                {folder.name}
              </Button>
            </li>
          ))}
          {mediaFolders.length === 0 && (
            <p className="text-sm text-muted-foreground p-2 text-center">
              No hay carpetas.
            </p>
          )}
        </ul>
      </div>
      {/* Media Gallery Panel */}
      <div className="w-3/4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-background py-2 z-10">
          <div className="relative w-full max-w-xs">
            <Input
              placeholder="Buscar por nombre o tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button
            onClick={() => handleOpenCreateItemForm()}
            disabled={isLoading}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Media
          </Button>
        </div>

        {isLoading && <p className="text-center">Procesando...</p>}

        {!isLoading && filteredMediaItems.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <ImageIcon size={48} className="mb-2" />
            <p>No hay imágenes para mostrar.</p>
            <p className="text-sm">
              Intenta con otra carpeta o término de búsqueda.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMediaItems.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg overflow-hidden group relative"
            >
              <div className="aspect-square bg-muted flex items-center justify-center relative">
                <Image
                  src={item.url}
                  alt={item.alt_text || item.name || "Media Item"}
                  className="object-cover"
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              </div>
              <div className="p-2 text-sm">
                <p
                  className="font-medium truncate"
                  title={item.name || item.url}
                >
                  {item.name || item.url}
                </p>
                <p
                  className="text-xs text-muted-foreground truncate"
                  title={item.id}
                >
                  ID: {item.id}
                </p>
              </div>
              <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleOpenCreateItemForm(item)}
                  disabled={isLoading}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => deleteItemMutation.mutate(item.id)}
                  disabled={isLoading || deletingItemId === item.id}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Create/Edit Media Item Dialog (MediaForm) */}
      <Dialog
        open={isCreateItemFormOpen}
        onOpenChange={setIsCreateItemFormOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMediaItem ? "Editar Media Item" : "Nuevo Media Item"}
            </DialogTitle>
          </DialogHeader>
          <MediaForm
            defaultValues={
              editingMediaItem
                ? {
                    url: editingMediaItem.url,
                    name: editingMediaItem.name || "",
                    tags: editingMediaItem.tags?.join(", ") || "",
                    // We need to pass folder_id here and available folders to MediaForm
                  }
                : { url: "", name: "", tags: "" }
            }
            // Pass available folders and currentFolderId to MediaForm
            availableFolders={mediaFolders}
            currentFolderIdForForm={
              editingMediaItem ? editingMediaItem.folder_id : currentFolderId
            }
            onSubmit={(formData) => {
              const payloadBase = {
                url: formData.url,
                name: formData.name,
                alt_text: formData.name,
                tags: formData.tags
                  ? formData.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter((t) => t)
                  : [],
                folder_id: formData.folder_id, // This will come from the updated MediaForm
              };

              if (editingMediaItem) {
                updateItemMutation.mutate({
                  id: editingMediaItem.id,
                  payload: payloadBase as UpdateMediaItemPayload,
                });
              } else {
                createItemMutation.mutate(
                  payloadBase as CreateMediaItemPayload
                );
              }
            }}
            loading={
              createItemMutation.isPending || updateItemMutation.isPending
            }
          />
        </DialogContent>
      </Dialog>
      {/* Create Folder Modal */}
      <Dialog
        open={isCreateFolderModalOpen}
        onOpenChange={setIsCreateFolderModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Carpeta</DialogTitle>
            <DialogDescription>
              Ingresa un nombre para la nueva carpeta.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nombre de la carpeta"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={handleCreateFolder}
              disabled={createFolderMutation.isPending}
            >
              {createFolderMutation.isPending ? "Creando..." : "Crear Carpeta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
