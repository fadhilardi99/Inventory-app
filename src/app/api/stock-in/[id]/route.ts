import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: /api/stock-in/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const stockIn = await prisma.stockIn.findUnique({
      where: { id: params.id },
      include: { item: true },
    });
    if (!stockIn)
      return NextResponse.json({ error: "StockIn not found" }, { status: 404 });
    return NextResponse.json(stockIn);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch stock-in" },
      { status: 500 }
    );
  }
}

// PUT: /api/stock-in/[id]
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    const stockIn = await prisma.stockIn.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(stockIn);
  } catch {
    return NextResponse.json(
      { error: "Failed to update stock-in" },
      { status: 500 }
    );
  }
}

// DELETE: /api/stock-in/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.stockIn.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete stock-in" },
      { status: 500 }
    );
  }
}
