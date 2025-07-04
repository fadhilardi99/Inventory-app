import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET: /api/stock-out/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const stockOut = await prisma.stockOut.findUnique({
      where: { id: id },
      include: { item: true },
    });
    if (!stockOut) {
      return NextResponse.json(
        { error: "StockOut not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(stockOut);
  } catch (error) {
    console.error("Error fetching stock-out:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock-out" },
      { status: 500 }
    );
  }
}

// PUT: /api/stock-out/[id]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();
    const stockOut = await prisma.stockOut.update({
      where: { id },
      data,
    });
    return NextResponse.json(stockOut);
  } catch (error) {
    console.error("Error updating stock-out:", error);
    return NextResponse.json(
      { error: "Failed to update stock-out" },
      { status: 500 }
    );
  }
}

// DELETE: /api/stock-out/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.stockOut.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting stock-out:", error);
    return NextResponse.json(
      { error: "Failed to delete stock-out" },
      { status: 500 }
    );
  }
}
