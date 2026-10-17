"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Sidebar from "./sidebar";
import SpendingPieChart, { TransactionItem } from "@/app/charts/SpendingPieChart";
import SpendingLimitChart from "@/app/charts/SpendingLimitChart";
import AddLimitModal from "@/app/modals/AddLimit";
import AddSavingsModal from "@/app/modals/AddSavingsModal";
import { getSpendingLimits, saveSpendingLimit } from "./limits";
import { getSavings, saveSavings } from "./savings";
import { getUserTransactions } from "./transactions";
import { Summary,generateComment } from "../api/autoai/comment";
import { DEFAULT_CATEGORIES } from "@/app/charts/categories";
import "./styles.css";

export default function HomePage() {
  const [userName, setUserName] = useState<string>("User");
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [limits, setLimits] = useState<Record<string, number>>({});
  const [savings, setSavings] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [comments, setComments] = useState<string>("");

  useEffect(() => {
    fetch("/api/auth/session").then((res) => res.json()).then((session) => {
      if (session?.user?.name) { setUserName(session.user.name); }
    });

    const loadDashboardData = async () => {
      const [trans, savedLimits, savedSavings] = await Promise.all([
        getUserTransactions(),
        getSpendingLimits(),
        getSavings()
      ]);
      if (trans) { setTransactions(trans as TransactionItem[]) };
      if (savedLimits) { setLimits(savedLimits) };
      if (typeof savedSavings === "number") { setSavings(savedSavings) };
      setLoading(false);
    };
    loadDashboardData();
  }, []);

  const handleAddLimit = async (category: string, amount: number) => {
    setLimits((prev) => ({ ...prev, [category]: amount }));
    try {
      await saveSpendingLimit(category, amount);
    } catch {
      alert("Failed to save spending limit...");
      const savedLimits = await getSpendingLimits();
      setLimits(savedLimits);
    }
  };

  const handleSaveSavings = async (saving: number) => {
    try {
      const updated = await saveSavings(saving);
      setSavings(updated);
    } catch {
      alert("Failed to save savings...");
    }
  };
  const currentMonthTransactions = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions.filter((tx) => {
      const d = new Date(tx.date);
      return (
        !isNaN(d.getTime()) &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    });
  }, [transactions]);

  const totalThisMonthSpending = useMemo(() => {
    return currentMonthTransactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  }, [currentMonthTransactions]);

  const sneakPeekTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [currentMonthTransactions, transactions]);

  useEffect(()=> {
      if (transactions.length>0) {
        const loadComments = async () =>{
          const catAndSpent: Record<string, number> = {};  
          DEFAULT_CATEGORIES.forEach(category => {
            catAndSpent[category] = 0;
          });
        
          currentMonthTransactions.forEach((record) => {
            const cat = DEFAULT_CATEGORIES.includes(record.category) ? record.category : "Others";
            catAndSpent[cat]+= Number(record.amount);
          }); 
          const summaries: Summary[] = DEFAULT_CATEGORIES.map((cat)=> ({category: cat, spending: catAndSpent[cat] || 0, limit: limits[cat] || 0}))
          const aiComment = await generateComment(summaries);
          setComments(aiComment);
        };
      loadComments();
      }
  }, [currentMonthTransactions, limits]);

  return (
    <div className="dashboard-layout">
      <Sidebar activePage="dashboard" />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Welcome back, {userName}!</h1>
            <p className="dashboard-subtitle"> Below is your monthly spending summary!</p>
          </div>
        </header>

        {/* small top cards */}
        <section className="mini-cards-grid">
          <div className="mini-card">
            <div className="mini-card-header">
              <span className="mini-card-title">This Month's Transactions</span>
            </div>
            <div className="mini-card-value">{currentMonthTransactions.length} </div>
          </div>
          <div className="mini-card">
            <div className="mini-card-header">
              <span className="mini-card-title">Total Spending</span>
            </div>
            <div className="mini-card-value"> ${totalThisMonthSpending.toLocaleString()} </div>
          </div>
          <div className="mini-card">
            <div className="mini-card-header">
              <span className="mini-card-title">Savings</span>
              <AddSavingsModal currentSavings={savings} onSaveSavings={handleSaveSavings} />
            </div>
            <div className="mini-card-value"> ${savings.toLocaleString()} </div>
          </div>
        </section>

        {/* charts */}
        <section className="charts-grid">
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">Spending Limits</h2>
              <AddLimitModal onAddLimit={handleAddLimit} />
            </div>
            <div className="dashboard-card-body">
              {currentMonthTransactions.length === 0 && Object.keys(limits).length === 0 ?
                (<div className="chart-empty-state">No limit or spending data yet for this month. </div>)
                : (<SpendingLimitChart transactions={currentMonthTransactions} limits={limits} />)}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">Spending Breakdown</h2>
            </div>
            <div className="dashboard-card-body">
              {currentMonthTransactions.length === 0 ?
                (<div className="chart-empty-state"> No spending data to display yet </div>)
                : (<SpendingPieChart transactions={currentMonthTransactions} />)}
            </div>
          </div>
        </section>

        {/* ai comment section */}
        <section className="bottom-grid">
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div>
                <h2 className="dashboard-card-title"> AI Comment</h2>
              </div>
            </div>
            <div className="dashboard-card-body">
              <div className="dashboard-subtitle">{comments}</div>
            </div>
          </div>

          {/* transaction table sneak peek */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div>
                <h2 className="dashboard-card-title">All-Time Transactions</h2>
              </div>
              <Link href="/transaction" className="link-action">View all &rarr;</Link>
            </div>
            <div className="dashboard-card-body">
              {sneakPeekTransactions.length === 0 ? (
                <div className="chart-empty-state"><p>No transactions recorded yet.</p></div>
              ) : ( <div className="sneakpeek-table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Merchant</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sneakPeekTransactions.map((tx) => (
                        <tr key={tx.id} >
                          <td>
                            <div className="bold-cell">
                              <span>{tx.merchant}</span>
                            </div>
                          </td>
                          <td>
                            <span>{tx.category}</span>
                          </td>
                          <td className="bold-cell">
                            ${Number(tx.amount || 0).toFixed(2)}
                          </td>
                          <td>
                            <span className="mini-card-subtext">
                              {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}