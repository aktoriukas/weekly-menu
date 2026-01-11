import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT: Update shopping item
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

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

    // Verify item belongs to user's household
    const existingItem = await prisma.shoppingItem.findFirst({
      where: {
        id,
        householdId: membership.householdId,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Shopping item not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, quantity, checked } = body;

    // Build update data
    const updateData: {
      name?: string;
      quantity?: string | null;
      checked?: boolean;
    } = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Name must be a non-empty string" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (quantity !== undefined) {
      updateData.quantity = quantity?.trim() || null;
    }

    if (checked !== undefined) {
      if (typeof checked !== "boolean") {
        return NextResponse.json(
          { error: "Checked must be a boolean" },
          { status: 400 }
        );
      }
      updateData.checked = checked;
    }

    // Update the item
    const item = await prisma.shoppingItem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating shopping item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete shopping item
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

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

    // Verify item belongs to user's household
    const existingItem = await prisma.shoppingItem.findFirst({
      where: {
        id,
        householdId: membership.householdId,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Shopping item not found" },
        { status: 404 }
      );
    }

    // Delete the item
    await prisma.shoppingItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shopping item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
