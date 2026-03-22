import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, CheckCircle, FileText, Users, Settings, LogOut, Menu, X, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const allMenuItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, adminOnly: false },
  { label: "Verifikasi Domain", path: "/verifikasi", icon: CheckCircle, adminOnly: false },
  { label: "Log Servis", path: "/log-servis", icon: FileText, adminOnly: false },
  { label: "Kelola User", path: "/kelola-user", icon: Users, adminOnly: true },
  { label: "Admin Console", path: "/admin-console", icon: Settings, adminOnly: true },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = allMenuItems.filter((m) => !m.adminOnly || isAdmin);
  const activeLabel = menuItems.find((m) => location.pathname.startsWith(m.path))?.label ?? "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 z-30 bg-foreground/40 md:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static z-40 flex flex-col h-full w-64 bg-sidebar text-sidebar-foreground transition-transform duration-200",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex items-center gap-2 px-5 py-5 border-b border-sidebar-border">
          <Shield className="h-7 w-7 text-sidebar-primary" />
          <div>
            <h1 className="text-base font-bold tracking-tight">PRD</h1>
            <p className="text-[10px] text-sidebar-foreground/60 leading-tight">Pengawasan Ruang Digital</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-sidebar-border">
          <button onClick={() => { logout(); navigate("/login"); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between h-14 px-4 md:px-6 bg-card border-b shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h2 className="text-lg font-semibold">{activeLabel}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.nama}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              {user?.avatar_initial}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
