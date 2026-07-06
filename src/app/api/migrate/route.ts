import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { products, categories, reviews, banners } from "@/lib/data";

export async function GET() {
  try {
    // 1. Migrate Products
    for (const product of products) {
      await setDoc(doc(collection(db, "products"), product.id), product);
    }
    console.log("Migrated products:", products.length);

    // 2. Migrate Categories
    for (const category of categories) {
      await setDoc(doc(collection(db, "categories"), category.id), category);
    }
    console.log("Migrated categories:", categories.length);

    // 3. Migrate Reviews
    for (const review of reviews) {
      await setDoc(doc(collection(db, "reviews"), review.id), review);
    }
    console.log("Migrated reviews:", reviews.length);

    // 4. Migrate Banners
    for (const banner of banners) {
      await setDoc(doc(collection(db, "banners"), banner.id), banner);
    }
    console.log("Migrated banners:", banners.length);

    return NextResponse.json({ 
      success: true, 
      message: "Data successfully migrated to Firestore!",
      counts: {
        products: products.length,
        categories: categories.length,
        reviews: reviews.length,
        banners: banners.length
      }
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
