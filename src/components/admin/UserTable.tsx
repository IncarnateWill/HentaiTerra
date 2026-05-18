import React from "react";
import RoleSelector from "./RoleSelector";
import Link from "next/link";
import { User, Mail, Shield, ExternalLink, Edit3, Trash2, Loader2 } from "lucide-react";

interface UserRow {
  username?: string;
  email?: string;
  roles: string[];
  clerkId: string;
}

interface UserTableProps {
  users: UserRow[];
  onRolesChange: (clerkId: string, newRoles: string[]) => void;
  onDelete: (clerkId: string) => void;
  onEdit: (user: UserRow) => void;
  currentClerkId: string;
  actionLoading?: string | null;
  isFullAdmin: boolean;
}

const UserTable: React.FC<UserTableProps> = ({ users, onRolesChange, onDelete, onEdit, currentClerkId, actionLoading, isFullAdmin }) => (
  <div className="space-y-4">
    {users.map(user => (
      <div
        key={user.clerkId}
        className="bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-2xl group"
      >
        <div className="p-6">
          {/* User Info Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  {user.username || <span className="text-slate-400 italic">No username</span>}
                  {user.clerkId === currentClerkId && (
                    <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                      You
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                  <Mail className="w-4 h-4" />
                  {user.email || <span className="text-slate-500 italic">No email</span>}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {user.username && (
                <Link
                  href={`/profile/${user.username}`}
                  className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-all duration-200 group"
                  title="View user profile"
                  target="_blank"
                >
                  <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </Link>
              )}
              
              <button
                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => onEdit(user)}
                title="Edit user"
                disabled={user.clerkId === currentClerkId || actionLoading === user.clerkId || !isFullAdmin}
              >
                <Edit3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
              
              <button
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => onDelete(user.clerkId)}
                title="Delete user"
                disabled={user.clerkId === currentClerkId || actionLoading === user.clerkId || !isFullAdmin}
              >
                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Roles Section */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-300">User Roles</span>
            </div>
            
            <div className="flex items-center gap-3">
              <RoleSelector
                value={user.roles || []}
                onChange={roles => onRolesChange(user.clerkId, roles)}
                disabled={actionLoading === user.clerkId || !isFullAdmin}
              />
              
              {actionLoading === user.clerkId && (
                <div className="flex items-center gap-2 text-purple-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </div>
              )}
            </div>
            
            {/* Current Roles Display */}
            <div className="mt-3 flex flex-wrap gap-2">
              {user.roles.map((role, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border border-purple-500/30"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          {/* User ID */}
          <div className="mt-4 text-xs text-slate-500 font-mono">
            ID: {user.clerkId}
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default UserTable; 