import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, writeBatch, setDoc } from "firebase/firestore";
import { Product } from "@/lib/types";
import { auditProductClassification } from "@/lib/migration-audit";
import { DEFAULT_BRANDS, categories as defaultCategories } from "@/lib/data";

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    const products = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Product));

    const auditResults = products.map((p) => auditProductClassification(p));

    return NextResponse.json({
      success: true,
      totalProducts: products.length,
      highConfidence: auditResults.filter((r) => r.confidence === "HIGH").length,
      requiresReview: auditResults.filter((r) => r.confidence === "REQUIRES_REVIEW").length,
      auditResults,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const applyAction = body.action || "apply"; // "apply" or "seed_brands"

    // 1. Seed Brands collection if needed
    const brandSnap = await getDocs(collection(db, "brands"));
    if (brandSnap.empty || applyAction === "seed_brands") {
      const brandBatch = writeBatch(db);
      for (const brand of DEFAULT_BRANDS) {
        const ref = doc(db, "brands", brand.id);
        brandBatch.set(ref, brand, { merge: true });
      }
      await brandBatch.commit();
    }

    // 2. Audit & Migrate Products
    const snapshot = await getDocs(collection(db, "products"));
    const products = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Product));

    if (products.length === 0) {
      return NextResponse.json({ success: true, message: "No products in database to migrate." });
    }

    const batch = writeBatch(db);
    let updatedCount = 0;

    for (const product of products) {
      const audit = auditProductClassification(product);

      const ref = doc(db, "products", product.id);
      batch.update(ref, {
        category_id: audit.suggestedCategoryId,
        category_name: audit.suggestedCategoryName,
        category_slug: audit.suggestedCategorySlug,
        categoryId: audit.suggestedCategoryId,
        categoryName: audit.suggestedCategoryName,
        categorySlug: audit.suggestedCategorySlug,
        
        brand: audit.suggestedBrandName,
        brand_id: audit.suggestedBrandId,
        brand_name: audit.suggestedBrandName,
        brand_slug: audit.suggestedBrandSlug,
        brandId: audit.suggestedBrandId,
        brandName: audit.suggestedBrandName,
        brandSlug: audit.suggestedBrandSlug,
        
        updated_at: new Date().toISOString(),
      });
      updatedCount++;
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${updatedCount} products into separate Category and Brand fields.`,
      updatedCount,
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
