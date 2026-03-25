// ============================================================
// Sidebar — Navegação principal da plataforma
// Design: Intelligence Dashboard — sidebar escura com nav items
// ============================================================

import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Users,
  Network,
  FileText,
  Database,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Search,
  BookOpen,
  Github,
  ExternalLink,
} from 'lucide-react';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Painel Geral', description: 'Visão consolidada' },
  { href: '/parlamentares', icon: Users, label: 'Parlamentares', description: 'Scores e alertas' },
  { href: '/grafos', icon: Network, label: 'Grafo de Conexões', description: 'Rede de relações' },
  { href: '/contratos', icon: FileText, label: 'Contratos', description: 'Análise contratual' },
  { href: '/alertas', icon: AlertTriangle, label: 'Alertas', description: 'Riscos detectados' },
  { href: '/fontes', icon: Database, label: 'Fontes de Dados', description: 'Bases integradas' },
  { href: '/metodologia', icon: BookOpen, label: 'Metodologia', description: 'Como funciona' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 transition-all duration-300 border-r"
      style={{
        width: collapsed ? 64 : 240,
        background: 'var(--sidebar)',
        borderColor: 'var(--sidebar-border)',
        minWidth: collapsed ? 64 : 240,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5 border-b"
        style={{ borderColor: 'var(--sidebar-border)' }}
      >
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #06B6D4, #0284C7)' }}
        >
          <Shield className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div
              className="text-sm font-bold leading-tight whitespace-nowrap"
              style={{ fontFamily: 'Sora, sans-serif', color: '#F1F5F9' }}
            >
              FiscalizaAI
            </div>
            <div className="text-[10px] text-slate-500 whitespace-nowrap font-mono">
              v1.0 — dados abertos
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 py-3 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
          <div
            className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-slate-500"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Buscar parlamentar…</span>
            <span className="ml-auto font-mono text-[10px] opacity-50">⌘K</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {!collapsed && (
          <div
            className="text-[10px] uppercase tracking-widest text-slate-600 px-2 mb-2"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            Navegação
          </div>
        )}
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <div
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    title={collapsed ? item.label : undefined}
                    style={collapsed ? { justifyContent: 'center', padding: '0.625rem' } : undefined}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && (
                      <div className="overflow-hidden">
                        <div className="text-sm leading-tight">{item.label}</div>
                        {!isActive && (
                          <div className="text-[10px] text-slate-600 leading-tight">{item.description}</div>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t px-3 py-3 space-y-2" style={{ borderColor: 'var(--sidebar-border)' }}>
        {!collapsed && (
          <>
            <a
              href="https://github.com/oviteira/fiscaliza-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1.5 rounded hover:bg-white/5"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub — Código Aberto</span>
              <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
            <div className="text-[10px] text-slate-700 px-2 leading-relaxed">
              Desenvolvido por{' '}
              <span className="text-slate-500">Vitor Lucas Silva Santos</span>
              <br />
              Licença MIT — dados públicos
            </div>
          </>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-colors"
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
