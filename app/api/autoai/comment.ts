"use server";
import { auth } from "@/auth";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

export interface Summary {
    category: string;
    spending: number;
    limit: number;
}
export async function generateComment(summary: Summary[]) {
    const session = await auth();
    const userId = session?.user?.id;
    const user = await prisma.user.findUnique({
        where: {id: userId},
        select: {comment: true, commentDate:true}
    });
    // return early if comment is less than 24hrs old
    const currentTime = new Date();
    if (user?.comment && user?.commentDate){ 
        if (currentTime.getTime() - user.commentDate.getTime() < (24*60*60*1000)){
            return user.comment;

        }
    }


    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const prompt = 
    `You are a supportive finance coach. Your goal is to make short, witty, and encouraging comment while highlighting just one notable/interesting spending trend 
    (e.g. overspending more than limit, great job maintaining in budget, etc.). Give user tips or fun facts on how they can save money!`;

    const spendingSummary = summary.map((record) => {
        const category = record.category;
        const spending = record.spending;
        const limit = record.limit;
        if (!limit) { return `no limit set for ${category}`}
        if (spending > limit) {
            return `overspend on ${category} by ${spending - limit}`;
        } else {
            return `doing great on ${category} by spending under budget by ${limit-spending}`;
        }
    }).join(",");
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: prompt },
            { role: "user", content: `Spending summary for the month: ${spendingSummary}` }
        ],
        max_tokens: 120,
        temperature: 0.8,
    });
    const finalComment = completion.choices[0].message.content?.trim() || "Need more transaction data";
    await prisma.user.update({
        where: {id: userId},
        data: {comment: finalComment, commentDate: new Date()}
    });
    return finalComment;
}