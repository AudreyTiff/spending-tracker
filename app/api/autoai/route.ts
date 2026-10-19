import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { extractText } from "unpdf";
import OpenAI from "openai";
import { revalidatePath } from "next/cache";
import { DEFAULT_CATEGORIES } from "@/app/charts/categories";

export type categories = (typeof DEFAULT_CATEGORIES)[number];

export interface ExtractedTransaction {
  date: string;
  merchant: string;
  category: categories;
  amount: number;
}

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log("api key undefined...");
  }
  return new OpenAI({ apiKey });
}

async function extractPdfText(fileBuffer: ArrayBuffer): Promise<string> {
  const result = await extractText(new Uint8Array(fileBuffer), {mergePages:true});
  return typeof result.text === "string" ? result.text : "";
}

async function parseStatementWithAI(statementText: string): Promise<ExtractedTransaction[]> {
  const openai = getClient();
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.id;
  const prompt = 
  `You are an strict, expert financial bank statement parser. Extract every single outgoing transactions from the provided bank statement text.
  You must extract every single outgoing transaction (and only outgoing) found in the document from start to finish. Do not summarise, sample, skip any valid transaction. 
  Only extract transactions that explicitly exist in the text (never invent or guess the transactons, merchants, amount, or dates that are not in the document).
  Include transfer to other account if there is a "to" and followed by a person name (this indicates transferring to friends or family).
  Rules to follow strictly:
  1. Extract expense transactions only. Ignore and exlude these type of transactions:
    - Incomes, salaries, interests, received payments and recieved transfers
    - Internal transfers between accounts (such as transfer from/to savings)
    - Account balances and summaries (opening balance, closing balance, total debits/credits, interest)
    - Pending transactions
  2. Clean merchant names. Remove unnecessary symbols, country initials/code, store codes, branch codes, card numbers, transaction IDs. Keep only the clean business/merchant name (e.g. "Uber", "Woolworths", "Steam", "Olive Young" ). If the merchant cannot be found, name the merchant based on a short summary of the transaction description/note.
  3. Assign every transaction to exactly one of these categories: ${DEFAULT_CATEGORIES.join(", ")}. Some of clues to categorise:
    - Accommodation: Hotels, Airbnb, rent
    - Eating Out: Restaurants, cafes, fast food, food delivery services
    - Entertainment: Movies, gaming, streaming, concerts, platform subscriptions
    - Groceries: Supermarkets, markets, bakeries, convenient stores
    - Medical: Pharmacy, doctors, health services, hospital bills
    - Shopping: Retail, clothing, electronics, department stores, makeup, skincare, online stores
    - Transport: Petrol, rideshare, public transport, parking, tolls
    - Utilities: Phone, internet, electricity, recurring bills
    - Others: only if unsure or none fits
  4. Format all dates strictly as "YYYY-MM-DD". If the statement only mentions month/day, infer the year from the statement period or header context or from the file name.
  5. Extract the expense amount as a positive floating point number (e.g. 24.50). Do not include any currency symbol or equation sign, just the number. 

  Return only JSON object with this schema:
  {
    "transactions": [
      {
        "date": "YYYY-MM-DD",
        "merchant": "Merchant Name",
        "category": "Groceries",
        "amount": 25.50
      }
    ]
  }
  If no expense transactions are found, return {"transactions": []}.`;

  const sliced = statementText.length > 80000 ? statementText.slice(0, 80000) : statementText;
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {role: "system", content: prompt},
      {role: "user", content: `Bank Statement:\n${sliced}`}
    ],
    temperature: 0.1
  });
  // Check AI response
  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Error no response!!");
  }
  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed.transactions)) {
    throw new Error("Error invalid format!!");
  }
  const isItValid = parsed.transactions.map((item: any) => {
      const date = new Date(item.date);
      const validDate = !isNaN(date.getTime()) ? date : new Date();
      const category = DEFAULT_CATEGORIES.includes(item.category as any) ? item.category : "Others";
      const merchant = typeof item.merchant === "string" && item.merchant.trim().length > 0 ? item.merchant.trim() : "Unknown Merchant";
      const amount = typeof item.amount === "number" ? item.amount : parseFloat(String(item.amount));
      if (isNaN(amount) || amount <= 0) return null;
      return {
        amount: Math.round(amount * 100) / 100,
        merchant,
        category,
        date: validDate,
        userId: userId
      };
    }).filter((item: any) => item !== null);
  await prisma.transaction.createMany({data: isItValid});
  return isItValid;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fileBuffer = await file.arrayBuffer();
    const statementText = await extractPdfText(fileBuffer);
    if (!statementText || statementText.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Error extracting! Please ensure it is not a password-protected document."
        },
        { status: 422 }
      );
    }

    const rawTransactions = await parseStatementWithAI(statementText);
    if (!rawTransactions || rawTransactions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Error converting to readable format! No expense transactions could be identified"
        },
        { status: 422 }
      );
    }
    
    // Auto refresh the page when transaction is uploaded
    revalidatePath("/transaction");
    revalidatePath("/page");
    // stops the uploading/loading
    return NextResponse.json({success: true, count: rawTransactions.length, message: `Total ${rawTransactions.length} transactions`
     });
  } catch (error: any) {
    console.error("upload error", error);
    return NextResponse.json(
      {success: false, error: error.message || "Failed to upload statement..."},
      { status: 500 }
    );
  }
}
