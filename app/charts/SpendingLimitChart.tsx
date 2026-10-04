"use client";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DEFAULT_CATEGORIES } from "./SpendingPieChart";

export interface TransactionItem {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  date: string | Date;
  userId?: string;
}

interface SpendingLimitChartProps {
  transactions: TransactionItem[];
  limits?: Record<string, number>;
}

export default function SpendingLimitChart({transactions, limits = {}}: SpendingLimitChartProps) {
  const chartData = useMemo(() => {
    const categorySpent: Record<string, number> = {};

    transactions.forEach((tx) => {
      const cat = DEFAULT_CATEGORIES.includes(tx.category) ? tx.category : "Others";
      categorySpent[cat] = (categorySpent[cat] || 0) + Number(tx.amount);
    });

    const allCategories = [...DEFAULT_CATEGORIES];

    // force category Others to be at the bottom of the list
    allCategories.sort((a, b) => {
      if (a === "Others") return 1;
      if (b === "Others") return -1;
      return a.localeCompare(b);
    });

    return allCategories.map((category) => ({
      category,
      Spent: Number((categorySpent[category] || 0).toFixed(2)),
      Limit: Number((limits[category] || 0).toFixed(2))
    }));
  }, [transactions, limits]);

  return (
    <div className="spending-chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{top: 20, right: 20, left: 10, bottom: 40}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8dfd6" />
          <XAxis dataKey="category" tick={{fontSize: 12, fill: "#736055"}} interval={0} angle={-40} textAnchor="end"/>
          <YAxis tick={{fontSize: 12, fill: "#736055"}} tickFormatter={(val) => `$${val}`}/> {/* format dollar sign for all y values*/}
          {/* hover pop-up card on bars, values automatically passed */}
          <Tooltip formatter={(amount: any, name: any) => [`$${Number(amount).toFixed(2)}`,name]}/> 
          <Legend verticalAlign="top" height={36}/>
          <Bar dataKey="Spent" fill="#9c6644"/>
          <Bar dataKey="Limit" fill="#588157"/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
