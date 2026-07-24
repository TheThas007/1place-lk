import { redirect } from "next/navigation";

export default function AdminOrdersPage() {
  redirect("/admin/dashboard?tab=orders");
}
