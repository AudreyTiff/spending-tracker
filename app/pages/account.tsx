import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "./sidebar";
import DeleteAccountModal from "@/app/modals/DeleteAccountModal";
import "@/app/pages/styles.css";

export async function handleSignOut() {
    "use server";
    try {
        await signOut({ redirectTo: "/login" });
    } catch {
        throw new Error("Failed signing out account...");
    }
}

export async function deleteAccount(): Promise<void> {
    "use server";
    try {
        const session = await auth();
        let userId = session?.user?.id;
        if (!userId && session?.user?.email) {
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true },
            });
            userId = user?.id;
        }
        await signOut({ redirect: false });
        //delete all user related data
        await prisma.$transaction(async (trans) => {
            await trans.transaction.deleteMany({ where: { userId } });
            await trans.spendingLimit.deleteMany({ where: { userId } });
            await trans.saving.deleteMany({ where: { userId } });
            await trans.account.deleteMany({ where: { userId } });
            await trans.session.deleteMany({ where: { userId } });
            await trans.user.delete({ where: { id: userId } });
        });
        return;
    } catch {
        throw new Error("Failed signing out account...");
    }
}

export default async function AccountPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }
    const user = session.user;

    return (
        <div className="dashboard-layout">
            <Sidebar activePage="account" />
            <main className="dashboard-main">
                <div className="dashboard-header">
                    <h1 className="dashboard-title">Account Settings</h1>
                </div>
                <div className="main-box" style={{ maxWidth: "600px" }}>
                    <p><strong>Name:</strong>{user.name}</p>
                    <p><strong>Email:</strong>{user.email}</p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                        <form action={handleSignOut}>
                            <button type="submit" className="small-button">Sign Out</button>
                        </form>
                        <DeleteAccountModal onDeleteAccount={deleteAccount} />
                    </div>
                </div>
            </main>
        </div>
    );
}