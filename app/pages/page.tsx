"use client";

import { useState, useEffect } from "react";
import UploadStatementModal, { UploadSuccessData } from "@/app/modals/UploadStatement";
import SpendingPieChart, { TransactionItem } from "@/app/charts/SpendingPieChart";
import AddLimitModal from "@/app/modals/AddLimit";
import SpendingLimitChart from "@/app/charts/SpendingLimitChart";
import "./styles.css";
import NavBar from "./navbar";

const dummyUserId = "cm12abcde00001234fghij567";

const dummyTransactions: TransactionItem[] = [
  {
    id: "cm12abxyz00019876klmno123",
    amount: 145.50,
    merchant: "Woolworths",
    category: "Groceries",
    date: new Date("2026-09-10T14:30:00Z"),
    userId: dummyUserId,
  },
  {
    id: "cm12abxyz00029876klmno456",
    amount: 50.00,
    merchant: "Public Transport Victoria (Myki)",
    category: "Transport",
    date: new Date("2026-09-08T08:15:00Z"),
    userId: dummyUserId,
  },
  {
    id: "cm12abxyz00039876klmno789",
    amount: 110.00,
    merchant: "Energy Bay",
    category: "Utilities",
    date: new Date("2026-09-05T09:00:00Z"),
    userId: dummyUserId,
  },
  {
    id: "cm12abxyz00049876klmno321",
    amount: 34.99,
    merchant: "Cotton On",
    category: "Shopping",
    date: new Date("2026-09-02T12:45:00Z"),
    userId: dummyUserId,
  },
  {
    id: "cm12abxyz00059876klmno654",
    amount: 25.00,
    merchant: "Sky Music Store",
    category: "Entertainment",
    date: new Date("2026-08-28T16:20:00Z"),
    userId: dummyUserId,
  },
  {
    id: "cm12abxyz00069876klmno987",
    amount: 12.50,
    merchant: "Local Coffee Roasters",
    category: "Eating Out",
    date: new Date("2026-09-12T07:30:00Z"),
    userId: dummyUserId,
  }
];

export default function HomePage() {
  const [user] = useState("Test User");
  const [transactions, setTransactions] = useState<TransactionItem[]>(dummyTransactions);
  const [limits, setLimits] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("/api/statement/upload");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.transactions) && data.transactions.length > 0) {
            setTransactions(data.transactions);
          }
        }
      } catch (err) {
        console.error("Error loading transactions...", err);
      }
    };

    fetchTransactions();
  }, []);

  const handleUploadSuccess = (data: UploadSuccessData) => {
    if (data.transactions && data.transactions.length > 0) {
      setTransactions(data.transactions);
    }
  };

  const handleAddLimit = (category: string, amount: number) => {
    setLimits((prev) => ({ ...prev, [category]: amount }));
  };

  return (
    <div className="home">
      <NavBar />
      <div className="main-box">
        <h1 className="welcome-title">Welcome, {user}</h1>
      </div>

      <div className="main-box">

        <div className="content-header">Spending Breakdown
          <UploadStatementModal onUploadSuccess={handleUploadSuccess} />
        </div>
        <SpendingPieChart transactions={transactions} />
        <div className="limit-header">
          <div className="content-header">Spending Limit</div>
          <AddLimitModal onAddLimit={handleAddLimit}/>
        </div>

        <SpendingLimitChart transactions={transactions} limits={limits} />
      </div>
    </div>
  );
}