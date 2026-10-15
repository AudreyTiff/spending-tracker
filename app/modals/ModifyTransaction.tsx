"use client";

import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
// import { addTransaction } from "@/app/pages/transaction"
import "@/app/pages/styles.css";

interface Transaction{
    id:string;
    amount:number;
    merchant:string;
    category: string;
    date: Date | string;
}
interface ModifyTransacitonProps {
    transaction: Transaction;
    onModifyTransaction: (id: string, amount: number, merchant: string, category: string, date: string) => Promise<void>;
}

export default function ModifyModal({transaction, onModifyTransaction}: ModifyTransacitonProps) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState(transaction.amount);
    const [merchant, setMerchant] = useState(transaction.merchant);
    const [category, setCategory] = useState(transaction.category);
    const [date, setDate] = useState(new Date(transaction.date).toISOString().split("T")[0]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        try{
        e.preventDefault();

        await onModifyTransaction(transaction.id, amount, merchant, category, date);
        setOpen(false);
        }
        catch{
        alert("Failed to add transaction...");
        }
    };
      return (
    <>
    <button type="button" onClick={() => setOpen(true)} style={{textDecoration: "underline", color:"blue", cursor:"pointer"}}> Modify </button>
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs"fullWidth>
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
            <input type="number" id="amount" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="modal-input" min="0" step="0.01" required/>
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
              <button type="button" className="white-button" onClick={() => setOpen(false)}> Cancel </button>
              <button type="submit" className="small-button">Update</button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}

