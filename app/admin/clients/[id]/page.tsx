import { createClient } from "@/lib/supabase/server";
import ClientForm from "@/components/ClientForm";
import type { Client, Property } from "@/types/database";
import { notFound } from "next/navigation";

export default async function EditClientPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: client }, { data: ownerLinks }, { data: interestLinks }, { data: allProperties }] =
    await Promise.all([
      supabase.from("clients").select("*").eq("id", params.id).single(),
      supabase.from("property_private_details").select("property_id").eq("owner_client_id", params.id),
      supabase.from("client_property_interest").select("property_id").eq("client_id", params.id),
      supabase.from("properties").select("*").order("title"),
    ]);

  if (!client) notFound();

  const ownedPropertyIds = (ownerLinks ?? []).map((l) => (l as { property_id: string }).property_id);
  const interestedPropertyIds = (interestLinks ?? []).map((l) => (l as { property_id: string }).property_id);
  const linkedProperties = (allProperties ?? []).filter((p) => ownedPropertyIds.includes((p as Property).id));
  const interestedProperties = (allProperties ?? []).filter((p) => interestedPropertyIds.includes((p as Property).id));

  return (
    <div>
      <h1 className="text-3xl">Επεξεργασία πελάτη</h1>
      <ClientForm
        mode="edit"
        client={client as Client}
        linkedProperties={linkedProperties as Property[]}
        interestedProperties={interestedProperties as Property[]}
        allProperties={(allProperties ?? []) as Property[]}
      />
    </div>
  );
}
