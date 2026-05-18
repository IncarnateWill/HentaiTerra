'use client';

import { 
  Users, 
  Film, 
  PlayCircle, 
  Settings,
  LucideIcon 
} from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  icon: string; // Changed from LucideIcon to string
  href: string;
  available: boolean | undefined;
}

interface QuickActionCardProps {
  action: QuickAction;
  index: number;
}

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Users,
  Film,
  PlayCircle,
  Settings
};

export default function QuickActionCard({ action, index }: QuickActionCardProps) {
  const Icon = iconMap[action.icon] || Users; // Default to Users if icon not found
  
  return (
    <div
      key={index}
      className={`p-6 rounded-2xl border transition-all duration-300 group hover:-translate-y-1 ${
        action.available === true
          ? 'bg-slate-900/50 backdrop-blur-md border-slate-700/50 hover:border-blue-500/40 cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-blue-500/10'
          : 'bg-slate-800/30 border-slate-700/30 opacity-50 cursor-not-allowed'
      }`}
      onClick={() => {
        if (action.available === true) {
          window.location.href = action.href;
        }
      }}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-xl ${
          action.available === true 
            ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30' 
            : 'bg-slate-700/50'
        }`}>
          <Icon className={`w-6 h-6 ${
            action.available === true 
              ? 'text-blue-400' 
              : 'text-slate-500'
          }`} />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold mb-1 ${
            action.available === true 
              ? 'text-white' 
              : 'text-slate-400'
          }`}>
            {action.title}
          </h3>
          <p className={`text-sm ${
            action.available === true 
              ? 'text-slate-300' 
              : 'text-slate-500'
          }`}>
            {action.description}
          </p>
        </div>
        {action.available === true && (
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-blue-500/30">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
