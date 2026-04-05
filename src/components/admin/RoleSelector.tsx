import React from "react";
import { Shield, Crown, User, Settings, FileText, CheckCircle, Languages, Users } from "lucide-react";

const ROLES = [
  { value: "user", label: "User", icon: User, color: "from-slate-500 to-slate-600", bgColor: "bg-slate-500/20", textColor: "text-slate-300" },
  { value: "owner", label: "Owner", icon: Crown, color: "from-yellow-500 to-orange-600", bgColor: "bg-yellow-500/20", textColor: "text-yellow-300" },
  { value: "co-owner", label: "Co-Owner", icon: Crown, color: "from-orange-500 to-red-600", bgColor: "bg-orange-500/20", textColor: "text-orange-300" },
  { value: "admin", label: "Admin", icon: Shield, color: "from-red-500 to-pink-600", bgColor: "bg-red-500/20", textColor: "text-red-300" },
  { value: "encoder", label: "Encoder", icon: FileText, color: "from-blue-500 to-indigo-600", bgColor: "bg-blue-500/20", textColor: "text-blue-300" },
  { value: "verificator", label: "Verificator", icon: CheckCircle, color: "from-green-500 to-emerald-600", bgColor: "bg-green-500/20", textColor: "text-green-300" },
  { value: "traducator", label: "Translator", icon: Languages, color: "from-purple-500 to-violet-600", bgColor: "bg-purple-500/20", textColor: "text-purple-300" },
  { value: "staff", label: "Staff", icon: Users, color: "from-indigo-500 to-blue-600", bgColor: "bg-indigo-500/20", textColor: "text-indigo-300" },
];

interface RoleSelectorProps {
  value: string[];
  onChange: (roles: string[]) => void;
  disabled?: boolean;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange, disabled }) => (
  <div className="flex flex-wrap gap-3">
    {ROLES.map(role => {
      const Icon = role.icon;
      const isSelected = value.includes(role.value);
      return (
        <label 
          key={role.value} 
          className={`relative cursor-pointer transition-all duration-200 ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
          }`}
        >
          <input
            type="checkbox"
            value={role.value}
            checked={isSelected}
            onChange={e => {
              let newRoles = value.slice();
              if (e.target.checked) {
                if (!newRoles.includes(role.value)) newRoles.push(role.value);
              } else {
                newRoles = newRoles.filter(r => r !== role.value);
              }
              // Remove duplicates just in case
              newRoles = Array.from(new Set(newRoles));
              onChange(newRoles);
            }}
            disabled={disabled}
            className="sr-only"
          />
          <div className={`
            relative px-4 py-3 rounded-xl border-2 transition-all duration-200 min-w-[120px] text-center
            ${isSelected 
              ? `bg-gradient-to-br ${role.color} border-transparent shadow-lg shadow-${role.value === 'owner' ? 'yellow' : role.value === 'co-owner' ? 'orange' : role.value === 'admin' ? 'red' : role.value === 'encoder' ? 'blue' : role.value === 'verificator' ? 'green' : role.value === 'traducator' ? 'purple' : 'indigo'}-500/25`
              : `bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800`
            }
          `}>
            <div className="flex flex-col items-center gap-2">
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                ${isSelected 
                  ? 'bg-white/20 text-white' 
                  : `${role.bgColor} ${role.textColor}`
                }
              `}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`
                text-sm font-medium transition-colors duration-200
                ${isSelected ? 'text-white' : 'text-slate-300'}
              `}>
                {role.label}
              </span>
            </div>
            
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </label>
      );
    })}
  </div>
);

export default RoleSelector; 