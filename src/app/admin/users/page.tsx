"use client";

import React, { useEffect, useState, useCallback } from "react";
import UserTable from "@/components/admin/UserTable";
import { isFullAdmin } from "@/lib/admin-permissions";
import { Search, Users, Filter, Plus, Download, RefreshCw } from "lucide-react";

interface UserRow {
  username?: string;
  email?: string;
  roles: string[];
  clerkId: string;
}

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // clerkId for which action is loading
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [currentClerkId, setCurrentClerkId] = useState<string>("");
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState<{ username: string; email: string; roles: string[] }>({ username: "", email: "", roles: ["user"] });
  const [editLoading, setEditLoading] = useState(false);
  const [searchDebounced, setSearchDebounced] = useState("");
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isFullAdminUser, setIsFullAdminUser] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Get current user clerkId and roles
  useEffect(() => {
    fetch("/api/user/profile").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setCurrentClerkId(data.user?.clerkId || "");
        setUserRoles(data.user?.roles || []);
        setIsFullAdminUser(isFullAdmin({ roles: data.user?.roles || [] }));
      }
    });
  }, []);

  const fetchUsers = useCallback(async (pageNum: number, searchTerm: string, roleFilterTerm: string = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: String(PAGE_SIZE),
      });
      if (searchTerm) params.set("search", searchTerm);
      if (roleFilterTerm) params.set("role", roleFilterTerm);
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle search or role filter changes - reset to page 1
  useEffect(() => {
    setPage(1);
    fetchUsers(1, searchDebounced, roleFilter);
  }, [searchDebounced, roleFilter, fetchUsers]);

  // Handle page changes - fetch data for current page
  useEffect(() => {
    if (page > 1) { // Only fetch if not page 1 (already handled by search/filter effect)
      fetchUsers(page, searchDebounced, roleFilter);
    }
  }, [page, fetchUsers, searchDebounced, roleFilter]);

  const handleRolesChange = async (clerkId: string, newRoles: string[]) => {
    console.log('handleRolesChange called for', clerkId, 'with roles:', newRoles);
    setActionLoading(clerkId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId, roles: newRoles }),
      });
      if (!res.ok) throw new Error("Failed to update roles");
      await fetchUsers(page, searchDebounced);
    } catch (err: any) {
      alert(err.message || "Failed to update roles");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (clerkId: string) => {
    if (clerkId === currentClerkId) return;
    if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    setActionLoading(clerkId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }
      await fetchUsers(page, searchDebounced);
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (user: UserRow) => {
    setEditUser(user);
    setEditForm({
      username: user.username || "",
      email: user.email || "",
      roles: user.roles || ["user"],
    });
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    setEditLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: editUser.clerkId,
          username: editForm.username,
          email: editForm.email,
          roles: editForm.roles,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update user");
      }
      setEditUser(null);
      await fetchUsers(page, searchDebounced);
    } catch (err: any) {
      alert(err.message || "Failed to update user");
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => setEditUser(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-slate-400 mt-2">Manage user accounts, roles, and permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchUsers(page, searchDebounced)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-6 rounded-2xl border border-blue-500/20">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-blue-300">Total Users</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-2">{total.toLocaleString()}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by username or email..."
              className="w-full pl-10 pr-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              className="pl-10 pr-8 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none cursor-pointer min-w-[180px]"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="staff">Staff</option>
              <option value="encoder">Encoder</option>
              <option value="verificator">Verificator</option>
              <option value="traducator">Translator</option>
              <option value="admin">Admin</option>
              <option value="co-owner">Co-Owner</option>
              <option value="owner">Owner</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-red-400 text-lg mb-2">Error loading users</p>
            <p className="text-slate-400">{error}</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-slate-300 font-medium">Users ({total})</span>
                </div>
                <div className="text-sm text-slate-400">
                  Page {page} of {totalPages}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <UserTable
                users={users}
                onRolesChange={handleRolesChange}
                onDelete={handleDelete}
                onEdit={handleEdit}
                currentClerkId={currentClerkId}
                actionLoading={actionLoading}
                isFullAdmin={isFullAdminUser}
              />
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/30">
              <div className="flex items-center justify-between">
                <div className="text-slate-400 text-sm">
                  Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, total)} of {total} users
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  <button
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700/50 shadow-2xl min-w-[400px] max-w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Edit User</h2>
              <button
                onClick={handleEditCancel}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            {editUser.username && (
              <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Quick Actions:</span>
                  <a
                    href={`/profile/${editUser.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 text-sm font-medium px-3 py-1 rounded-lg border border-green-500/30 hover:bg-green-500/10 transition-colors flex items-center gap-2"
                  >
                    👤 View Profile Page
                  </a>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  value={editForm.username}
                  onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
                  disabled={editLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  disabled={editLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Roles</label>
                <select
                  className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  value={editForm.roles.join(",")}
                  onChange={e => setEditForm(f => ({ ...f, roles: e.target.value.split(",") }))}
                  disabled={editLoading}
                >
                  {['user','owner','co-owner','admin','encoder','verificator','traducator','staff'].map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-8">
              <button
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl border border-slate-600 transition-colors"
                onClick={handleEditCancel}
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl border border-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={handleEditSave}
                disabled={editLoading}
              >
                {editLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}