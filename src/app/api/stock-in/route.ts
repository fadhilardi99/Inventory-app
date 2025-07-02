import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: /api/stock-in
export async function GET() {
  try {
    console.log("Fetching stock-in transactions...");
    const stockIns = await prisma.stockIn.findMany({
      include: { item: true },
      orderBy: { createdAt: "desc" },
    });
    console.log(`Found ${stockIns.length} stock-in transactions`);
    return NextResponse.json(stockIns);
  } catch (error) {
    console.error("Error fetching stock-in transactions:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch stock-in transactions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST: /api/stock-in
export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("DATA DITERIMA STOCK-IN:", data);

    // Validate required fields
    if (!data.itemId || !data.quantity || data.quantity <= 0) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: itemId and quantity must be provided and quantity must be greater than 0",
        },
        { status: 400 }
      );
    }

    // Create the stock-in transaction
    const stockIn = await prisma.stockIn.create({
      data: {
        itemId: data.itemId,
        quantity: data.quantity,
        supplier: data.supplier || null,
        notes: data.notes || null,
        date: data.date ? new Date(data.date) : new Date(),
      },
      include: { item: true },
    });

    // Update the item's stock
    await prisma.item.update({
      where: { id: data.itemId },
      data: { stock: { increment: data.quantity } },
    });

    console.log("Stock-in created successfully:", stockIn);
    return NextResponse.json(stockIn, { status: 201 });
  } catch (error) {
    console.error("ERROR CREATE STOCK-IN:", error);

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Record to create does not exist")) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json({ error: "Duplicate entry" }, { status: 409 });
      }
    }

    return NextResponse.json(
      {
        error: "Failed to create stock-in",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
