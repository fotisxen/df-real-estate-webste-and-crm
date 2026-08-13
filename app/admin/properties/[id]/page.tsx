import { createClient } from "@/lib/supabase/server";
import PropertyForm from "@/components/PropertyForm";
import type { Property, PropertyImage, PropertyPrivateDetails } from "@/types/database";
import { notFound } from "next/navigation";

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: property }, { data: privateDetails }, { data: images }, { data: clients }, { data: interestLinks }] =
    await Promise.all([
      supabase.from("properties").select("*").eq("id", params.id).single(),
      supabase.from("property_private_details").select("*").eq("property_id", params.id).maybeSingle(),
      supabase.from("property_images").select("*").eq("property_id", params.id).order("position", { ascending: true }),
      supabase.from("clients").select("id, full_name").order("full_name"),
      supabase.from("client_property_interest").select("client_id").eq("property_id", params.id),
    ]);

  if (!property) notFound();

  const interestedClientIds = (interestLinks ?? []).map((l) => (l as { client_id: string }).client_id);

  return (
    <div>
      <h1 className="text-3xl">Επεξεργασία ακινήτου</h1>
      <PropertyForm
        mode="edit"
        property={property as Property}
        privateDetails={privateDetails as PropertyPrivateDetails | null}
        images={(images ?? []) as PropertyImage[]}
        clients={clients ?? []}
        interestedClientIds={interestedClientIds}
      />
    </div>
  );
}
