"use client";
import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import "@/app/pages/styles.css";
import {useRouter} from "next/navigation";

export interface UploadSuccessData {
    fileName: string;
    message?: string;
    newTransactionsCount?: number;
    transactions?: any[];
    totalSpend?: number;
    isAiParsed?: boolean
}
interface UploadStatementModalProps {
    onUploadSuccess?: (data: UploadSuccessData) => void;
}

export default function UploadStatementModal({onUploadSuccess}: UploadStatementModalProps) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File>();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);
    const [uploadResult, setUploadResult] = useState<UploadSuccessData | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();
    
    const handleOpen = () => {
        setFile(undefined);
        setIsUploading(false);
        setUploadComplete(false);
        setUploadResult(null);
        setErrorMessage(null);
        setOpen(true);
    };
    const handleClose = () => {
        if (isUploading) return;
        setOpen(false);
    };
    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const startUpload = async () => {
        if (!file ||isUploading) return;
        setIsUploading(true);
        setErrorMessage(null);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch("/api/autoai", {
                method: "POST",
                body: formData
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                setIsUploading(false);
                alert(data.error || "Failed to process the statement...");
                return;
            }

            setIsUploading(false);
            setUploadComplete(true);

            const res: UploadSuccessData = {
                fileName: file.name,
                message: data.message,
                newTransactionsCount: data.newTransactionsCount,
                transactions: data.transactions,
                totalSpend: data.totalSpend,
                isAiParsed: data.isAiParsed
            };
            setUploadResult(res);

            if (onUploadSuccess) {
                onUploadSuccess(res);
            }
            alert("Statement uploaded successfully!");
            router.refresh();
            handleClose();
            router.push("/transaction");
        } catch (error: any) {
            setIsUploading(false);
            alert("An error occurred while uploading...");
        }
    };

    return (
        <>
        <button type="button" onClick={handleOpen} className="small-button"> + Upload Statement</button>
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ pb: 1, pt: 2, px: 3 }}>
                <div className="modal-header">
                    <h3 className="modal-title">Upload Bank Statement</h3>
                    <button onClick={handleClose} className="cursor-pointer">✕</button>
                </div>
            </DialogTitle>

            <DialogContent sx={{ px: 3, pb: 3 }}>
                <div>
                    <div className="file-input-wrapper">
                        <input id="statement-file-input" type="file" accept="application/pdf,.pdf" onChange={handleUpload} style={{ display: "none" }} required />
                        <label htmlFor="statement-file-input" className="cursor-pointer" style={{ textDecoration: "underline" }}> Select file </label>
                        {file && (<p><strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)</p>)}
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={handleClose} className="white-button">Cancel</button>
                        <button type="button" onClick={startUpload} disabled={isUploading} className="small-button"> Upload </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
}
