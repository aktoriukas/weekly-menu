import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Get all shopping items for user's household
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's household
    const membership = await prisma.householdMember.findFirst({
      where: { userId: session.user.id },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "No household found" },
        { status: 404 }
      );
    }

    // Fetch shopping items sorted by: unchecked first, then by createdAt
    const items = await prisma.shoppingItem.findMany({
      where: {
        householdId: membership.householdId,
      },
      orderBy: [
        { checked: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching shopping items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create new shopping item
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's household
    const membership = await prisma.householdMember.findFirst({
      where: { userId: session.user.id },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "No household found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, quantity } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Create the shopping item
    const item = await prisma.shoppingItem.create({
      data: {
        name: name.trim(),
        quantity: quantity?.trim() || null,
        householdId: membership.householdId,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating shopping item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
