"use client";
import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import "@/app/pages/styles.css";

interface DeleteConfirmationModalProps {
    transactionId: string;
    onDelete: (id: string) => Promise<void>;
}

export default function DeleteConfirmationModal({ transactionId, onDelete }: DeleteConfirmationModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDdeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        try{
            await onDelete(transactionId);
        } catch {
            alert("Error deleting transaction...")
        }
        setIsOpen(false);
        setIsDeleting(false);
    };
    return (
        <>
        <button type="button" onClick={() => setIsOpen(true)} style={{textDecoration: "underline", color:"red", cursor:"pointer"}}> Delete </button>
        <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
            <DialogTitle sx={{ pb: 1, pt: 2, px: 3 }}>
                <div className="modal-header">
                    <h3 className="modal-title">Delete Confirmation</h3>
                    <button onClick={() => setIsOpen(false)} className="cursor-pointer"> ✕ </button>
                </div>
            </DialogTitle>
            <DialogContent sx={{ px: 3, pb: 3 }}>
                <p>Are you sure you want to delete this?</p>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <button onClick={() => setIsOpen(false)} className="white-button"> Cancel </button>
                <button onClick={handleConfirm} className="small-button"> Yes </button>
            </DialogActions>
        </Dialog>
        </>
    );
}