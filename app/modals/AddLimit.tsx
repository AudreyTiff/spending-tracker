"use client";

import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import "@/app/pages/styles.css";

interface AddLimitModalProps {
  onAddLimit: (category: string, amount: number) => void;
}

export default function AddLimitModal({ onAddLimit }: AddLimitModalProps) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) return;
    onAddLimit(category, parseFloat(amount));
    setCategory("");
    setAmount("");
    setIsOpen(false);
  };

  
  return (
    <>
    <button type="button" onClick={() => setIsOpen(true)} className="small-button"> + Set Limit </button>
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} maxWidth="sm" fullWidth >
      <DialogTitle sx={{ pb: 1, pt: 2, px: 3 }}>
        <div className="modal-header">
          <h3 className="modal-title">Set Monthly Limit</h3>
          <button type="button" onClick={() => setIsOpen(false)} className="cursor-pointer"> ✕ </button>
        </div>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pb: 3 }}>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="file-input-wrapper">
            <label className="modal-label">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="modal-input" required>
              <option value="">Select Category</option>
              <option value="Accommodation">Accommodation</option>
              <option value="Eating Out">Eating Out</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Groceries">Groceries</option>
              <option value="Medical">Medical</option>
              <option value="Shopping">Shopping</option>
              <option value="Transport">Transport</option>
              <option value="Utilities">Utilities</option>
              <option value="Others">Others...</option>
            </select>

            <label className="modal-label">Limit Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="modal-input" placeholder="Enter your monthly limit" min="0" step="0.01" required />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={() => setIsOpen(false)} className="small-button">Cancel</button>
            <button type="submit" disabled={!category || !amount} className={`btn-submit ${category && amount ? "active" : ""}`}>Modify Limit</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}