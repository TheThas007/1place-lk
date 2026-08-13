import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  redirect("/admin/dashboard?tab=products");
}
