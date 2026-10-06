"use client";
import { useMemo } from "react";
import {PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer} from "recharts";

export interface TransactionItem {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  date: string | Date;
  userId?: string;
}

interface SpendingPieChartProps {
  transactions: TransactionItem[];
}

export const CATEGORY_COLORS: Record<string, string> = {
  "Accommodation": "#2563eb",
  "Eating Out": "#f97316",
  "Entertainment": "#ec4899",
  "Groceries": "#10b981",  
  "Medical": "#14b8a6",
  "Shopping": "#06b6d4",  
  "Transport": "#8b5cf6",
  "Utilities": "#f59e0b",
  "Others": "#71717a"
};

export const DEFAULT_CATEGORIES = Object.keys(CATEGORY_COLORS);

export default function SpendingPieChart({ transactions }: SpendingPieChartProps) {
  const chartData = useMemo(() => {
    const spent: Record<string, number> = {};

    DEFAULT_CATEGORIES.forEach(category => {
      spent[category] = 0;
    });

    transactions.forEach((record) => {
      const cat = DEFAULT_CATEGORIES.includes(record.category) ? record.category : "Others";
      spent[cat] += Number(record.amount);
    });

    const allCategories = [...DEFAULT_CATEGORIES];
    allCategories.sort((a, b) => {
      if (a === "Others") return 1;
      if (b === "Others") return -1;
      return a.localeCompare(b);
    });

    
    return allCategories.filter((category) => (spent[category])> 0).map((category) => ({
      category,
      amount: Number((spent[category]).toFixed(2))
    }));
  }, [transactions]);
    
  return (
    <div className="spending-chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{top: 10, right: 10, left: 10, bottom: 20}}>
          <Pie data={chartData} dataKey="amount" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={2}>
            {chartData.map((entry) => (
              <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category]}/>
            ))}
          </Pie>          
          <Tooltip formatter={(amount: any, label: any) => [`$${Number(amount).toFixed(2)}`, label]}/>
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
