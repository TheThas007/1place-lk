import { redirect } from "next/navigation";

export default function AdminHeroPage() {
  redirect("/admin/dashboard?tab=hero");
}
