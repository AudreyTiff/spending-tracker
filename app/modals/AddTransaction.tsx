"use client";

import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
// import { addTransaction } from "@/app/pages/transaction"
import "@/app/pages/styles.css";

interface AddTransactionProps {
  onAddTransaction: (amount: number, merchant: string, category: string, date: string) => void;
}

export default function AddTransactionModal({ onAddTransaction }: AddTransactionProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");


  const handleClose = () => {
    setCategory("");
    setAmount("");
    setDate("");
    setMerchant("");
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try{
      e.preventDefault();
      if (!date || !merchant || !category || !amount) return;

      await onAddTransaction(parseFloat(amount), merchant, category, date);
      handleClose();
    }
    catch(error){
      alert("Fail to add transaction.");
    }
  };

  return (
    <>
    <button type="button" className="small-button" onClick={() => setOpen(true)}> + Add Transaction </button>
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle sx={{ pb: 1, pt: 2, px: 3 }}>
        <div className="modal-header">
          <h3 className="modal-title">Add Transaction</h3>
          <button type="button" onClick={() => setOpen(false)} className="cursor-pointer"> ✕ </button>
        </div>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pb: 3 }}>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="file-input-wrapper">
            <label htmlFor="amount">Amount</label>
            <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="modal-input" min="0" step="0.01" required/>
            <label htmlFor="merchant">Merchant</label>
            <input type="text" id="merchant" value={merchant} onChange={(e) => setMerchant(e.target.value)} className="modal-input" required/>
            <label htmlFor="category">Category</label>
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
            <label htmlFor="date">Date</label>
            <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="modal-input" required/>
            <div className="modal-actions">
              <button type="submit" className="small-button">Add Transaction</button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
