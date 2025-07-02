import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: /api/categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { items: true },
    });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST: /api/categories
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const category = await prisma.category.create({ data });
    return NextResponse.json(category, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
