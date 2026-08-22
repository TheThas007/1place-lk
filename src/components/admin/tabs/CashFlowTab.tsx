"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CashFlowTransaction } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import {
  Search,
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Calendar,
  Filter,
} from "lucide-react";
import CashFlowModal from "@/components/admin/CashFlowModal";

export default function CashFlowTab() {
  const [transactions, setTransactions] = useState<CashFlowTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<CashFlowTransaction | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "cashflow"));
      const data = snap.docs.map((d) => ({ ...d.data(), id: d.id } as CashFlowTransaction));
      setTransactions(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      await deleteDoc(doc(db, "cashflow", id));
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchSearch =
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || t.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-emerald-500" />
            Cash Flow & Expense Ledger
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Track daily business income, store operating expenses, utilities, stock purchases, and net profit.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTransaction(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md shadow-emerald-600/30 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Net Balance</span>
          </div>
          <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${netBalance >= 0 ? "text-white" : "text-red-400"}`}>
            {formatPrice(netBalance)}
          </h3>
        </div>

        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Total Income</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
            {formatPrice(totalIncome)}
          </h3>
        </div>

        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Total Expenses</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-red-400 tracking-tight">
            {formatPrice(totalExpense)}
          </h3>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by description or category..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Types</option>
              <option value="income" className="bg-slate-900">Income Only</option>
              <option value="expense" className="bg-slate-900">Expenses Only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-white/40 font-bold border-b border-white/10 uppercase tracking-wider text-[10px]">
                <th className="pb-3">Date</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Description</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-white/40 font-medium">
                    No cashflow records found. Click "Add Transaction" to create one.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 font-mono text-white/60">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                        t.type === "income"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}>
                        {t.type === "income" ? "+ Income" : "- Expense"}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-white">{t.category}</td>
                    <td className="py-3.5 text-white/70 max-w-sm">{t.description}</td>
                    <td className={`py-3.5 text-right font-black text-sm ${
                      t.type === "income" ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {t.type === "income" ? "+" : "-"} {formatPrice(t.amount)}
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingTransaction(t);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 font-bold p-1 bg-blue-500/10 rounded-lg border border-blue-500/20 cursor-pointer"
                        title="Edit Transaction"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-red-400 hover:text-red-300 font-bold p-1 bg-red-500/10 rounded-lg border border-red-500/20 cursor-pointer"
                        title="Delete Transaction"
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

      {/* Cashflow Modal */}
      <CashFlowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={() => {
          setIsModalOpen(false);
          fetchTransactions();
        }}
        initialData={editingTransaction}
      />
    </div>
  );
}
