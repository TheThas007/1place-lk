import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, getDocs } from "firebase/firestore";

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

function normalizeName(name) {
  if (!name) return "";
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function generateSlug(name) {
  return normalizeName(name).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function audit() {
  const catSnap = await getDocs(collection(db, "categories"));
  const prodSnap = await getDocs(collection(db, "products"));

  const categories = catSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const products = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`TOTAL CATEGORIES IN DB: ${categories.length}`);
  console.log(`TOTAL PRODUCTS IN DB: ${products.length}`);

  // Group by normalized name & slug
  const bySlug = new Map();

  for (const cat of categories) {
    const norm = normalizeName(cat.name);
    const slug = cat.slug ? generateSlug(cat.slug) : generateSlug(norm);
    const key = slug;

    if (!bySlug.has(key)) {
      bySlug.set(key, []);
    }
    bySlug.get(key).push(cat);
  }

  console.log(`\n--- ALL CATEGORY GROUPS (Total distinct slug groups: ${bySlug.size}) ---`);
  
  let duplicateGroups = 0;
  let totalDuplicateDocs = 0;

  for (const [slug, docs] of bySlug.entries()) {
    const isDup = docs.length > 1;
    if (isDup) {
      duplicateGroups++;
      totalDuplicateDocs += (docs.length - 1);
    }

    console.log(`\n[${isDup ? "DUPLICATE GROUP" : "UNIQUE"}] Slug Key: "${slug}" (${docs.length} docs):`);
    for (const d of docs) {
      // Find products that reference this category
      const directProds = products.filter(p => p.category_id === d.id || p.categoryId === d.id);
      const slugProds = products.filter(p => p.category_slug === d.slug && p.category_id !== d.id && p.categoryId !== d.id);
      const nameProds = products.filter(p => 
        (normalizeName(p.category_name) === normalizeName(d.name) || normalizeName(p.category) === normalizeName(d.name)) &&
        p.category_id !== d.id && p.categoryId !== d.id && p.category_slug !== d.slug
      );

      console.log(`  - Doc ID: "${d.id}" | Name: "${d.name}" | Slug: "${d.slug}" | Status: "${d.status}" | Del: ${d.isDeleted || false} | Img: ${d.image_url ? "YES" : "NO"} | DirectProds(by ID): ${directProds.length} | SlugProds: ${slugProds.length} | NameProds: ${nameProds.length}`);
      if (directProds.length > 0) {
        console.log(`     Product sample: ${directProds.slice(0, 3).map(p => `[${p.id}: ${p.name}]`).join(", ")}`);
      }
    }
  }

  console.log(`\n==========================================`);
  console.log(`Summary:`);
  console.log(`Total Categories in Firestore: ${categories.length}`);
  console.log(`Duplicate Groups: ${duplicateGroups}`);
  console.log(`Total Extra Duplicate Category Docs: ${totalDuplicateDocs}`);
  console.log(`==========================================`);
}

audit().catch(console.error);
