import { redirect } from "next/navigation";

export default function AdminBannersPage() {
  redirect("/admin/dashboard?tab=banners");
}
