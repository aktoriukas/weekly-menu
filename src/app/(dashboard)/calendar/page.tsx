"use client";

import { useSearchParams } from "next/navigation";
import { CalendarView } from "@/components/calendar/calendar-view";

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");

  return <CalendarView initialDate={dateParam ?? undefined} />;
}
