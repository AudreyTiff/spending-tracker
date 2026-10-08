"use client";

import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import "@/app/pages/styles.css";

interface DeleteAccountModalProps {
    onDeleteAccount: () => Promise<{ success: boolean; error?: string } | void>;
}

export default function DeleteAccountModal({ onDeleteAccount }: DeleteAccountModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await onDeleteAccount();
            setIsDeleting(false);
            setIsOpen(false);
            window.location.href = "/login";
        } catch {
            alert("Failed to delete account...");
        }
    };

    return (
        <>
            <button type="button" onClick={() => setIsOpen(true)} className="small-button" style={{ backgroundColor: "#dc2626" }}>Delete Account</button>
            <Dialog open={isOpen} onClose={() => !isDeleting && setIsOpen(false)}>
                <DialogTitle sx={{ pb: 1, pt: 2, px: 3 }}>
                    <div className="modal-header">
                        <h3 className="modal-title">Delete Account</h3>
                        <button type="button" onClick={() => setIsOpen(false)} disabled={isDeleting} className="cursor-pointer">✕</button>
                    </div>
                </DialogTitle>
                <DialogContent sx={{ px: 3, pb: 3 }}>
                    <p style={{ margin: 0, color: "#52525b", fontSize: "0.95rem" }}>
                        Are you sure you want to delete your account? All data related to this account will be permanently deleted.
                    </p>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <button type="button" onClick={() => setIsOpen(false)} disabled={isDeleting} className="btn-secondary">Cancel</button>
                    <button type="button" onClick={handleConfirm} disabled={isDeleting} className="small-button" style={{ backgroundColor: "#dc2626" }}>{isDeleting ? "Deleting..." : "Delete"}</button>
                </DialogActions>
            </Dialog>
        </>
    );
}
