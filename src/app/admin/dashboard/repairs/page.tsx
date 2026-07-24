"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RepairJob } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Search, Plus, Wrench, Edit, Trash2, Phone, MessageCircle } from "lucide-react";
import RepairModal from "@/components/admin/RepairModal";

export default function RepairsPage() {
  const [repairs, setRepairs] = useState<RepairJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<RepairJob | null>(null);

  const fetchRepairs = async () => {
    try {
      const snap = await getDocs(collection(db, "repairs"));
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as RepairJob));
      setRepairs(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this repair job?")) {
      await deleteDoc(doc(db, "repairs", id));
      setRepairs(repairs.filter(r => r.id !== id));
    }
  };

  const handleEdit = (job: RepairJob) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const filteredRepairs = repairs.filter(r => 
    r.jobId.toLowerCase().includes(search.toLowerCase()) || 
    r.customerName.toLowerCase().includes(search.toLowerCase()) ||
    r.phone.includes(search)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      case "Checking": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Waiting Parts": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "Repairing": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Quality Check": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "Ready": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Delivered": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "Cancelled": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-white/10 text-white border-white/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-500" />
            Repair Center
          </h1>
          <p className="text-sm text-white/50 mt-1">Manage all customer repair jobs</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          New Repair Job
        </button>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text"
              placeholder="Search by Job ID, Customer, or Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white">
            <thead className="bg-white/5 border-b border-white/10 text-white/60">
              <tr>
                <th className="px-6 py-4 font-medium">Job ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Device</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Balance</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-white/40">Loading repairs...</td>
                </tr>
              ) : filteredRepairs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40 flex flex-col items-center">
                    <Wrench className="w-12 h-12 mb-3 opacity-20" />
                    No repair jobs found. Create one to get started.
                  </td>
                </tr>
              ) : (
                filteredRepairs.map((job) => (
                  <tr key={job.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-blue-400 font-bold">{job.jobId}</span>
                      <div className="text-xs text-white/40 mt-1">{new Date(job.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{job.customerName}</div>
                      <div className="text-xs text-white/50 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {job.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{job.brand} {job.model}</div>
                      <div className="text-xs text-white/50 mt-1 truncate max-w-[200px]">{job.problem}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-bold ${job.balance > 0 ? "text-red-400" : "text-emerald-400"}`}>
                        {formatPrice(job.balance)}
                      </div>
                      <div className="text-xs text-white/40 mt-1">Cost: {formatPrice(job.cost)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a 
                          href={`https://wa.me/${job.phone.replace(/[^0-9]/g, '')}?text=Hello ${job.customerName}, your repair job (${job.jobId}) is currently: ${job.status}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white rounded-lg transition-colors"
                          title="WhatsApp Update"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <button 
                          onClick={() => handleEdit(job)}
                          className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(job.id)}
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
        <RepairModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={fetchRepairs}
          initialData={editingJob}
        />
      )}
    </div>
  );
}
