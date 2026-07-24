import { redirect } from "next/navigation";

export default function AdminCategoriesPage() {
  redirect("/admin/dashboard?tab=categories");
}
