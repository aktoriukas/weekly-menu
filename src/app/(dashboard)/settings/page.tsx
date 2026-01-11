"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MemberList } from "@/components/household/member-list";
import { InviteForm } from "@/components/household/invite-form";
import { PendingInvites } from "@/components/household/pending-invites";
import { useHousehold } from "@/hooks/use-household";
import { Loader2, Save, Home, Users, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { household, members, invites, isLoading, error, mutate } =
    useHousehold();

  const [householdName, setHouseholdName] = useState("");
  const [isNameEdited, setIsNameEdited] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);

  // Update local state when household data loads
  const currentName = householdName || household?.name || "";

  // Check if current user is the owner
  const isOwner = members.some(
    (m) => m.userId === session?.user?.id && m.role === "OWNER"
  );

  const handleNameChange = (value: string) => {
    setHouseholdName(value);
    setIsNameEdited(value !== household?.name);
  };

  const handleSaveName = async () => {
    if (!householdName.trim() || householdName === household?.name) return;

    setIsSavingName(true);
    try {
      const response = await fetch("/api/household", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: householdName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update household name");
      }

      toast.success("Household name updated");
      setIsNameEdited(false);
      mutate();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update household name"
      );
    } finally {
      setIsSavingName(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !household) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load household data</p>
          <Button onClick={() => mutate()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your household and preferences
        </p>
      </div>

      <PendingInvites />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Home className="size-5" />
            <CardTitle>Household</CardTitle>
          </div>
          <CardDescription>
            {isOwner
              ? "Manage your household name and settings"
              : "View your household information"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="household-name">Household Name</Label>
            <div className="flex gap-2">
              <Input
                id="household-name"
                value={currentName}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={!isOwner || isSavingName}
                placeholder="Enter household name"
              />
              {isOwner && (
                <Button
                  onClick={handleSaveName}
                  disabled={!isNameEdited || isSavingName}
                >
                  {isSavingName ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      Save
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="size-5" />
            <CardTitle>Members</CardTitle>
          </div>
          <CardDescription>
            {members.length} member{members.length !== 1 ? "s" : ""} in your
            household
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MemberList
            members={members}
            currentUserId={session?.user?.id || ""}
            isOwner={isOwner}
            onMemberRemoved={() => mutate()}
          />
        </CardContent>
      </Card>

      {isOwner && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="size-5" />
              <CardTitle>Invite Members</CardTitle>
            </div>
            <CardDescription>
              Invite people to join your household by email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InviteForm
              invites={invites}
              onInviteCreated={() => mutate()}
              onInviteCanceled={() => mutate()}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
