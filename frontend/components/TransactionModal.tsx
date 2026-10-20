'use client';

import React, { useState } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { api } from '@/lib/api';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function TransactionModal({ isOpen, onClose, onSuccess, initialData }: TransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense'>(initialData?.transaction_type || 'expense');
  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(initialData?.amount ? String(initialData.amount) : '');
  const [txDate, setTxDate] = useState(initialData?.transaction_date || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const numAmt = parseFloat(amount);
    if (!description.trim() || isNaN(numAmt) || numAmt <= 0) {
      setError('Please provide a valid description and a positive amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        await api.transactions.update(initialData.id, {
          description: description.trim(),
          amount: numAmt,
          transaction_type: type,
          transaction_date: txDate,
          notes: notes.trim() || null,
        });
      } else {
        await api.transactions.create({
          description: description.trim(),
          amount: numAmt,
          transaction_type: type,
          transaction_date: txDate,
          currency: 'INR',
          notes: notes.trim() || null,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>{initialData ? 'Edit transaction' : 'Add transaction'}</h2>
            <p>Record financial cash flow in your workspace.</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-2.5 mb-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>Transaction type</label>
          <div className="type-toggle">
            <button
              type="button"
              className={type === 'expense' ? 'selected' : ''}
              onClick={() => setType('expense')}
            >
              Expense
            </button>
            <button
              type="button"
              className={type === 'income' ? 'selected income-selected' : ''}
              onClick={() => setType('income')}
            >
              Income
            </button>
          </div>

          <label htmlFor="tx-name">Description</label>
          <input
            id="tx-name"
            className="form-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Monthly salary, Groceries, Rent"
            required
          />

          <label htmlFor="tx-amount">Amount (₹)</label>
          <input
            id="tx-amount"
            type="number"
            min="1"
            step="0.01"
            className="form-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />

          <label htmlFor="tx-date">Date</label>
          <input
            id="tx-date"
            type="date"
            className="form-input"
            value={txDate}
            onChange={(e) => setTxDate(e.target.value)}
            required
          />

          <label htmlFor="tx-notes">Optional notes</label>
          <input
            id="tx-notes"
            className="form-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Shared bill with roommate"
          />

          <div className="modal-actions">
            <button type="button" className="button button-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button button-primary" disabled={isSubmitting}>
              {initialData ? <Save size={15} /> : <Plus size={16} />}
              {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
