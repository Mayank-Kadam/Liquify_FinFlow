import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import { useAppStore } from "@/store/appStore";
import {
  LayoutDashboard,
  Building2,
  Rocket,
  Briefcase,
  Receipt,
  Lightbulb,
  Zap,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Marketplace", url: "/marketplace", icon: Building2 },
  { title: "Issuance", url: "/issuance", icon: Rocket },
  { title: "Portfolio", url: "/portfolio", icon: Briefcase },
  { title: "Transactions", url: "/transactions", icon: Receipt },
  { title: "Vision", url: "/vision", icon: Lightbulb },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, institutionalMode, toggleInstitutionalMode } = useAppStore();

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative flex flex-col h-screen bg-sidebar border-r border-sidebar-border flex-shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 animate-pulse-glow">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              <span className="font-display font-bold text-foreground text-lg leading-none">
                Liqui-FI
              </span>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">AI Liquidity Protocol</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              "group relative"
            )}
            activeClassName="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 hover:text-primary"
          >
            <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  {item.title}
                </motion.span>
              )}
            </AnimatePresence>
            {/* Tooltip for collapsed */}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-card border border-border rounded text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                {item.title}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Institutional mode */}
      <div className="px-2 pb-2">
        <button
          onClick={toggleInstitutionalMode}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm",
            institutionalMode
              ? "bg-warning/10 text-warning border border-warning/20"
              : "text-sidebar-foreground hover:bg-sidebar-accent"
          )}
        >
          <Shield className="w-[18px] h-[18px] flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs font-medium whitespace-nowrap">
                {institutionalMode ? "Inst. Mode ON" : "Institutional"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* User + Logout */}
      <div className="px-2 pb-4 border-t border-sidebar-border pt-3">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate font-mono">
                  {user.address.slice(0, 8)}…{user.address.slice(-4)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150"
        >
          <LogOut className="w-[16px] h-[16px] flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs whitespace-nowrap">
                Disconnect
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
}
