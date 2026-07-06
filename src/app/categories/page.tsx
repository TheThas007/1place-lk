import Link from "next/link";
import { getCategories } from "@/lib/firestore-client";
import CategoriesClient from "./categories-client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function CategoriesPage() {
  const categories = await getCategories();
  return <CategoriesClient categories={categories} />;
}
