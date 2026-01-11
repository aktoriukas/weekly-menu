import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE: Decline/reject an invitation (by the invited user)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: inviteId } = await params;
    const userEmail = session.user.email.toLowerCase();

    // Find the invitation and verify it belongs to this user's email
    const invite = await prisma.householdInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Verify the invitation is for this user's email
    if (invite.email.toLowerCase() !== userEmail) {
      return NextResponse.json(
        { error: "You can only decline invitations sent to your email" },
        { status: 403 }
      );
    }

    // Delete the invitation
    await prisma.householdInvite.delete({
      where: { id: inviteId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error declining invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
