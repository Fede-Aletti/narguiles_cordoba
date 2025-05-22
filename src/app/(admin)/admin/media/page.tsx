// src/app/admin/media/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { MediaView } from "./components/media-view";
import { fetchMediaItems, fetchMediaFolders } from "@/actions/media-actions";
import type { IMediaItem, IMediaFolder } from "@/interfaces/media";

export default async function MediaPage() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    redirect("/login");
  }

  let initialMediaItems: IMediaItem[] = [];
  let initialMediaFolders: IMediaFolder[] = [];
  let fetchError: string | null = null;

  try {
    initialMediaItems = await fetchMediaItems();
    initialMediaFolders = await fetchMediaFolders();
    
    console.log("--- MediaPage: initialMediaItems ---", JSON.stringify(initialMediaItems, null, 2));
    console.log("--- MediaPage: initialMediaFolders ---", JSON.stringify(initialMediaFolders, null, 2));

  } catch (e: any) {
    console.error("Error fetching media data:", e);
    fetchError = e.message || "Failed to load media data.";
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Gestión de Media</h1>
      {fetchError && <p className="text-red-500">{fetchError}</p>}
      <MediaView 
        initialMediaItems={initialMediaItems} 
        initialMediaFolders={initialMediaFolders} 
      />
    </div>
  );
}
