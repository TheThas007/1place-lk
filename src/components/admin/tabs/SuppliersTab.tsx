"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Supplier } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import {
  Building,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Star,
  DollarSign,
  Edit,
  Trash2,
  Package,
} from "lucide-react";
import SupplierModal from "@/components/admin/SupplierModal";

export default function SuppliersTab() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "suppliers"));
      const data = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Supplier));
      setSuppliers(data);
    } catch (e) {
      console.error("Error fetching suppliers:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await deleteDoc(doc(db, "suppliers", id));
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete supplier");
    }
  };

  const filteredSuppliers = suppliers.filter((s) => {
    return (
      s.companyName.toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      (s.address && s.address.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Building className="w-6 h-6 text-purple-500" />
            Supplier Directory & Contacts
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Manage device vendors, accessory wholesalers, contact numbers, and outstanding accounts payable.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingSupplier(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md shadow-purple-600/30 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Supplier
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-white/40 font-bold uppercase">Total Suppliers</p>
          <h3 className="text-xl font-black text-white mt-1">{suppliers.length}</h3>
        </div>
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-white/40 font-bold uppercase">Outstanding Payable</p>
          <h3 className="text-xl font-black text-amber-400 mt-1">
            {formatPrice(suppliers.reduce((sum, s) => sum + (Number(s.outstandingBalance) || 0), 0))}
          </h3>
        </div>
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-white/40 font-bold uppercase">Average Rating</p>
          <h3 className="text-xl font-black text-emerald-400 mt-1 flex items-center gap-1">
            <Star className="w-4 h-4 fill-emerald-400" /> 4.9 / 5.0
          </h3>
        </div>
      </div>

      {/* Search & Grid */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-lg space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suppliers by company, person, or phone..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 outline-none focus:border-purple-500"
          />
        </div>

        {/* Supplier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredSuppliers.length === 0 ? (
            <div className="col-span-full py-8 text-center text-white/40 font-medium">
              No suppliers found. Click "Add New Supplier" to create one.
            </div>
          ) : (
            filteredSuppliers.map((s) => (
              <div
                key={s.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-purple-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-extrabold text-white">{s.companyName}</h3>
                      <p className="text-xs text-white/60 font-medium">{s.contactPerson}</p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 font-bold text-xs bg-amber-400/10 px-2 py-0.5 rounded-md">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{s.rating || 5}</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-white/70">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-purple-400" />
                      <span>{s.phone}</span>
                    </div>
                    {s.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-purple-400" />
                        <span className="truncate">{s.email}</span>
                      </div>
                    )}
                    {s.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" />
                        <span className="truncate">{s.address}</span>
                      </div>
                    )}
                  </div>

                  {s.productsSupplied && s.productsSupplied.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {s.productsSupplied.map((p, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-white/10 text-white/80 rounded-md text-[10px] font-bold"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-white/40 uppercase font-bold block">Balance</span>
                    <span className="text-xs font-black text-amber-400">
                      {formatPrice(s.outstandingBalance || 0)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingSupplier(s);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                      title="Edit Supplier"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                      title="Delete Supplier"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Supplier Modal */}
      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={() => {
          setIsModalOpen(false);
          fetchSuppliers();
        }}
        initialData={editingSupplier}
      />
    </div>
  );
}
