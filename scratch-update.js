const fs = require('fs');

// ── 1. Update ProductModal.tsx ──
let modalCode = fs.readFileSync('src/components/admin/ProductModal.tsx', 'utf8');

// import clearDataCache
modalCode = modalCode.replace(
  'import { getBrands, getCategories } from "@/lib/firestore-client";',
  'import { getBrands, getCategories, clearDataCache } from "@/lib/firestore-client";'
);

// setActiveTab(1) on open
modalCode = modalCode.replace(
  /(\s*if \(!isOpen\) return;)/,
  '$1\n    setActiveTab(1);'
);

// specifications safe extraction
modalCode = modalCode.replace(
  'const rows = Object.entries(initialData.specifications || {}).map(([key, value]) => ({ key, value }));',
  'const rawSpecs = initialData.specifications;\n      const rows = Array.isArray(rawSpecs)\n        ? rawSpecs.map((s: any) => ({ key: String(s?.key || s?.name || ""), value: String(s?.value || "") }))\n        : typeof rawSpecs === "object" && rawSpecs !== null\n        ? Object.entries(rawSpecs).map(([key, value]) => ({ key, value: String(value) }))\n        : [];'
);

// setDoc instead of updateDoc
modalCode = modalCode.replace(
  'await updateDoc(doc(db, "products", initialData.id), cleanedPayload);',
  'await setDoc(doc(db, "products", initialData.id), cleanedPayload, { merge: true });\n      clearDataCache("products");'
);

// Edit title and button labels
modalCode = modalCode.replace(
  '{initialData ? `Edit Product: ${initialData.name}` : "Create New Product"}',
  '{Boolean(initialData && initialData.id) ? `Edit Product: ${name || initialData.name}` : "Create New Product"}'
);
modalCode = modalCode.replace(
  '{initialData ? "Update Product" : "Publish Product"}',
  '{Boolean(initialData && initialData.id) ? "Update Product" : "Publish Product"}'
);

fs.writeFileSync('src/components/admin/ProductModal.tsx', modalCode, 'utf8');
console.log('ProductModal.tsx updated successfully.');
