import { createClient } from "@/lib/supabase/server";
import ClientForm from "@/components/ClientForm";
import type { Client, Property } from "@/types/database";
import { notFound } from "next/navigation";

export default async function EditClientPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: client }, { data: links }, { data: allProperties }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", params.id).single(),
    supabase.from("property_private_details").select("property_id").eq("owner_client_id", params.id),
    supabase.from("properties").select("*").order("title"),
  ]);

  if (!client) notFound();

  const propertyIds = (links ?? []).map((l) => (l as { property_id: string }).property_id);
  const linkedProperties = (allProperties ?? []).filter((p) => propertyIds.includes((p as Property).id));

  return (
    <div>
      <h1 className="text-3xl">Επεξεργασία πελάτη</h1>
      <ClientForm
        mode="edit"
        client={client as Client}
        linkedProperties={linkedProperties as Property[]}
        allProperties={(allProperties ?? []) as Property[]}
      />
    </div>
  );
}
