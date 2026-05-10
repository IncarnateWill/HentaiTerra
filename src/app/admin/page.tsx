import { auth } from "@clerk/nextjs/server";
import { User } from "@/models";
import { isFullAdmin, canManageContent } from "@/lib/admin-permissions";
import { 
  Shield, 
  Users, 
  Film, 
  PlayCircle, 
  Settings,
  BarChart3
} from "lucide-react";
import QuickActionCard from "@/components/admin/QuickActionCard";
import IndexNowTest from "@/components/admin/IndexNowTest";

interface UserType {
  username?: string;
  email?: string;
  clerkId?: string;
  roles?: string[];
  role?: string;
}

export default async function AdminDashboard() {
  const { userId } = await auth();
  let user: UserType | null = null;
  if (userId) {
    const dbUser = await User.findOne({ clerkId: userId }).lean();
    if (dbUser && typeof dbUser === 'object' && !Array.isArray(dbUser)) {
      user = dbUser as UserType;
    } else {
      user = null;
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-red-400 mb-2">Access Denied</h2>
          <p className="text-slate-400">User not found or unauthorized.</p>
        </div>
      </div>
    );
  }

  const userRoles = user?.roles && user.roles.length > 0 ? user.roles : (user?.role ? [user.role] : []);
  const isFullAdminUser = isFullAdmin({ roles: userRoles });
  const canManageContentUser = canManageContent({ roles: userRoles });

  // Get basic counts for quick reference
  const totalUsers = await User.countDocuments({});
  const totalAnime = await import("@/models").then(m => m.Anime.countDocuments({}));
  const totalEpisodes = await import("@/models").then(m => m.Episode.countDocuments({}));

  const quickActions = [
    {
      title: "Manage Users",
      description: "Add, edit, or remove user accounts",
      href: "/admin/users",
      icon: "Users",
      color: "from-green-500 to-emerald-600",
      available: isFullAdminUser
    },
    {
      title: "Hentai Management",
      description: "Add new hentai titles and manage existing ones",
      href: "/admin/anime",
      icon: "Film",
      color: "from-purple-500 to-indigo-600",
      available: canManageContentUser
    },
    {
      title: "Episode Control",
      description: "Manage episodes and video content",
      href: "/admin/anime-with-episodes",
      icon: "PlayCircle",
      color: "from-orange-500 to-red-600",
      available: canManageContentUser
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome back, {user?.username || "Admin"}!
          </h1>
          <p className="text-slate-400 mt-2">Here is a quick overview of your platform activity.</p>
        </div>
      </div>

      {/* Quick Overview */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Platform Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{totalUsers.toLocaleString()}</p>
            <p className="text-slate-400 text-sm">Total Users</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Film className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{totalAnime.toLocaleString()}</p>
            <p className="text-slate-400 text-sm">Active Anime</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-2">
              <PlayCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{totalEpisodes.toLocaleString()}</p>
            <p className="text-slate-400 text-sm">Episodes</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-blue-400" />
          Quick Actions & Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} action={action} index={index} />
          ))}
        </div>
      </div>

      {/* IndexNow Testing - Only for Full Admins */}
      {isFullAdminUser && (
        <IndexNowTest />
      )}

      {/* User Info Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
          <Shield className="w-5 h-5 text-blue-400" />
          Your Account
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Username</p>
            <p className="font-mono bg-slate-800 px-3 py-2 rounded-lg text-white border border-slate-700">
              {user?.username || "Not set"}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Email</p>
            <p className="font-mono bg-slate-800 px-3 py-2 rounded-lg text-white border border-slate-700">
              {user?.email || user?.clerkId || "Not available"}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Roles</p>
            <div className="flex flex-wrap gap-2">
              {userRoles.map((role, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border border-purple-500/30"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-slate-300">
                {isFullAdminUser ? "Full Administrator Access" : "Content Manager Access"}
              </p>
              <p className="text-xs text-slate-400">
                {isFullAdminUser 
                  ? "You have complete control over users, content, and system settings."
                  : "You can manage hentai content and episodes."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Admin Dashboard | HentaiUnited',
  description: 'Admin dashboard for managing users, hentai, and episodes on HentaiUnited.'
};
