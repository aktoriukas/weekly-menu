"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PendingInvite {
  id: string;
  email: string;
  expiresAt: string;
  household: {
    id: string;
    name: string;
  };
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch pending invitations");
  }
  return res.json();
};

export function PendingInvites() {
  const {
    data: invites,
    error,
    isLoading,
    mutate,
  } = useSWR<PendingInvite[]>("/api/household/invite/pending", fetcher);

  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAccept = async (inviteId: string, householdName: string) => {
    setProcessingId(inviteId);
    try {
      const response = await fetch("/api/household/invite/accept", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to accept invitation");
      }

      toast.success(`You've joined ${householdName}!`);
      // Refresh the page to update household context
      window.location.reload();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to accept invitation"
      );
      setProcessingId(null);
    }
  };

  const handleDecline = async (inviteId: string) => {
    setProcessingId(inviteId);
    try {
      const response = await fetch(
        `/api/household/invite/pending/${inviteId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to decline invitation");
      }

      toast.success("Invitation declined");
      mutate();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to decline invitation"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Don't show anything while loading or if there are no invites
  if (isLoading || error || !invites || invites.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="size-5 text-primary" />
          <CardTitle>Pending Invitation</CardTitle>
        </div>
        <CardDescription>
          You have been invited to join another household
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-muted/50"
          >
            <div>
              <p className="font-medium">
                Join{" "}
                <span className="text-primary">{invite.household.name}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Accepting will move you from your current household
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDecline(invite.id)}
                disabled={processingId !== null}
              >
                {processingId === invite.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <X className="size-4" />
                    Decline
                  </>
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => handleAccept(invite.id, invite.household.name)}
                disabled={processingId !== null}
              >
                {processingId === invite.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <Check className="size-4" />
                    Accept
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
