import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: /api/stock-out
export async function GET() {
  try {
    const stockOuts = await prisma.stockOut.findMany({
      include: { item: true },
    });
    return NextResponse.json(stockOuts);
  } catch (err) {
    console.error("ERROR FETCH STOCK-OUT:", err);
    return NextResponse.json(
      { error: "Failed to fetch stock-out" },
      { status: 500 }
    );
  }
}

// POST: /api/stock-out
export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("StockOut POST data:", data);
    const stockOut = await prisma.stockOut.create({ data });
    return NextResponse.json(stockOut, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create stock-out",
      },
      { status: 500 }
    );
  }
}
