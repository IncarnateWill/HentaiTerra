import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { auth } from "@clerk/nextjs/server";
import { User } from "@/models";
import { isFullAdmin, canManageContent } from "@/lib/admin-permissions";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Fetch current user from Clerk and DB
  const { userId } = await auth();
  let user = null;
  if (userId) {
    user = await User.findOne({ clerkId: userId }).lean();
  }

  // Only allow full admin or content managers
  if (
    !user ||
    typeof user !== "object" ||
    (!isFullAdmin(user as any) && !canManageContent(user as any))
  ) {
    console.warn(`Unauthorized admin access attempt by userId: ${userId || 'unknown'}`);
    redirect("/403");
  }

  return (
    <div className="flex min-h-screen bg-neutral-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-neutral-950 text-slate-200">
      <AdminSidebar user={user && typeof user === "object" ? { roles: (user as any).roles || ((user as any).role ? [(user as any).role] : []) } : { roles: [] }} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}