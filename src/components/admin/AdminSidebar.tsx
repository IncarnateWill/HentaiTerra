import Link from "next/link";
import { isFullAdmin, canManageContent } from "@/lib/admin-permissions";
import { 
  LayoutDashboard, 
  Users, 
  Film, 
  PlayCircle, 
  Shield,
  Settings
} from "lucide-react";

interface AdminSidebarProps {
  user: { roles?: string[] };
}

const AdminSidebar = ({ user }: AdminSidebarProps) => {
  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      color: "text-blue-400 hover:text-blue-300",
      bgColor: "hover:bg-blue-500/10"
    },

    ...(isFullAdmin(user) ? [{
      href: "/admin/users",
      label: "User Management",
      icon: Users,
      color: "text-green-400 hover:text-green-300",
      bgColor: "hover:bg-green-500/10"
    }] : []),
    ...(canManageContent(user) ? [
      {
        href: "/admin/anime",
        label: "Hentai Management",
        icon: Film,
        color: "text-purple-400 hover:text-purple-300",
        bgColor: "hover:bg-purple-500/10"
      },
      {
        href: "/admin/anime-with-episodes",
        label: "Episodes",
        icon: PlayCircle,
        color: "text-orange-400 hover:text-orange-300",
        bgColor: "hover:bg-orange-500/10"
      }
    ] : [])
  ];

  return (
    <aside className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen border-r border-slate-700/50 shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-xs text-slate-400">Control Center</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${item.bgColor} ${item.color}`}
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Admin Status */}
        <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Access Level</span>
          </div>
          <div className="space-y-1">
            {isFullAdmin(user) && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-400">Full Administrator</span>
              </div>
            )}
            {canManageContent(user) && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-400">Content Manager</span>
              </div>
            )}
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
