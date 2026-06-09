import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  BookOpen,
  Users,
  BarChart3,
  Calendar,
  LogOut,
  Home,
  BookMarked,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { logout, usuario, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Leitores não veem Usuários nem Relatórios
  const allNavItems = [
    { href: '/', label: 'Dashboard', icon: Home, adminOnly: false },
    { href: '/catalogo', label: 'Catálogo', icon: BookOpen, adminOnly: false },
    { href: '/emprestimos', label: 'Empréstimos', icon: Calendar, adminOnly: false },
    { href: '/reservas', label: 'Reservas', icon: BookMarked, adminOnly: false },
    { href: '/usuarios', label: 'Usuários', icon: Users, adminOnly: true },
    { href: '/relatorios', label: 'Relatórios', icon: BarChart3, adminOnly: true },
  ];

  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  const initials = usuario?.usuario_nome
    ? usuario.usuario_nome.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : '?';

  const NavLinks = ({ collapsed = false }: { collapsed?: boolean }) => (
    <nav className={cn("flex-1 px-3 py-4 space-y-1", collapsed ? "px-2" : "px-3")}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'group flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              collapsed ? 'justify-center px-0' : 'px-3',
              isActive
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            )}
            title={collapsed ? item.label : undefined}
          >
            <Icon className={cn("shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
            {!collapsed && <span className="flex-1 whitespace-nowrap">{item.label}</span>}
            {!collapsed && isActive && <ChevronRight className="w-3 h-3 opacity-60 shrink-0" />}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar desktop */}
      <aside className={cn(
        "hidden md:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border shrink-0 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}>
        {/* Logo */}
        <div className={cn("py-5 border-b border-white/10 flex items-center", isCollapsed ? "justify-center px-0" : "px-5")}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0 shadow-sm">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <p className="text-sm font-bold text-white leading-none">Biblioteca</p>
                <p className="text-xs text-white/50 mt-0.5">Sistema Digital</p>
              </div>
            )}
          </div>
        </div>

        <NavLinks collapsed={isCollapsed} />

        {/* User + logout */}
        <div className={cn("py-4 border-t border-white/10 space-y-2 flex flex-col", isCollapsed ? "px-2 items-center" : "px-4")}>
          {usuario && (
            <div className={cn("flex items-center gap-3 rounded-lg", isCollapsed ? "justify-center" : "px-2 py-1")}>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm" title={isCollapsed ? usuario.usuario_nome : undefined}>
                {initials}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-white truncate">{usuario.usuario_nome}</p>
                  <p className="text-xs text-white/50 truncate">{usuario.usuario_tipo}</p>
                </div>
              )}
            </div>
          )}
          <button
            onClick={logout}
            className={cn(
              "flex items-center gap-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200",
              isCollapsed ? "justify-center px-0 w-full" : "px-3 w-full"
            )}
            title={isCollapsed ? "Sair" : undefined}
          >
            <LogOut className={cn("shrink-0", isCollapsed ? "w-5 h-5" : "w-4 h-4")} />
            {!isCollapsed && <span className="font-medium">Sair</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <div className="border-t border-white/10 p-2 flex justify-center">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            title={isCollapsed ? "Expandir" : "Recolher"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-sidebar text-white px-4 py-3 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          <span className="font-bold text-sm">Biblioteca</span>
        </div>
        <button onClick={() => setMobileOpen((v) => !v)} className="p-1">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-20 pt-14">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 h-full bg-sidebar flex flex-col">
            <NavLinks />
            <div className="px-3 py-4 border-t border-white/10">
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto md:pt-0 pt-14">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
