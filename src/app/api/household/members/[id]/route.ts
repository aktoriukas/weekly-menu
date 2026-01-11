import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type TransactionClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

// DELETE: Remove member from household (only owner can do this)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: memberIdToRemove } = await params;

    // Find user's household and verify they're the owner
    const ownerMembership = await prisma.householdMember.findFirst({
      where: { userId: session.user.id },
    });

    if (!ownerMembership) {
      return NextResponse.json(
        { error: "No household found" },
        { status: 404 }
      );
    }

    if (ownerMembership.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only the owner can remove members" },
        { status: 403 }
      );
    }

    // Find the member to remove
    const memberToRemove = await prisma.householdMember.findUnique({
      where: { id: memberIdToRemove },
    });

    if (!memberToRemove) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // Verify the member belongs to the same household
    if (memberToRemove.householdId !== ownerMembership.householdId) {
      return NextResponse.json(
        { error: "Member does not belong to your household" },
        { status: 403 }
      );
    }

    // Cannot remove the owner (themselves)
    if (memberToRemove.role === "OWNER") {
      return NextResponse.json(
        { error: "Cannot remove the household owner" },
        { status: 400 }
      );
    }

    // Create a new household for the removed user
    await prisma.$transaction(async (tx: TransactionClient) => {
      // Remove from current household
      await tx.householdMember.delete({
        where: { id: memberIdToRemove },
      });

      // Create a new household for the removed user
      const removedUser = await tx.user.findUnique({
        where: { id: memberToRemove.userId },
      });

      if (removedUser) {
        const householdName = removedUser.name
          ? `${removedUser.name}'s Household`
          : "My Household";

        await tx.household.create({
          data: {
            name: householdName,
            members: {
              create: {
                userId: removedUser.id,
                role: "OWNER",
              },
            },
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
