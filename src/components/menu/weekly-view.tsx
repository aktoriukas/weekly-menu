"use client"

import { useState } from "react"
import { format, addWeeks, subWeeks, startOfWeek, isThisWeek } from "date-fns"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { DayCard } from "./day-card"
import { useWeekMenu, setMeal } from "@/hooks/use-menu"
import type { MealType } from "@/types"

export function WeeklyView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loadingSlots, setLoadingSlots] = useState<Set<string>>(new Set())

  const { days, isLoading, mutate, weekStart, weekEnd } = useWeekMenu({
    startDate: currentDate,
  })

  const handlePrevWeek = () => {
    setCurrentDate((d) => subWeeks(d, 1))
  }

  const handleNextWeek = () => {
    setCurrentDate((d) => addWeeks(d, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleSetMeal = async (
    dateStr: string,
    mealType: MealType,
    dishId: string
  ) => {
    const slotKey = `${dateStr}-${mealType}`
    setLoadingSlots((prev) => new Set(prev).add(slotKey))

    try {
      await setMeal(dateStr, mealType, dishId)
      await mutate()
      toast.success("Meal updated")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update meal"
      )
    } finally {
      setLoadingSlots((prev) => {
        const next = new Set(prev)
        next.delete(slotKey)
        return next
      })
    }
  }

  const handleClearMeal = async (dateStr: string, mealType: MealType) => {
    const slotKey = `${dateStr}-${mealType}`
    setLoadingSlots((prev) => new Set(prev).add(slotKey))

    try {
      await setMeal(dateStr, mealType, null)
      await mutate()
      toast.success("Meal cleared")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to clear meal"
      )
    } finally {
      setLoadingSlots((prev) => {
        const next = new Set(prev)
        next.delete(slotKey)
        return next
      })
    }
  }

  const handleSetCustomMeal = async (
    dateStr: string,
    mealType: MealType,
    customName: string
  ) => {
    const slotKey = `${dateStr}-${mealType}`
    setLoadingSlots((prev) => new Set(prev).add(slotKey))

    try {
      await setMeal(dateStr, mealType, null, customName)
      await mutate()
      toast.success("Meal added")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add meal"
      )
    } finally {
      setLoadingSlots((prev) => {
        const next = new Set(prev)
        next.delete(slotKey)
        return next
      })
    }
  }

  const isCurrentWeek = isThisWeek(currentDate, { weekStartsOn: 1 })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Weekly Menu</h1>
          <p className="text-muted-foreground">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevWeek}
            aria-label="Previous week"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant={isCurrentWeek ? "secondary" : "outline"}
            onClick={handleToday}
            className="gap-2"
          >
            <CalendarDays className="size-4" />
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextWeek}
            aria-label="Next week"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Week Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
          {days.map(({ date, dateStr, menuDay }) => (
            <DayCard
              key={dateStr}
              date={date}
              menuDay={menuDay}
              onSetMeal={(mealType, dishId) =>
                handleSetMeal(dateStr, mealType, dishId)
              }
              onSetCustomMeal={(mealType, customName) =>
                handleSetCustomMeal(dateStr, mealType, customName)
              }
              onClearMeal={(mealType) => handleClearMeal(dateStr, mealType)}
              isLoading={
                loadingSlots.has(`${dateStr}-BREAKFAST`) ||
                loadingSlots.has(`${dateStr}-LUNCH`) ||
                loadingSlots.has(`${dateStr}-DINNER`)
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
