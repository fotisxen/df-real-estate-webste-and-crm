import { NextResponse } from "next/server";
import { Resend } from "resend";
import { CATEGORIES } from "@/lib/propertyFields";

const TO_EMAIL = "info@df-real-estate.com";

const purposeLabel: Record<string, string> = {
  sale: "Πώληση",
  rent: "Ενοικίαση",
};

function categoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export async function POST(request: Request) {
  const { name, email, phone, purpose, category, region, area_sqm, notes } = await request.json();

  if (!name || !email || !purpose || !category || !region) {
    return NextResponse.json({ error: "Λείπουν στοιχεία." }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: "Φόρμα εκτίμησης ακινήτου <onboarding@resend.dev>",
    to: TO_EMAIL,
    replyTo: email,
    subject: `Νέο αίτημα εκτίμησης ακινήτου από ${name}`,
    text: [
      `Όνομα: ${name}`,
      `Email: ${email}`,
      `Τηλέφωνο: ${phone || "—"}`,
      `Σκοπός: ${purposeLabel[purpose] ?? purpose}`,
      `Τύπος ακινήτου: ${categoryLabel(category)}`,
      `Περιοχή: ${region}`,
      `Εμβαδόν: ${area_sqm ? `${area_sqm} τ.μ.` : "—"}`,
      "",
      notes || "",
    ].join("\n"),
  });

  if (error) {
    return NextResponse.json({ error: "Αποτυχία αποστολής." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
