"use client";

import { useState, useEffect } from "react";
import { Brand, Product } from "@/lib/types";
import { getBrandsFromDb, saveBrandToDb, deleteBrandFromDb } from "@/lib/firestore-brands";
import { Plus, Edit, Trash2, Tag, Search, RefreshCw, CheckCircle, AlertCircle, ShieldCheck } from "lucide-react";
import { MigrationAuditResult } from "@/lib/migration-audit";

export default function BrandsTab({ products = [] }: { products?: Product[] }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Migration state
  const [auditResults, setAuditResults] = useState<MigrationAuditResult[] | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Brand>>({
    name: "",
    slug: "",
    logo_url: "",
    description: "",
    sort_order: 1,
    status: "active",
    show_on_homepage: true,
  });

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const data = await getBrandsFromDb();
      setBrands(data);
    } catch (e) {
      console.error("Failed to fetch brands:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData(brand);
    } else {
      setEditingBrand(null);
      setFormData({
        name: "",
        slug: "",
        logo_url: "",
        description: "",
        sort_order: brands.length + 1,
        status: "active",
        show_on_homepage: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Please provide a brand name");
      return;
    }
    try {
      await saveBrandToDb(formData);
      setIsModalOpen(false);
      fetchBrands();
    } catch (err) {
      console.error("Failed to save brand:", err);
      alert("Error saving brand");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const assignedCount = products.filter(
      p => (p.brand_id === id || p.brandId === id || p.brand?.toLowerCase() === name.toLowerCase())
    ).length;

    if (assignedCount > 0) {
      alert(`Cannot delete brand '${name}' because ${assignedCount} product(s) are currently assigned to it. Please reassign products first.`);
      return;
    }

    if (confirm(`Are you sure you want to delete brand '${name}'?`)) {
      await deleteBrandFromDb(id);
      fetchBrands();
    }
  };

  const runMigrationAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch("/api/admin/migrate-categories");
      const data = await res.json();
      if (data.success) {
        setAuditResults(data.auditResults);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuditing(false);
    }
  };

  const executeMigration = async () => {
    if (!confirm("This will safely update product classification (category & brand fields) in Firestore. Products, prices, stock, and URLs will remain preserved. Proceed?")) return;
    setIsMigrating(true);
    setMigrationStatus("Applying migration in Firestore...");
    try {
      const res = await fetch("/api/admin/migrate-categories", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setMigrationStatus(`Migration complete! ${data.updatedCount} products updated.`);
        fetchBrands();
        setTimeout(() => setMigrationStatus(null), 5000);
      } else {
        alert("Migration failed: " + data.error);
      }
    } catch (e: any) {
      alert("Migration failed: " + e.message);
    } finally {
      setIsMigrating(false);
    }
  };

  const filteredBrands = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-400" />
            Brand & Manufacturer Management
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Manage genuine brand manufacturers (Apple, Samsung, JBL, LENYES, Anker, etc.) separately from product types.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runMigrationAudit}
            disabled={isAuditing}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all border border-white/10"
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${isAuditing ? "animate-spin" : ""}`} />
            Audit Legacy Data
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Brand
          </button>
        </div>
      </div>

      {/* Migration Status Toast */}
      {migrationStatus && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs font-bold animate-in fade-in">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{migrationStatus}</span>
        </div>
      )}

      {/* Audit Preview Section */}
      {auditResults && (
        <div className="p-5 bg-slate-900 border border-white/10 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Category & Brand Migration Audit Preview ({auditResults.length} Products)
            </h3>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setAuditResults(null)}
                className="text-xs text-white/50 hover:text-white"
              >
                Dismiss
              </button>
              <button
                onClick={executeMigration}
                disabled={isMigrating}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                {isMigrating ? "Applying..." : "Apply Data Migration"}
              </button>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto border border-white/10 rounded-xl">
            <table className="w-full text-left text-xs text-white">
              <thead className="bg-white/5 border-b border-white/10 text-white/60">
                <tr>
                  <th className="p-2.5">Product</th>
                  <th className="p-2.5">Legacy Cat</th>
                  <th className="p-2.5">New Category</th>
                  <th className="p-2.5">New Brand</th>
                  <th className="p-2.5">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {auditResults.map(r => (
                  <tr key={r.productId} className="hover:bg-white/5">
                    <td className="p-2.5 font-bold font-sans">{r.productName}</td>
                    <td className="p-2.5 text-amber-300">{r.originalCategory}</td>
                    <td className="p-2.5 text-emerald-400 font-bold">{r.suggestedCategoryName}</td>
                    <td className="p-2.5 text-blue-400 font-bold">{r.suggestedBrandName}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.confidence === "HIGH" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {r.confidence}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Brands Catalog Table */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white">
            <thead className="bg-white/5 border-b border-white/10 text-white/60">
              <tr>
                <th className="px-5 py-3.5 font-bold">Brand Name</th>
                <th className="px-5 py-3.5 font-bold">Slug</th>
                <th className="px-5 py-3.5 font-bold">Products Assigned</th>
                <th className="px-5 py-3.5 font-bold">Homepage</th>
                <th className="px-5 py-3.5 font-bold">Status</th>
                <th className="px-5 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-white/40 font-bold">Loading brands...</td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-white/40">No brands found.</td>
                </tr>
              ) : (
                filteredBrands.map((b) => {
                  const assignedCount = products.filter(
                    p => (p.brand_id === b.id || p.brandId === b.id || p.brand?.toLowerCase() === b.name.toLowerCase())
                  ).length;

                  return (
                    <tr key={b.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-white flex items-center gap-3">
                        {b.logo_url ? (
                          <img src={b.logo_url} alt={b.name} className="w-6 h-6 object-contain bg-white/10 p-0.5 rounded" />
                        ) : (
                          <div className="w-6 h-6 rounded bg-blue-600/30 text-blue-400 font-black flex items-center justify-center text-[10px]">
                            {b.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span>{b.name}</span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-white/60">{b.slug}</td>
                      <td className="px-5 py-3.5 font-bold text-emerald-400 font-mono">
                        {assignedCount} Products
                      </td>
                      <td className="px-5 py-3.5">
                        {b.show_on_homepage !== false ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">Visible</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-white/10 text-white/40 font-bold text-[10px]">Hidden</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status !== "inactive" ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"
                        }`}>
                          {b.status || "active"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(b)}
                            className="p-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(b.id, b.name)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/20 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95 text-white">
            <h3 className="text-base font-extrabold flex items-center gap-2 border-b border-white/10 pb-3">
              <Tag className="w-4 h-4 text-blue-400" />
              {editingBrand ? `Edit Brand: ${editingBrand.name}` : "Create Brand"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-white/80 mb-1">Brand Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Samsung, Apple, JBL"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })}
                  className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl font-bold text-white outline-none focus:border-blue-500 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-white/80 mb-1">Logo URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.logo_url || ""}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl text-white outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-white/80 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Genuine manufacturer overview..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl text-white outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                <span className="font-bold text-white/80">Show on Homepage Brand Strip</span>
                <input
                  type="checkbox"
                  checked={formData.show_on_homepage !== false}
                  onChange={(e) => setFormData({ ...formData, show_on_homepage: e.target.checked })}
                  className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md"
                >
                  {editingBrand ? "Update Brand" : "Save Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
