import { prisma } from "@/lib/prisma";
import Sidebar from "./Sidebar";
import "@/app/pages/styles.css";
import { auth } from "@/auth";
import AddTransactionModal from "@/app/modals/AddTransaction";
import UploadStatementModal from "@/app/modals/UploadStatement";
import DeleteConfirmationModal from "@/app/modals/DeleteConfirmation";
import { addTransaction, deleteTransaction } from "./transactions";

export default async function TransactionPage() {
    const session = await auth();
    const transactions = await prisma.transaction.findMany({
        where: { userId: session?.user?.id },
        orderBy: { date: "desc" }
    });

    const groupedTransactions = transactions.reduce((groups, t) => {
        const monthYear = new Date(t.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
        if (!groups[monthYear]) {
            groups[monthYear] = [];
        }
        groups[monthYear].push(t);
        return groups;
    }, {} as Record<string, typeof transactions>);

    const hasTransactions = transactions.length > 0;

    return (
        <div className="dashboard-layout">
            <Sidebar activePage="transaction" />
            <main className="dashboard-main">
                <div className="dashboard-header">
                    <div> <h1 className="dashboard-title">Transactions</h1>
                    </div>
                    <div className="header-actions">
                        <UploadStatementModal />
                        <AddTransactionModal onAddTransaction={addTransaction} />
                    </div>
                </div>

                <div className="main-box">
                    {!hasTransactions ? (
                        <div className="chart-empty-state">
                            <p>No transactions so far (´・ω・｀)</p>
                        </div>
                    ) : (
                        Object.entries(groupedTransactions).map(([monthYear, monthTransactions]) => (
                            <div key={monthYear} className="transaction-group">
                                <div className="month-header">{monthYear}</div>
                                <div className="table-responsive">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Merchant</th>
                                                <th>Category</th>
                                                <th>Amount</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {monthTransactions.map((t) => (
                                                <tr key={t.id}>
                                                    <td>{new Date(t.date).toLocaleDateString()}</td>
                                                    <td className="bold-cell">{t.merchant}</td>
                                                    <td><span className="category-pill">{t.category}</span></td>
                                                    <td className="bold-cell">${t.amount.toFixed(2)}</td>
                                                    <td><DeleteConfirmationModal transactionId={t.id} onDelete={deleteTransaction} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
