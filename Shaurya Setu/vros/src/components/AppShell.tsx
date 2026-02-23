"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
type UserRole = "veteran" | "employer" | "counsellor" | "admin";

const ROLE_LABELS: Record<UserRole, string> = {
  veteran: "Veteran",
  employer: "Employer",
  counsellor: "Counsellor",
  admin: "Admin",
};

const ROLE_HOME: Record<UserRole, string> = {
  veteran: "/dashboard/veteran",
  employer: "/dashboard/employer",
  counsellor: "/dashboard/counsellor",
  admin: "/dashboard/admin",
};

const ROLE_NAV: Record<UserRole, { href: string; label: string }[]> = {
  veteran: [
    { href: "/dashboard/veteran", label: "Dashboard" },
    { href: "/dashboard/veteran/profile", label: "My profile" },
    { href: "/dashboard/veteran/plan", label: "My reintegration plan" },
  ],
  employer: [
    { href: "/dashboard/employer", label: "Dashboard" },
  ],
  counsellor: [
    { href: "/dashboard/counsellor", label: "Dashboard" },
    { href: "/dashboard/counsellor/veterans", label: "Veterans" },
    { href: "/dashboard/counsellor/cases", label: "Cases" },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Dashboard" },
    { href: "/dashboard/admin/users", label: "Users" },
    { href: "/dashboard/admin/verification", label: "Verification" },
  ],
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-400" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const role = session.user.role as UserRole;
  const navItems = ROLE_NAV[role] ?? [];
  const homeHref = ROLE_HOME[role] ?? "/dashboard";

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-14 items-center gap-2 border-b border-zinc-200 px-4 dark:border-zinc-800">
          <Link href={homeHref} className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Shaurya Setu
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 p-2">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== homeHref && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-zinc-200 p-2 dark:border-zinc-800">
          <div className="rounded-lg px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{session.user.email}</span>
            <br />
            <span>{ROLE_LABELS[role]}</span>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            Sign out
          </button>
        </div>
      </aside>
      {/* Main content */}
      <main className="min-w-0 flex-1 p-6">{children}</main>
    </div>
  );
}
