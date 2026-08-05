import { NextResponse } from "next/server";
import { Resend } from "resend";

const TO_EMAIL = "info@df-real-estate.com";

export async function POST(request: Request) {
  const { name, email, phone, message } = await request.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Λείπουν στοιχεία." }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: "Φόρμα επικοινωνίας <onboarding@resend.dev>",
    to: TO_EMAIL,
    replyTo: email,
    subject: `Νέο μήνυμα από ${name}`,
    text: `Όνομα: ${name}\nEmail: ${email}\nΤηλέφωνο: ${phone || "—"}\n\n${message}`,
  });

  if (error) {
    return NextResponse.json({ error: "Αποτυχία αποστολής." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
