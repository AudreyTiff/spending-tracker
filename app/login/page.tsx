import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";
import "@/app/pages/styles.css";

export default async function LoginPage() {
    const session = await auth();
    if (session?.user) {
        redirect("/page");
    }

    return (
        <div className="login">
            <div className="main-box" style={{ maxWidth: "400px", width: "100%", textAlign: "center"}}>
                <div>
                    <h1 className="dashboard-title">Welcome (☞ﾟヮﾟ)☞ ♡</h1>
                    <p className="dashboard-subtitle">Track your expenses (*^▽^*)</p>
                </div>

                <form action={async () => {"use server";
                    await signIn("google", { redirectTo: "/page" }, { prompt: "select_account" });}}>
                    <button type="submit" className="login-submit">
                        <img src="/assets/google-logo.png" width={24} height={24} alt="Google" /> Sign in with Google
                    </button>
                </form>
            </div>
        </div>
    );
}
