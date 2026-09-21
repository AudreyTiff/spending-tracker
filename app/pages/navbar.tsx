"use client";

import { useEffect, useState } from "react";

export default function NavBar() {
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/auth/session")
            .then((res) => res.json())
            .then((session) => {
                if (session?.user?.name) {
                    setUsername(session.user.name);
                }
            })
            .catch((err) => console.error("Error loading session...", err));
    }, []);

    return (
        <div className="nav-box">
            <div className="welcome-title">Welcome, { username || "User" }</div>
            <nav className="navbar">
                <a href="/account">Accounts</a>
                <a href="/page">Home</a>
                <a href="/transaction">Transactions</a>
                <a href="/settings">Settings</a>
            </nav>
        </div>
    );
}
