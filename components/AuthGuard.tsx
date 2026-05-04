"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { db } from "@/lib/db";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = db.useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user && pathname !== "/login") {
      router.replace("/login");
    }
    if (!isLoading && user && pathname === "/login") {
      router.replace("/words");
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="font-chinese text-5xl animate-pulse">学</div>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && pathname !== "/login") return null;

  return <>{children}</>;
}
