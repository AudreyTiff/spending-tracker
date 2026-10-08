"use client";

import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import "@/app/pages/styles.css";

interface AddSavingsModalProps {
  currentSavings?: number;
  onSaveSavings: (amount: number) => void | Promise<void>;
}

export default function AddSavingsModal({ currentSavings = 0, onSaveSavings }: AddSavingsModalProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(currentSavings ? currentSavings.toString() : "");
  const [isLoading, setIsLoading] = useState(false);

  const handleOpen = () => {
    setAmount(currentSavings ? currentSavings.toString() : "");
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    try {
      setIsLoading(true);
      await onSaveSavings(parseFloat(amount));
      setOpen(false);
      setIsLoading(false);
    } catch {
      alert("Failed to update savings...");
    } 
  };

  return (
    <>
      <button type="button" onClick={handleOpen} className="small-button"> + Add </button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1, pt: 2, px: 3 }}>
          <div className="modal-header">
            <h3 className="modal-title">Update Savings</h3>
            <button type="button" onClick={() => setOpen(false)} className="cursor-pointer"> ✕ </button>
          </div>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 3 }}>
          <form onSubmit={handleSubmit} className="modal-body">
            <div className="file-input-wrapper">
              <label className="modal-label"> Amount </label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="modal-input" placeholder="Enter savings" min="0" step="0.01" required />
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary"> Cancel </button>
              <button type="submit" className="small-button"> Save </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
