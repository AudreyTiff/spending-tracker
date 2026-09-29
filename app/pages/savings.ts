"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function getUserId() {
    const session = await auth();
    return session?.user?.id;
}

export async function getSavings(): Promise<number> {
    const userId = await getUserId();
    if (!userId) return 0;

    const record = await prisma.saving.findUnique({
        where: { userId }
    });

    return record?.amount ?? 0;
}

export async function saveSavings(amount: number): Promise<number> {
    const userId = await getUserId();
    if (!userId) {
        throw new Error("Please login first!");
    }

    const updated = await prisma.saving.upsert({
        where: { userId },
        update: { amount },
        create: { userId, amount }
    });

    return updated.amount;
}
