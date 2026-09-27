"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function getUserId() {
    const session = await auth();
    return session?.user?.id;
}

export async function saveSpendingLimit(category: string, amount: number) {
    const userId = await getUserId();
    if (!userId) {
        throw new Error("Please login first!");
    }

    return await prisma.spendingLimit.upsert({
        where: { userId_category: { userId, category } },
        update: { amount },
        create: { userId, category, amount }
    });
}

export async function getSpendingLimits(): Promise<Record<string, number>> {
    const userId = await getUserId();

    const limits = await prisma.spendingLimit.findMany({
        where: { userId }
    });

    return limits.reduce((acc, item) => {
        acc[item.category] = item.amount;
        return acc;
    }, {} as Record<string, number>);
}
