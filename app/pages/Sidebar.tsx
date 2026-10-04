"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SidebarProps {
  activePage?: "dashboard"| "transaction"|"account";
}

export default function Sidebar({ activePage = "dashboard" }: SidebarProps) {
  const [userName, setUserName] = useState<string>("User");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session").then((res) => res.json()).then((session) => {
      if (session?.user?.name) {
        setUserName(session.user.name);
      }
    }).catch((err) => console.error("Error loading session...", err));

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  //Theme switcher
  const toggleDarkMode = () => {
    const theme = !isDarkMode;
    setIsDarkMode(theme);
    if (theme) {
      //add "dark" to root tag html to apply css dark mode 
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <aside className="sidebar-container">
      <div className="sidebar-brand-text">
        <span className="brand-title">Spending Tracker</span>
      </div>
      <nav className="sidebar-nav">
        <Link href="/page" className={`sidebar-nav-item ${activePage === "dashboard" ? "active" : ""}`}> Dashboard </Link>
        <Link href="/transaction" className={`sidebar-nav-item ${activePage === "transaction" ? "active" : ""}`}> Transactions </Link>
        <Link href="/account" className={`sidebar-nav-item ${activePage === "account" ? "active" : ""}`}> Accounts </Link>
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user-details">{userName}</div>
        <div className="sidebar-theme-toggle">
          <span className="theme-toggle-label">Dark Mode</span>
          <button type="button" className={`toggle-switch ${isDarkMode ? "active" : ""}`} onClick={toggleDarkMode} aria-label="Toggle dark mode">
          <div className="toggle-slider" />
          </button>
        </div>
      </div>
    </aside>
  );
}
