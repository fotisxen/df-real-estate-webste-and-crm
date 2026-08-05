import AdminNav from "@/components/AdminNav";

// Auth protection for everything under /admin happens in middleware.ts,
// not here — this layout only handles the shared chrome.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <AdminNav />
      <div className="container-content py-10">{children}</div>
    </div>
  );
}
