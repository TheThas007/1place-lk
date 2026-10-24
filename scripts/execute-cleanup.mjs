import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAvpupw4iyO-_HMf0_dzIcpfmdxFA7j5NI",
  authDomain: "street-mobile-3988c.firebaseapp.com",
  projectId: "street-mobile-3988c",
  storageBucket: "street-mobile-3988c.firebasestorage.app",
  messagingSenderId: "254682609931",
  appId: "1:254682609931:web:b8266b1e748a3ea9ff8a0e"
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true
});

const isExecute = process.argv.includes("--execute");

// Known brand names that should NOT exist in categories
const BRAND_NAMES = [
  "apple", "samsung", "redmi", "xiaomi", "honor", "oppo", "vivo", "realme",
  "google", "oneplus", "jbl", "lenyes", "ugreen", "anker", "baseus", "oraimo",
  "dji", "sony", "bose", "huawei", "joyroom", "hoco", "remax", "ldnio",
  "marshall", "sennheiser", "kingston", "wiwu", "hollyland", "nokia", "hmd", "greentel"
];

// Explicit mappings for duplicate/malformed categories to canonical categories
const DUPLICATE_MAPPING = {
  "cat-cases-": {
    canonicalId: "cat-cases",
    canonicalName: "Phone Cases",
    canonicalSlug: "phone-cases",
    action: "merge"
  },
  "cat--gimbal": {
    canonicalId: "cat-gimbal",
    canonicalName: "Gimbal & Stabilizers",
    canonicalSlug: "gimbal",
    action: "merge"
  },
  "cat-screen-protectors": {
    canonicalId: "cat-tempered-glass",
    canonicalName: "Screen Protectors",
    canonicalSlug: "tempered-glass",
    action: "merge"
  },
  "cat-bags": {
    canonicalId: "cat-bag",
    canonicalName: "Bags & Sleeves",
    canonicalSlug: "bag",
    action: "delete"
  },
  "cat-walet": {
    canonicalId: "cat-wallet",
    canonicalName: "Wallets",
    canonicalSlug: "wallet",
    action: "delete"
  },
  "cat-itag": {
    canonicalId: "cat-smart-finder",
    canonicalName: "Smart Finder & Tags",
    canonicalSlug: "smart-finder",
    action: "delete"
  },
  "cat-otg": {
    canonicalId: "cat-s",
    canonicalName: "Storage & OTG",
    canonicalSlug: "storage",
    action: "delete"
  },
  "cat-broadcast-stand-": {
    canonicalId: null,
    action: "delete"
  },
  "cat-cable-organizer": {
    canonicalId: null,
    action: "delete"
  },
  "cat-router": {
    canonicalId: null,
    action: "delete"
  },
  "cat-studio-light": {
    canonicalId: null,
    action: "delete"
  },
  "cat-scale-": {
    canonicalId: "cat-scale",
    canonicalName: "Smart Scale",
    canonicalSlug: "scale",
    action: "rename"
  },
  "cat-straps-": {
    canonicalId: "cat-straps",
    canonicalName: "Watch Straps",
    canonicalSlug: "straps",
    action: "rename"
  }
};

async function execute() {
  console.log(`\n===============================================================`);
  console.log(`  1PLACE.LK Firestore Category Precision Migration`);
  console.log(`  Mode: ${isExecute ? ">>> LIVE EXECUTION <<<" : "[DRY RUN] (Simulation only)"}`);
  console.log(`===============================================================\n`);

  const [catSnap, prodSnap, brandSnap] = await Promise.all([
    getDocs(collection(db, "categories")),
    getDocs(collection(db, "products")),
    getDocs(collection(db, "brands"))
  ]);

  const categories = catSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const products = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const brands = brandSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`Categories loaded : ${categories.length}`);
  console.log(`Products loaded   : ${products.length}`);
  console.log(`Brands loaded     : ${brands.length}\n`);

  const categoryUpserts = [];
  const categoryDeletions = [];
  const productUpdates = [];
  const brandUpserts = [];

  // 1. Process Brand Documents in 'categories' collection
  const brandDocsInCategories = categories.filter(c => {
    const isBrandName = BRAND_NAMES.includes((c.name || "").trim().toLowerCase());
    const isAutoId = !c.id.startsWith("cat-");
    return isBrandName || isAutoId;
  });

  console.log(`--- Step 1: Cleaning ${brandDocsInCategories.length} Brand documents from categories collection ---`);
  for (const bDoc of brandDocsInCategories) {
    console.log(`  Brand doc found: [${bDoc.id}] "${bDoc.name}"`);
    
    // Check if brand exists in brands collection
    const existingBrand = brands.find(b => 
      (b.name || "").trim().toLowerCase() === (bDoc.name || "").trim().toLowerCase() ||
      b.id === bDoc.id
    );

    if (!existingBrand && bDoc.name) {
      const bSlug = (bDoc.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const newBrandObj = {
        id: `brand-${bSlug}`,
        name: bDoc.name.trim(),
        slug: bSlug,
        logo_url: bDoc.image_url || "",
        sort_order: bDoc.sort_order || 99,
        status: "active",
        show_on_homepage: true,
      };
      brandUpserts.push(newBrandObj);
      console.log(`    -> Preserving brand data into brands/brand-${bSlug}`);
    }

    categoryDeletions.push(bDoc.id);
  }

  // 2. Process Explicit Duplicate & Corrupted Category Mappings
  console.log(`\n--- Step 2: Processing Category Duplicates & Migrations ---`);
  for (const [dupId, mapping] of Object.entries(DUPLICATE_MAPPING)) {
    const existingDoc = categories.find(c => c.id === dupId);
    if (!existingDoc) {
      console.log(`  [SKIP] ${dupId} not present in database.`);
      continue;
    }

    console.log(`\n  Target: [${dupId}] "${existingDoc.name}" -> Action: ${mapping.action}`);

    // If rename (e.g. cat-scale- -> cat-scale), create canonical doc
    if (mapping.action === "rename" && mapping.canonicalId) {
      const canonicalData = {
        ...existingDoc,
        id: mapping.canonicalId,
        name: mapping.canonicalName || existingDoc.name,
        slug: mapping.canonicalSlug || mapping.canonicalId.replace("cat-", ""),
        status: "active",
        isDeleted: false,
        updatedAt: new Date().toISOString()
      };
      categoryUpserts.push(canonicalData);
      console.log(`    -> Will create/upsert clean category [${mapping.canonicalId}] "${canonicalData.name}"`);
    }

    // If merge, check if canonical doc needs metadata from duplicate
    if (mapping.action === "merge" && mapping.canonicalId) {
      const canonicalDoc = categories.find(c => c.id === mapping.canonicalId);
      if (canonicalDoc) {
        let metaUpdate = null;
        if (!canonicalDoc.image_url && existingDoc.image_url) {
          metaUpdate = metaUpdate || { ...canonicalDoc };
          metaUpdate.image_url = existingDoc.image_url;
        }
        if (!canonicalDoc.description && existingDoc.description) {
          metaUpdate = metaUpdate || { ...canonicalDoc };
          metaUpdate.description = existingDoc.description;
        }
        if (metaUpdate) {
          metaUpdate.updatedAt = new Date().toISOString();
          categoryUpserts.push(metaUpdate);
          console.log(`    -> Will merge missing metadata (image/desc) into canonical [${mapping.canonicalId}]`);
        }
      }
    }

    // Migrate linked products
    if (mapping.canonicalId) {
      const linkedProducts = products.filter(p =>
        p.category_id === dupId ||
        p.categoryId === dupId ||
        (existingDoc.slug && p.category_slug === existingDoc.slug)
      );

      if (linkedProducts.length > 0) {
        console.log(`    -> Migrating ${linkedProducts.length} linked product(s) to [${mapping.canonicalId}]:`);
        for (const p of linkedProducts) {
          console.log(`       * Product [${p.id}] "${p.name}"`);
          productUpdates.push({
            productId: p.id,
            data: {
              category_id: mapping.canonicalId,
              categoryId: mapping.canonicalId,
              category_slug: mapping.canonicalSlug || mapping.canonicalId.replace("cat-", ""),
              ...(mapping.canonicalName ? { category_name: mapping.canonicalName, category: mapping.canonicalName } : {})
            }
          });
        }
      }
    }

    categoryDeletions.push(dupId);
  }

  // 3. Check for any products with bare/unprefixed category IDs (e.g. "bag" -> "cat-bag")
  console.log(`\n--- Step 3: Checking Unprefixed Category References on Products ---`);
  const KNOWN_ID_FIXES = {
    "bag": "cat-bag",
    "bags": "cat-bag",
    "cases": "cat-cases",
    "gimbal": "cat-gimbal",
    "wallet": "cat-wallet",
    "smartphones": "cat-smartphones",
    "smart-finder": "cat-smart-finder"
  };

  for (const p of products) {
    const rawCat = p.category_id || p.categoryId;
    if (rawCat && KNOWN_ID_FIXES[rawCat]) {
      const fixedId = KNOWN_ID_FIXES[rawCat];
      if (!productUpdates.some(u => u.productId === p.id)) {
        console.log(`  Product [${p.id}] "${p.name}" has unprefixed category "${rawCat}" -> Updating to "${fixedId}"`);
        productUpdates.push({
          productId: p.id,
          data: {
            category_id: fixedId,
            categoryId: fixedId
          }
        });
      }
    }
  }

  // Summary
  console.log(`\n===============================================================`);
  console.log(`                     EXECUTION SUMMARY`);
  console.log(`===============================================================`);
  console.log(`Brands to preserve in 'brands'        : ${brandUpserts.length}`);
  console.log(`Categories to Upsert/Update           : ${categoryUpserts.length}`);
  console.log(`Products to Migrate                   : ${productUpdates.length}`);
  console.log(`Obsolete/Duplicate Categories to Delete: ${categoryDeletions.length}`);
  console.log(`===============================================================\n`);

  if (!isExecute) {
    console.log(`>>> DRY RUN COMPLETE. No data modified.`);
    console.log(`>>> To execute live changes, run:`);
    console.log(`    node scripts/execute-cleanup.mjs --execute\n`);
    return;
  }

  console.log(`>>> EXECUTING MIGRATION ON LIVE FIRESTORE DATABASE...`);

  // 1. Preserve missing brands
  for (const b of brandUpserts) {
    await setDoc(doc(db, "brands", b.id), b, { merge: true });
    console.log(`  [PRESERVED BRAND] brands/${b.id}`);
  }

  // 2. Upsert/Update Canonical Categories
  for (const cat of categoryUpserts) {
    await setDoc(doc(db, "categories", cat.id), cat, { merge: true });
    console.log(`  [UPSERTED CATEGORY] categories/${cat.id}`);
  }

  // 3. Update Products
  for (const p of productUpdates) {
    await setDoc(doc(db, "products", p.productId), p.data, { merge: true });
    console.log(`  [UPDATED PRODUCT] products/${p.productId} -> ${p.data.category_id}`);
  }

  // 4. Delete Duplicate & Brand Documents from 'categories'
  for (const catId of categoryDeletions) {
    await deleteDoc(doc(db, "categories", catId));
    console.log(`  [DELETED CATEGORY] categories/${catId}`);
  }

  console.log(`\n===============================================================`);
  console.log(`>>> SUCCESS: LIVE CATEGORY CLEANUP COMPLETED! <<<`);
  console.log(`===============================================================\n`);
}

execute().catch(err => {
  console.error("Migration failed with error:", err);
  process.exit(1);
});
