import { createClient } from "@/lib/supabase/server";
import PropertyForm from "@/components/PropertyForm";

export default async function NewPropertyPage() {
  const supabase = createClient();
  const { data: clients } = await supabase.from("clients").select("id, full_name").order("full_name");

  return (
    <div>
      <h1 className="text-3xl">Νέο ακίνητο</h1>
      <PropertyForm mode="create" clients={clients ?? []} />
    </div>
  );
}
