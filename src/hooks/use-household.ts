"use client";

import useSWR from "swr";

export interface HouseholdMember {
  id: string;
  userId: string;
  role: "OWNER" | "MEMBER";
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface HouseholdInvite {
  id: string;
  email: string;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
}

export interface Household {
  id: string;
  name: string;
  createdAt: string;
  members: HouseholdMember[];
  invites: HouseholdInvite[];
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("Failed to fetch household");
    throw error;
  }
  return res.json();
};

export function useHousehold() {
  const { data, error, isLoading, mutate } = useSWR<Household>(
    "/api/household",
    fetcher
  );

  const currentUserId = data?.members.find((m) => m.role === "OWNER")?.userId;
  const isOwner = data?.members.some(
    (m) => m.role === "OWNER" && m.userId === currentUserId
  );

  return {
    household: data,
    members: data?.members ?? [],
    invites: data?.invites ?? [],
    isLoading,
    error,
    isOwner,
    mutate,
  };
}

export function useIsHouseholdOwner(userId: string | undefined) {
  const { household } = useHousehold();

  if (!userId || !household) return false;

  return household.members.some(
    (m) => m.userId === userId && m.role === "OWNER"
  );
}
