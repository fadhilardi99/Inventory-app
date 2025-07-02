import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: /api/items
export async function GET() {
  try {
    const items = await prisma.item.findMany({
      include: { category: true, stockIns: true, stockOuts: true },
    });
    return NextResponse.json(items);
  } catch (err) {
    console.error("ERROR FETCH ITEMS:", err);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

// POST: /api/items
export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("DATA DITERIMA CREATE ITEM:", data);

    // Create item first
    const item = await prisma.item.create({ data });

    // If item has initial stock, create stock-in transaction
    if (data.stock && data.stock > 0) {
      await prisma.stockIn.create({
        data: {
          itemId: item.id,
          quantity: data.stock,
          supplier: "Initial Stock",
          notes: "Stok awal saat penambahan barang",
          date: new Date(),
        },
      });
      console.log(
        `Stock In created for item ${item.name} with quantity ${data.stock}`
      );
    }

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("ERROR CREATE ITEM:", err);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
