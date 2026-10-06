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
    const spent: Record<string, number> = {};

    DEFAULT_CATEGORIES.forEach(category => {
      spent[category] = 0;
    });
    
    transactions.forEach((record) => {
      const cat = DEFAULT_CATEGORIES.includes(record.category) ? record.category : "Others";
      spent[cat]+= Number(record.amount);
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
      spending: Number(spent[category].toFixed(2)),
      // guard for unset limits
      limit: Number((limits[category] || 0).toFixed(2))
    }));
  }, [transactions, limits]); //caching, only updates when transactions or limits change

  return (
    <div className="spending-chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{top: 10, right: 10, left: 10, bottom: 10}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8dfd6" />
          <XAxis dataKey="category" tick={{fontSize: 12, fill: "#736055"}} interval={0} angle={-40} textAnchor="end" height={60}/>
          <YAxis tick={{fontSize: 12, fill: "#736055"}} tickFormatter={(val) => `$${val}`}/> {/* format dollar sign for all y values*/}
          {/* hover pop-up card on bars, values automatically passed */}
          <Tooltip formatter={(amount: any, label: any) => [`$${Number(amount).toFixed(2)}`,label]}/> 
          <Legend verticalAlign="bottom" height={36}/>
          <Bar dataKey="spending" fill="#9c6644"/>
          <Bar dataKey="limit" fill="#588157"/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
