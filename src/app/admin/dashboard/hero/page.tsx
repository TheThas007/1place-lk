import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AdminHeroPage() {
  redirect("/admin/dashboard?tab=hero");
}
