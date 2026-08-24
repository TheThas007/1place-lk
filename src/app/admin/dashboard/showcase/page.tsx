import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AdminShowcasePage() {
  redirect("/admin/dashboard?tab=showcase");
}
