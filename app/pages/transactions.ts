"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function addTransaction(amount: number, merchant: string, category: string, date: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    await prisma.transaction.create({
        data: {
            amount,
            merchant,
            category,
            date: new Date(date),
            userId: session.user.id
        }
    });

    revalidatePath("/transaction");
    revalidatePath("/page");
}

export async function deleteTransaction(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    await prisma.transaction.delete({ where: { id } });
    revalidatePath("/transaction");
    revalidatePath("/page");
}

export async function getUserTransactions() {
    const session = await auth();
    if (!session?.user?.id) return [];
    const transactions = await prisma.transaction.findMany({
        where: { userId: session.user.id },
        orderBy: { date: "desc" }
    });
    return transactions.map((t) => ({
        id: t.id,
        merchant: t.merchant,
        category: t.category,
        amount: t.amount,
        date: t.date.toISOString(),
        userId: t.userId
    }));
}
