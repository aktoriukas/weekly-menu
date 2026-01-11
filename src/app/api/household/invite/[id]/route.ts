import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE: Cancel invitation
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

    // Find user's household and verify they're the owner
    const membership = await prisma.householdMember.findFirst({
      where: { userId: session.user.id },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "No household found" },
        { status: 404 }
      );
    }

    if (membership.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only the owner can cancel invitations" },
        { status: 403 }
      );
    }

    // Find and verify the invite belongs to this household
    const invite = await prisma.householdInvite.findUnique({
      where: { id },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    if (invite.householdId !== membership.householdId) {
      return NextResponse.json(
        { error: "Invitation does not belong to your household" },
        { status: 403 }
      );
    }

    // Delete the invitation
    await prisma.householdInvite.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error canceling invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
