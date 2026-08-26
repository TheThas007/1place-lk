"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
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
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CheckCircle2,
} from "lucide-react";
import CashFlowModal from "@/components/admin/CashFlowModal";

export default function CashFlowTab() {
  const [transactions, setTransactions] = useState<CashFlowTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<CashFlowTransaction | null>(null);

  // ── Real-Time Firestore Synchronization (onSnapshot) ──
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "cashflow"),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          ...d.data(),
          id: d.id,
        } as CashFlowTransaction));

        // Sort descending by transaction date
        data.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        setTransactions(data);
        setLoading(false);
      },
      (error) => {
        console.error("Real-time Cash Flow snapshot error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this transaction record?")) {
      try {
        await deleteDoc(doc(db, "cashflow", id));
      } catch (err) {
        console.error("Delete cashflow transaction error:", err);
        alert("Failed to delete transaction. Please try again.");
      }
    }
  };

  // Distinct categories available in live transactions
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [transactions]);

  // Filtered transactions based on search, type, category, and date range
  const filteredTransactions = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    return transactions.filter((t) => {
      const matchSearch =
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || t.type === typeFilter;
      const matchCategory = categoryFilter === "all" || t.category === categoryFilter;

      let matchDate = true;
      if (dateRangeFilter === "today") {
        matchDate = (t.date || "").startsWith(todayStr);
      } else if (dateRangeFilter === "month") {
        matchDate = (t.date || "").startsWith(currentMonth);
      }

      return matchSearch && matchType && matchCategory && matchDate;
    });
  }, [transactions, search, typeFilter, categoryFilter, dateRangeFilter]);

  // Real-time financial calculations
  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === "income").reduce((acc, t) => acc + (Number(t.amount) || 0), 0),
    [transactions]
  );
  const totalExpense = useMemo(
    () => transactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + (Number(t.amount) || 0), 0),
    [transactions]
  );
  const netBalance = totalIncome - totalExpense;

  // Today's metrics
  const todayStr = new Date().toISOString().split("T")[0];
  const todayIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "income" && (t.date || "").startsWith(todayStr))
        .reduce((acc, t) => acc + (Number(t.amount) || 0), 0),
    [transactions, todayStr]
  );
  const todayExpense = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "expense" && (t.date || "").startsWith(todayStr))
        .reduce((acc, t) => acc + (Number(t.amount) || 0), 0),
    [transactions, todayStr]
  );

  return (
    <div className="space-y-6">
      {/* Header with Live Real-time Pulse Badge */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[#0F172A] border border-white/10 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <DollarSign className="w-6 h-6 text-emerald-400" />
              Cash Flow & Expense Ledger
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE REAL-TIME</span>
            </div>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Real-time ledger tracking store income, operating expenses, stock purchases, utilities, and net balance.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTransaction(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-emerald-600/30 shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {/* Real-time KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Balance */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Net Balance</span>
          </div>
          <h3 className={`text-2xl font-black tracking-tight ${netBalance >= 0 ? "text-white" : "text-red-400"}`}>
            {formatPrice(netBalance)}
          </h3>
          <p className="text-[11px] text-white/40 mt-1">
            {transactions.length} total live records
          </p>
        </div>

        {/* Total Income */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Total Income</span>
          </div>
          <h3 className="text-2xl font-black text-emerald-400 tracking-tight">
            {formatPrice(totalIncome)}
          </h3>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400/80 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Today: {formatPrice(todayIncome)}</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Total Expenses</span>
          </div>
          <h3 className="text-2xl font-black text-red-400 tracking-tight">
            {formatPrice(totalExpense)}
          </h3>
          <div className="flex items-center gap-1 text-[11px] text-red-400/80 mt-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Today: {formatPrice(todayExpense)}</span>
          </div>
        </div>

        {/* Real-time Status Card */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Sync Status</span>
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Real-time Connected</span>
            </div>
            <p className="text-[11px] text-white/40 mt-0.5">
              Instant multi-admin auto-sync
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by description or category..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none cursor-pointer hover:border-white/20 transition-colors"
            >
              <option value="all" className="bg-slate-900">All Types</option>
              <option value="income" className="bg-slate-900">Income Only (+)</option>
              <option value="expense" className="bg-slate-900">Expenses Only (-)</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none cursor-pointer hover:border-white/20 transition-colors"
            >
              <option value="all" className="bg-slate-900">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900">
                  {cat}
                </option>
              ))}
            </select>

            {/* Date Range Filter */}
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none cursor-pointer hover:border-white/20 transition-colors"
            >
              <option value="all" className="bg-slate-900">All Time</option>
              <option value="today" className="bg-slate-900">Today</option>
              <option value="month" className="bg-slate-900">This Month</option>
            </select>
          </div>
        </div>

        {/* Live Ledger Table */}
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
              {loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-white/40 font-medium">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      <span>Loading real-time cash flow records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-white/40 font-medium">
                    No cashflow records found matching your filters. Click "Add Transaction" to create one.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 font-mono text-white/70">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                          t.type === "income"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-red-500/10 text-red-400 border-red-500/30"
                        }`}
                      >
                        {t.type === "income" ? (
                          <>
                            <ArrowUpRight className="w-3 h-3" />
                            <span>Income</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="w-3 h-3" />
                            <span>Expense</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-white">{t.category}</td>
                    <td className="py-3.5 text-white/70 max-w-sm">{t.description}</td>
                    <td
                      className={`py-3.5 text-right font-black text-sm ${
                        t.type === "income" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"} {formatPrice(Number(t.amount) || 0)}
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingTransaction(t);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 font-bold p-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg border border-blue-500/20 transition-colors cursor-pointer"
                        title="Edit Transaction"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-red-400 hover:text-red-300 font-bold p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-colors cursor-pointer"
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
        onSave={() => setIsModalOpen(false)}
        initialData={editingTransaction}
      />
    </div>
  );
}
