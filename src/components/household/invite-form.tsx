"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, X, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import type { HouseholdInvite } from "@/hooks/use-household";

interface InviteFormProps {
  invites: HouseholdInvite[];
  onInviteCreated: () => void;
  onInviteCanceled: () => void;
}

function formatExpiryDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Expired";
  if (diffDays === 1) return "Expires in 1 day";
  return `Expires in ${diffDays} days`;
}

export function InviteForm({
  invites,
  onInviteCreated,
  onInviteCanceled,
}: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteToCancel, setInviteToCancel] = useState<HouseholdInvite | null>(
    null
  );
  const [isCanceling, setIsCanceling] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/household/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invitation");
      }

      toast.success(`Invitation sent to ${email}`);
      setEmail("");
      onInviteCreated();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send invitation"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelInvite = async () => {
    if (!inviteToCancel) return;

    setIsCanceling(true);
    try {
      const response = await fetch(
        `/api/household/invite/${inviteToCancel.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel invitation");
      }

      toast.success(`Invitation to ${inviteToCancel.email} has been canceled`);
      onInviteCanceled();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel invitation"
      );
    } finally {
      setIsCanceling(false);
      setInviteToCancel(null);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="invite-email">Invite by email</Label>
          <div className="flex gap-2">
            <Input
              id="invite-email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
            <Button type="submit" disabled={isSubmitting || !email.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="size-4" />
                  Invite
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {invites.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Pending Invitations
          </h4>
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex flex-col">
                <span className="font-medium">{invite.email}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatExpiryDate(invite.expiresAt)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setInviteToCancel(invite)}
              >
                <X className="size-4" />
                <span className="sr-only">Cancel invitation</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={!!inviteToCancel}
        onOpenChange={(open) => !open && setInviteToCancel(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Invitation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel the invitation to{" "}
              <strong>{inviteToCancel?.email}</strong>? They will no longer be
              able to join your household using this invitation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInviteToCancel(null)}
              disabled={isCanceling}
            >
              Keep Invitation
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelInvite}
              disabled={isCanceling}
            >
              {isCanceling ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Canceling...
                </>
              ) : (
                "Cancel Invitation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
