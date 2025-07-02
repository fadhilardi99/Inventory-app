import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: /api/stock-out/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const stockOut = await prisma.stockOut.findUnique({
      where: { id: params.id },
      include: { item: true },
    });
    if (!stockOut)
      return NextResponse.json(
        { error: "StockOut not found" },
        { status: 404 }
      );
    return NextResponse.json(stockOut);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch stock-out" },
      { status: 500 }
    );
  }
}

// PUT: /api/stock-out/[id]
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    const stockOut = await prisma.stockOut.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(stockOut);
  } catch {
    return NextResponse.json(
      { error: "Failed to update stock-out" },
      { status: 500 }
    );
  }
}

// DELETE: /api/stock-out/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.stockOut.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete stock-out" },
      { status: 500 }
    );
  }
}
