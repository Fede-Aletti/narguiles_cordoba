// src/app/admin/media/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { MediaTable } from "./components/media-table";

export default async function MediaPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Gestión de Media</h1>
      <MediaTable />
    </div>
  );
}
