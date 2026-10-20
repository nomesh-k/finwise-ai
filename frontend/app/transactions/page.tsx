'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { TransactionModal } from '@/components/TransactionModal';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('desc');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTx, setEditTx] = useState<any>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importing, setImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadTransactions() {
    try {
      setLoading(true);
      const res = await api.transactions.list({
        search: search.trim() || undefined,
        transaction_type: typeFilter || undefined,
        sort_by: sortBy,
        order: order,
        page,
        page_size: pageSize,
      });
      setTransactions(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, [page, typeFilter, sortBy, order]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadTransactions();
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to permanently delete this transaction?')) return;
    try {
      await api.transactions.delete(id);
      loadTransactions();
    } catch (err: any) {
      alert(err.message || 'Failed to delete transaction.');
    }
  }

  async function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setImporting(true);
    setImportResult(null);
    try {
      const res = await api.transactions.importCsv(formData);
      setImportResult(res);
      loadTransactions();
    } catch (err: any) {
      alert(err.message || 'CSV Import failed.');
    } finally {
      setImporting(false);
    }
  }

  return (
    <AppLayout pageTitle="Transactions">
      <div className="page-head">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" /> LEDGER RECORDS
          </div>
          <h1>
            Transactions<span className="heading-period">.</span>
          </h1>
          <p className="page-sub">Manage, search, and audit your recorded income and expenses.</p>
        </div>

        <div className="head-actions">
          <a
            href={api.transactions.getExportUrl()}
            target="_blank"
            rel="noreferrer"
            className="button button-secondary no-underline"
          >
            <Download size={15} /> Export CSV
          </a>
          <button className="button button-secondary" onClick={() => setShowImportModal(true)}>
            <Upload size={15} /> Import CSV
          </button>
          <button className="button button-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Transaction
          </button>
        </div>
      </div>

      <div className="panel full-panel">
        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md flex gap-2">
            <div className="search-field flex-1">
              <Search size={15} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search description, category..."
              />
            </div>
            <button type="submit" className="button button-secondary">
              Search
            </button>
          </form>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-white border border-[#D9E2DC] rounded-xl text-xs outline-none"
            >
              <option value="">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>

            {/* Sort Filter */}
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [s, o] = e.target.value.split('-');
                setSortBy(s);
                setOrder(o);
              }}
              className="px-3 py-2 bg-white border border-[#D9E2DC] rounded-xl text-xs outline-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>

            <span className="text-[11px] text-[#64748B] pl-2">{total} records</span>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="table-scroll mt-3">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>TRANSACTION</th>
                <th>CATEGORY</th>
                <th>DATE</th>
                <th className="amount-col">AMOUNT</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/60 transition-colors">
                    <td>
                      <div className="tx-name-cell">
                        <span className={`tx-symbol ${t.transaction_type === 'income' ? 'tx-income' : ''}`}>
                          {t.transaction_type === 'income' ? '↗' : '⌂'}
                        </span>
                        <div>
                          <strong>{t.description}</strong>
                          {t.notes && <div className="text-[10px] text-gray-400 font-normal">{t.notes}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-pill">{t.category_name || 'General'}</span>
                    </td>
                    <td className="tx-date">{formatDate(t.transaction_date)}</td>
                    <td className={`tx-amount ${t.transaction_type === 'income' ? 'income-amount' : ''}`}>
                      {t.transaction_type === 'income' ? '+' : '−'}
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setEditTx(t)}
                          className="p-1 text-gray-400 hover:text-emerald-700 transition-colors"
                          title="Edit transaction"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs">
            <span className="text-[#64748B]">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="button button-secondary py-1.5 px-3 text-xs disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="button button-secondary py-1.5 px-3 text-xs disabled:opacity-40"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <TransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadTransactions}
      />

      {/* Edit Modal */}
      {editTx && (
        <TransactionModal
          isOpen={!!editTx}
          initialData={editTx}
          onClose={() => setEditTx(null)}
          onSuccess={loadTransactions}
        />
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="modal-backdrop" onClick={() => setShowImportModal(false)}>
          <section className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2>Import Transactions via CSV</h2>
                <p>Upload a standard bank or spreadsheet CSV export.</p>
              </div>
              <button className="icon-button" onClick={() => setShowImportModal(false)}>
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-[#F5F7F5] rounded-xl border border-gray-100 text-[#64748B] leading-relaxed">
                Expected CSV columns: <code>Date, Description, Amount, Type (income/expense), Category</code>.
                FinWise AI automatically inspects each row for duplicates against your existing ledger records.
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                disabled={importing}
                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#16A36A] file:text-white hover:file:bg-[#128A58]"
              />

              {importing && <div className="text-[#16A36A] font-bold">Parsing and verifying transactions...</div>}

              {importResult && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle2 size={16} className="text-[#16A36A]" />
                    <span>Successfully imported {importResult.imported_count} new transactions.</span>
                  </div>

                  {importResult.duplicate_count > 0 && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertCircle size={15} />
                        <span>Skipped {importResult.duplicate_count} potential duplicates:</span>
                      </div>
                      <ul className="list-disc pl-5 text-[11px] space-y-0.5">
                        {importResult.duplicates_detected.slice(0, 3).map((d: any, i: number) => (
                          <li key={i}>
                            {d.date}: {d.description} (₹{d.amount})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => setShowImportModal(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </AppLayout>
  );
}
