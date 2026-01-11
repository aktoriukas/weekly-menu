"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Crown, UserMinus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { HouseholdMember } from "@/hooks/use-household";

interface MemberListProps {
  members: HouseholdMember[];
  currentUserId: string;
  isOwner: boolean;
  onMemberRemoved: () => void;
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email.charAt(0).toUpperCase();
}

export function MemberList({
  members,
  currentUserId,
  isOwner,
  onMemberRemoved,
}: MemberListProps) {
  const [memberToRemove, setMemberToRemove] = useState<HouseholdMember | null>(
    null
  );
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    setIsRemoving(true);
    try {
      const response = await fetch(
        `/api/household/members/${memberToRemove.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove member");
      }

      toast.success(
        `${memberToRemove.user.name || memberToRemove.user.email} has been removed from the household`
      );
      onMemberRemoved();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove member"
      );
    } finally {
      setIsRemoving(false);
      setMemberToRemove(null);
    }
  };

  return (
    <>
      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={member.user.image || undefined}
                  alt={member.user.name || member.user.email}
                />
                <AvatarFallback>
                  {getInitials(member.user.name, member.user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {member.user.name || member.user.email}
                  </span>
                  {member.role === "OWNER" && (
                    <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full">
                      <Crown className="size-3" />
                      Owner
                    </span>
                  )}
                  {member.userId === currentUserId && (
                    <span className="text-xs text-muted-foreground">(You)</span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {member.user.email}
                </span>
              </div>
            </div>
            {isOwner &&
              member.role !== "OWNER" &&
              member.userId !== currentUserId && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setMemberToRemove(member)}
                >
                  <UserMinus className="size-4" />
                  <span className="sr-only">Remove member</span>
                </Button>
              )}
          </div>
        ))}
      </div>

      <Dialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <strong>
                {memberToRemove?.user.name || memberToRemove?.user.email}
              </strong>{" "}
              from your household? They will be assigned to a new household of
              their own.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMemberToRemove(null)}
              disabled={isRemoving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveMember}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
