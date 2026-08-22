"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RepairJob, RepairStatus } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import {
  Wrench,
  Plus,
  Search,
  Calendar,
  User,
  Phone,
  Smartphone,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  FileText,
} from "lucide-react";
import RepairModal from "@/components/admin/RepairModal";

export default function RepairsTab() {
  const [repairs, setRepairs] = useState<RepairJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRepair, setEditingRepair] = useState<RepairJob | null>(null);

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "repairs"));
      const data = snap.docs.map((d) => ({ ...d.data(), id: d.id } as RepairJob));
      setRepairs(data.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    } catch (e) {
      console.error("Error fetching repairs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this repair job?")) return;
    try {
      await deleteDoc(doc(db, "repairs", id));
      setRepairs((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete repair job");
    }
  };

  const filteredRepairs = repairs.filter((r) => {
    const matchSearch =
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search) ||
      (r.jobId && r.jobId.toLowerCase().includes(search.toLowerCase())) ||
      r.model.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: RepairStatus) => {
    switch (status) {
      case "Ready":
      case "Delivered":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Repairing":
      case "Quality Check":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Waiting Parts":
      case "Checking":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Cancelled":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-blue-500" />
            Device Repair Management
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Track phone & gadget repair jobs, technician assignments, costs, and customer warranty statuses.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingRepair(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md shadow-blue-600/30 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Repair Job
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-white/40 font-bold uppercase">Total Jobs</p>
          <h3 className="text-xl font-black text-white mt-1">{repairs.length}</h3>
        </div>
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-white/40 font-bold uppercase">In Progress</p>
          <h3 className="text-xl font-black text-blue-400 mt-1">
            {repairs.filter((r) => r.status === "Repairing" || r.status === "Checking").length}
          </h3>
        </div>
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-white/40 font-bold uppercase">Ready for Pickup</p>
          <h3 className="text-xl font-black text-emerald-400 mt-1">
            {repairs.filter((r) => r.status === "Ready").length}
          </h3>
        </div>
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-white/40 font-bold uppercase">Pending Advances</p>
          <h3 className="text-xl font-black text-amber-400 mt-1">
            {formatPrice(repairs.reduce((sum, r) => sum + (Number(r.balance) || 0), 0))}
          </h3>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job ID, customer name, phone, or model..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Statuses</option>
              <option value="Pending" className="bg-slate-900">Pending</option>
              <option value="Checking" className="bg-slate-900">Checking</option>
              <option value="Repairing" className="bg-slate-900">Repairing</option>
              <option value="Waiting Parts" className="bg-slate-900">Waiting Parts</option>
              <option value="Ready" className="bg-slate-900">Ready</option>
              <option value="Delivered" className="bg-slate-900">Delivered</option>
              <option value="Cancelled" className="bg-slate-900">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-white/40 font-bold border-b border-white/10 uppercase tracking-wider text-[10px]">
                <th className="pb-3">Job ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Device / Model</th>
                <th className="pb-3">Problem</th>
                <th className="pb-3">Cost / Balance</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRepairs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-white/40 font-medium">
                    No repair jobs found.
                  </td>
                </tr>
              ) : (
                filteredRepairs.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 font-mono font-bold text-blue-400">
                      {r.jobId || `REP-${r.id.slice(0, 5)}`}
                    </td>
                    <td className="py-3.5">
                      <p className="font-bold text-white">{r.customerName}</p>
                      <p className="text-[11px] text-white/40">{r.phone}</p>
                    </td>
                    <td className="py-3.5">
                      <p className="font-bold text-white">{r.brand} {r.model}</p>
                      {r.deviceImei && <p className="text-[10px] text-white/40 font-mono">IMEI: {r.deviceImei}</p>}
                    </td>
                    <td className="py-3.5 max-w-xs truncate text-white/70">
                      {r.problem}
                    </td>
                    <td className="py-3.5">
                      <p className="font-bold text-white">{formatPrice(r.cost || 0)}</p>
                      <p className="text-[10px] text-amber-400">Bal: {formatPrice(r.balance || 0)}</p>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${getStatusBadge(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingRepair(r);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 font-bold p-1 bg-blue-500/10 rounded-lg border border-blue-500/20 cursor-pointer"
                        title="Edit Repair Job"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-red-400 hover:text-red-300 font-bold p-1 bg-red-500/10 rounded-lg border border-red-500/20 cursor-pointer"
                        title="Delete Repair Job"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Repair Modal */}
      <RepairModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={() => {
          setIsModalOpen(false);
          fetchRepairs();
        }}
        initialData={editingRepair}
      />
    </div>
  );
}
