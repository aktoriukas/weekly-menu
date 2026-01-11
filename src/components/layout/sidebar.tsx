"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  LayoutDashboard,
  UtensilsCrossed,
  Calendar,
  ShoppingCart,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  ChevronLeft,
} from "lucide-react"

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dishes",
    label: "Dishes",
    icon: UtensilsCrossed,
  },
  {
    href: "/calendar",
    label: "Calendar",
    icon: Calendar,
  },
  {
    href: "/shopping",
    label: "Shopping",
    icon: ShoppingCart,
  },
  {
    href: "#",
    label: "AI Chat",
    icon: MessageSquare,
    comingSoon: true,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
]

function getInitials(
  name: string | null | undefined,
  email: string | null | undefined
): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  if (email) {
    return email.charAt(0).toUpperCase()
  }
  return "U"
}

function NavContent({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const isComingSoon = "comingSoon" in item && item.comingSoon

          if (isComingSoon) {
            return (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground/50 cursor-not-allowed relative",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? `${item.label} (Coming Soon)` : undefined}
              >
                <div className="relative">
                  <item.icon className="size-5 shrink-0" />
                  {collapsed && (
                    <span className="absolute -top-1 -right-1 size-2 bg-muted-foreground/30 rounded-full" />
                  )}
                </div>
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded whitespace-nowrap">
                      Soon
                    </span>
                  </>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="size-5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="size-4" />}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full h-auto py-2",
                collapsed ? "px-2 justify-center" : "px-3 justify-start gap-3"
              )}
            >
              <Avatar className="size-8 shrink-0">
                <AvatarImage
                  src={session?.user?.image || undefined}
                  alt={session?.user?.name || session?.user?.email || "User"}
                />
                <AvatarFallback>
                  {getInitials(session?.user?.name, session?.user?.email)}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-col items-start text-left overflow-hidden">
                  <span className="font-medium truncate w-full">
                    {session?.user?.name || "User"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate w-full">
                    {session?.user?.email}
                  </span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="size-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="size-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}

// Mobile sidebar (slide-out drawer)
export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>
            <Link
              href="/dashboard"
              className="flex items-center gap-2"
              onClick={() => setOpen(false)}
            >
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <UtensilsCrossed className="size-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">Menu Planner</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-[calc(100%-73px)]">
          <NavContent onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Desktop sidebar (collapsible)
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-full border-r bg-card transition-all duration-300",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2",
              collapsed && "justify-center w-full"
            )}
          >
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <UtensilsCrossed className="size-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="font-semibold text-lg">Menu Planner</span>
            )}
          </Link>
        </div>

        <NavContent collapsed={collapsed} />

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn("w-full", collapsed ? "px-2" : "justify-start")}
          >
            <ChevronLeft
              className={cn(
                "size-4 transition-transform",
                collapsed && "rotate-180"
              )}
            />
            {!collapsed && <span className="ml-2">Collapse</span>}
          </Button>
        </div>
      </aside>
    </>
  )
}

// Mobile header with hamburger menu
export function MobileHeader() {
  return (
    <header className="lg:hidden flex items-center justify-between p-4 border-b bg-card sticky top-0 z-10">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
          <UtensilsCrossed className="size-5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-lg">Menu Planner</span>
      </Link>
      <MobileSidebar />
    </header>
  )
}
