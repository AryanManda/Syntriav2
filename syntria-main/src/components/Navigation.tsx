import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Briefcase,
  UserPlus,
  ShieldAlert,
  Power,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/workbench", label: "PM Workbench", icon: Briefcase },
  { to: "/onboarding", label: "Onboarding", icon: UserPlus },
  { to: "/risk", label: "Risk & Compliance", icon: ShieldAlert },
  { to: "/decommission", label: "Decommission", icon: Power },
  { to: "/audit", label: "Audit Trail", icon: FileText },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin", label: "Admin", icon: Settings },
];

export const Navigation = () => {
  return (
    <nav className="w-64 border-r border-border bg-surface-1 flex flex-col">
      <div className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted"
              activeClassName="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Syntria v1.0
        </p>
      </div>
    </nav>
  );
};
