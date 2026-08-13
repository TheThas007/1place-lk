import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AdminRepairsPage() {
  redirect("/admin/dashboard?tab=repairs");
}
