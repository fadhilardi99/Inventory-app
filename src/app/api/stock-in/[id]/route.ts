import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET: /api/stock-in/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const stockIn = await prisma.stockIn.findUnique({
      where: { id: id },
      include: {
        item: true,
        // Include other relations as needed
      },
    });
    if (!stockIn) {
      return NextResponse.json(
        { error: "Stock in record not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(stockIn);
  } catch (error) {
    console.error("Error fetching stock in record:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock in record" },
      { status: 500 }
    );
  }
}

// PUT: /api/stock-in/[id]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();
    const stockIn = await prisma.stockIn.update({
      where: { id },
      data,
    });
    return NextResponse.json(stockIn);
  } catch (error) {
    console.error("Error updating stock in record:", error);
    return NextResponse.json(
      { error: "Failed to update stock in record" },
      { status: 500 }
    );
  }
}

// DELETE: /api/stock-in/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.stockIn.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting stock in record:", error);
    return NextResponse.json(
      { error: "Failed to delete stock in record" },
      { status: 500 }
    );
  }
}
