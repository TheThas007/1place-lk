"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CashFlowTransaction } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Search, Plus, DollarSign, TrendingUp, TrendingDown, Edit, Trash2 } from "lucide-react";
import CashFlowModal from "@/components/admin/CashFlowModal";

export default function CashFlowPage() {
  const [transactions, setTransactions] = useState<CashFlowTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<CashFlowTransaction | null>(null);

  const fetchTransactions = async () => {
    try {
      const snap = await getDocs(collection(db, "cashflow"));
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as CashFlowTransaction));
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
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const handleEdit = (transaction: CashFlowTransaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(search.toLowerCase()) || 
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalIncome = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-500" />
            Cash Flow Dashboard
          </h1>
          <p className="text-sm text-white/50 mt-1">Track business income, expenses and net profit</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Net Balance</span>
          </div>
          <h3 className={`text-3xl font-black tracking-tight ${netBalance >= 0 ? "text-white" : "text-red-400"}`}>
            {formatPrice(netBalance)}
          </h3>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Total Income</span>
          </div>
          <h3 className="text-3xl font-black tracking-tight text-white">{formatPrice(totalIncome)}</h3>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Total Expenses</span>
          </div>
          <h3 className="text-3xl font-black tracking-tight text-white">{formatPrice(totalExpense)}</h3>
        </div>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white">
            <thead className="bg-white/5 border-b border-white/10 text-white/60">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/40">Loading transactions...</td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/40 flex flex-col items-center">
                    <DollarSign className="w-12 h-12 mb-3 opacity-20" />
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-medium text-white/70">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{transaction.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-white/10 rounded-md text-xs text-white/70">
                        {transaction.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-bold ${transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatPrice(transaction.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(transaction)}
                          className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(transaction.id)}
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
        <CashFlowModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={fetchTransactions}
          initialData={editingTransaction}
        />
      )}
    </div>
  );
}
