// ============================================================
// Header — Cabeçalho com ticker de dados e breadcrumb
// Design: Intelligence Dashboard — ticker animado + status
// ============================================================

import { Bell, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/mockData';
import { toast } from 'sonner';

const tickerItems = [
  '⚡ 3.847 alertas detectados nos últimos 30 dias',
  '📊 R$ 48,9B em contratos analisados',
  '🔴 87 parlamentares com score crítico (>80)',
  '🗄️ 34 bases de dados integradas e atualizadas',
  '📈 128.743 contratos públicos monitorados',
  '🔍 Última atualização: hoje às 18:30',
  '⚠️ 2.341 contratos com score de risco elevado',
  '🏛️ 594 parlamentares federais monitorados',
];

interface HeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string[];
}

export function Header({ title, subtitle, breadcrumb }: HeaderProps) {
  const handleExport = () => {
    toast.info('Exportação de relatório iniciada', {
      description: 'O arquivo CSV será gerado em instantes.',
    });
  };

  const handleRefresh = () => {
    toast.success('Dados atualizados', {
      description: 'Sincronização com as fontes concluída.',
    });
  };

  return (
    <div className="flex flex-col border-b" style={{ borderColor: 'var(--border)' }}>
      {/* Ticker */}
      <div
        className="overflow-hidden py-1.5 border-b"
        style={{
          background: 'rgba(6,182,212,0.06)',
          borderColor: 'rgba(6,182,212,0.15)',
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex-shrink-0 px-3 text-[10px] font-bold uppercase tracking-widest"
            style={{
              color: '#06B6D4',
              fontFamily: 'Sora, sans-serif',
              borderRight: '1px solid rgba(6,182,212,0.3)',
            }}
          >
            AO VIVO
          </span>
          <div className="overflow-hidden flex-1">
            <div className="ticker-content text-xs text-slate-400 font-mono">
              {tickerItems.join('   ·   ')}
              &nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;
              {tickerItems.join('   ·   ')}
            </div>
          </div>
        </div>
      </div>

      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          {breadcrumb && breadcrumb.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1 font-mono">
              {breadcrumb.map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span>/</span>}
                  <span>{item}</span>
                </span>
              ))}
            </div>
          )}
          <h1
            className="text-xl font-bold text-white"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-slate-500 hover:text-slate-300 h-8 px-3"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span className="text-xs">Atualizar</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="text-slate-500 hover:text-slate-300 h-8 px-3"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span className="text-xs">Exportar</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-slate-300 relative"
            onClick={() => toast.info('3 novos alertas detectados', { description: 'Verifique a página de Alertas.' })}
          >
            <Bell className="w-4 h-4" />
            <span
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
              style={{ background: '#F43F5E' }}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
