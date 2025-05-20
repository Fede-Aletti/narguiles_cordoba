// src/app/admin/media/media-queries.ts
import { createClient } from "@/utils/supabase/server";
import type { IMediaFolder, IMediaItem } from "@/interfaces/media";

// MEDIA FOLDER ACTIONS

// Fetch all media folders
export async function fetchMediaFolders(): Promise<IMediaFolder[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('media_folder')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as IMediaFolder[] ?? [];
}

// Fetch a single media folder by ID
export async function fetchMediaFolderById(id: string): Promise<IMediaFolder | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('media_folder')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as IMediaFolder | null;
}

interface CreateMediaFolderPayload {
  name: string;
  parent_folder_id?: string | null;
}

// Create a new media folder
export async function createMediaFolder(payload: CreateMediaFolderPayload): Promise<IMediaFolder> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('media_folder')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as IMediaFolder;
}

interface UpdateMediaFolderPayload {
  name?: string;
  parent_folder_id?: string | null;
}

// Update an existing media folder
export async function updateMediaFolder(id: string, payload: UpdateMediaFolderPayload): Promise<IMediaFolder> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('media_folder')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as IMediaFolder;
}

// Delete a media folder (potentially requires handling of child items/folders or RLS policy)
export async function deleteMediaFolder(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('media_folder')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message); 
}

// MEDIA ITEM ACTIONS

const MEDIA_ITEM_SELECT_QUERY = '*, folder:folder_id(*), created_by_user:created_by(*)';

// Fetch all media items (optionally filter by folder)
export async function fetchMediaItems(folderId?: string | null): Promise<IMediaItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from('media_item')
    .select(MEDIA_ITEM_SELECT_QUERY)
    .order('created_at', { ascending: false });

  if (folderId) {
    query = query.eq('folder_id', folderId);
  } else {
    query = query.is('folder_id', null); // Fetch items in root if no folderId
  }
  
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as IMediaItem[] ?? [];
}

// Fetch a single media item by ID
export async function fetchMediaItemById(id: string): Promise<IMediaItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('media_item')
    .select(MEDIA_ITEM_SELECT_QUERY)
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as IMediaItem | null;
}

export interface CreateMediaItemPayload {
  url: string;
  folder_id?: string | null;
  name?: string | null;
  tags?: string[] | null;
  // created_by will be set by RLS
}

// Create a new media item
export async function createMediaItem(payload: CreateMediaItemPayload): Promise<IMediaItem> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('media_item')
    .insert(payload)
    .select(MEDIA_ITEM_SELECT_QUERY)
    .single();
  if (error) throw new Error(error.message);
  return data as IMediaItem;
}

export interface UpdateMediaItemPayload {
  url?: string;
  folder_id?: string | null;
  name?: string | null;
  tags?: string[] | null;
}

// Update an existing media item
export async function updateMediaItem(id: string, payload: UpdateMediaItemPayload): Promise<IMediaItem> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('media_item')
    .update(payload)
    .eq('id', id)
    .select(MEDIA_ITEM_SELECT_QUERY)
    .single();
  if (error) throw new Error(error.message);
  return data as IMediaItem;
}

// Delete a media item
export async function deleteMediaItem(id: string): Promise<void> {
  const supabase = await createClient();
  // Consider storage implications if deleting from Supabase storage is needed
  const { error } = await supabase
    .from('media_item')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}
