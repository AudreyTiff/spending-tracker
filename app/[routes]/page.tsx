import HomePage from "../pages/page";
import AccountPage from "../pages/account";
import PageNotFound from "../pages/error";
import TransactionPage from "../pages/transaction";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Routes({ params }: { params: Promise<{ routes: string }> }) {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }
    const {routes} = await params;
    if (routes === "account") {
        return <AccountPage />
    } if (routes === "page") {
        return <HomePage />
    } if (routes === "transaction") {
        return <TransactionPage />
    }
    else {
        return<PageNotFound />
    }
}