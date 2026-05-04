"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { BookOpen, List, Dumbbell, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const navItems = [
  { href: "/words", label: "Words", icon: BookOpen },
  { href: "/practice", label: "Practice", icon: Dumbbell },
  { href: "/lists", label: "Lists", icon: List },
];

export function Header() {
  const { user } = db.useAuth();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await db.auth.signOut();
    toast.success("Signed out");
  };

  return (
    <>
      {/* Desktop top nav */}
      <header className="hidden md:flex items-center justify-between px-6 py-3 border-b bg-card sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="font-chinese text-2xl font-bold text-primary">学</span>
          <span className="font-semibold text-lg">Chinese Practice</span>
        </div>
        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Button
                variant={pathname.startsWith(href) ? "default" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user?.email && (
            <span className="text-sm text-muted-foreground truncate max-w-48">{user.email}</span>
          )}
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t flex items-center">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className="flex-1">
              <div
                className={cn(
                  "flex flex-col items-center gap-1 py-2 px-3 transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
