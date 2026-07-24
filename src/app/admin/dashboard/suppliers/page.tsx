"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Supplier } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Search, Plus, Truck, Edit, Trash2, Phone, Mail, Building } from "lucide-react";
import SupplierModal from "@/components/admin/SupplierModal";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const fetchSuppliers = async () => {
    try {
      const snap = await getDocs(collection(db, "suppliers"));
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as Supplier));
      setSuppliers(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      await deleteDoc(doc(db, "suppliers", id));
      setSuppliers(suppliers.filter(s => s.id !== id));
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.companyName.toLowerCase().includes(search.toLowerCase()) || 
    s.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-purple-500" />
            Supplier Management
          </h1>
          <p className="text-sm text-white/50 mt-1">Manage wholesale suppliers, balances and purchase history</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-5 h-5" />
          Add Supplier
        </button>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text"
              placeholder="Search suppliers by company or contact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white">
            <thead className="bg-white/5 border-b border-white/10 text-white/60">
              <tr>
                <th className="px-6 py-4 font-medium">Company</th>
                <th className="px-6 py-4 font-medium">Contact Person</th>
                <th className="px-6 py-4 font-medium">Products</th>
                <th className="px-6 py-4 font-medium">Outstanding Balance</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/40">Loading suppliers...</td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/40 flex flex-col items-center">
                    <Building className="w-12 h-12 mb-3 opacity-20" />
                    No suppliers found.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs uppercase">
                          {supplier.companyName.substring(0, 2)}
                        </div>
                        {supplier.companyName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{supplier.contactPerson}</div>
                      <div className="text-xs text-white/50 flex flex-col gap-1 mt-1">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {supplier.phone}</span>
                        {supplier.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {supplier.email}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {supplier.productsSupplied?.map((p, i) => (
                          <span key={i} className="px-2 py-0.5 bg-white/10 rounded-md text-[10px] text-white/70 whitespace-nowrap">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-bold ${supplier.outstandingBalance > 0 ? "text-red-400" : "text-emerald-400"}`}>
                        {formatPrice(supplier.outstandingBalance)}
                      </div>
                      {supplier.outstandingBalance > 0 && (
                        <div className="text-[10px] text-red-400/60 mt-1 uppercase tracking-wider font-semibold">Payment Pending</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(supplier)}
                          className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(supplier.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <SupplierModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={fetchSuppliers}
          initialData={editingSupplier}
        />
      )}
    </div>
  );
}
