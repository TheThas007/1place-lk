import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AdminSuppliersPage() {
  redirect("/admin/dashboard?tab=suppliers");
}
