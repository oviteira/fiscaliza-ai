// ============================================================
// NetworkGraph — Grafo de Conexões com D3 Force Simulation
// Design: Intelligence Dashboard — nós com cores de risco
// Visualiza conexões entre parlamentares, empresas, familiares
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { GraphNode, GraphLink, getRiskColor } from '@/lib/mockData';

interface NetworkGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  onNodeClick?: (node: GraphNode) => void;
  height?: number;
}

const NODE_RADIUS: Record<string, number> = {
  parlamentar: 20,
  empresa: 15,
  orgao: 13,
  familiar: 12,
  contrato: 10,
};

const NODE_ICON: Record<string, string> = {
  parlamentar: '👤',
  empresa: '🏢',
  orgao: '🏛️',
  familiar: '👥',
  contrato: '📄',
};

const LINK_COLOR: Record<string, string> = {
  contrato: '#06B6D4',
  emenda: '#FBBF24',
  familiar: '#F43F5E',
  socio: '#F59E0B',
  doacao: '#A78BFA',
};

export function NetworkGraph({ nodes, links, onNodeClick, height = 500 }: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: GraphNode } | null>(null);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    onNodeClick?.(node);
  }, [onNodeClick]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const h = height;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', h);

    // Defs for glow filters
    const defs = svg.append('defs');

    ['critico', 'alto', 'medio', 'baixo'].forEach((nivel) => {
      const color = getRiskColor(nivel);
      const filter = defs.append('filter').attr('id', `glow-${nivel}`);
      filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
      const feMerge = filter.append('feMerge');
      feMerge.append('feMergeNode').attr('in', 'coloredBlur');
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    });

    // Arrow markers for links
    Object.entries(LINK_COLOR).forEach(([type, color]) => {
      defs.append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 28)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', color)
        .attr('opacity', 0.7);
    });

    // Background
    svg.append('rect')
      .attr('width', width)
      .attr('height', h)
      .attr('fill', 'transparent');

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    // Simulation
    const simNodes = nodes.map(n => ({ ...n }));
    const simLinks = links.map(l => ({ ...l }));

    const simulation = d3.forceSimulation(simNodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(simLinks).id((d: any) => d.id).distance(120).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, h / 2))
      .force('collision', d3.forceCollide().radius((d: any) => NODE_RADIUS[d.type] + 15));

    // Links
    const link = g.append('g').selectAll('line')
      .data(simLinks)
      .enter().append('line')
      .attr('stroke', (d: any) => LINK_COLOR[d.type] || '#475569')
      .attr('stroke-width', (d: any) => d.valor ? Math.max(1, Math.min(4, d.valor / 2_000_000)) : 1.5)
      .attr('stroke-opacity', 0.5)
      .attr('marker-end', (d: any) => `url(#arrow-${d.type})`);

    // Link labels
    const linkLabel = g.append('g').selectAll('text')
      .data(simLinks)
      .enter().append('text')
      .attr('font-size', '9px')
      .attr('fill', (d: any) => LINK_COLOR[d.type] || '#94A3B8')
      .attr('opacity', 0.7)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Fira Code, monospace')
      .text((d: any) => d.descricao.length > 20 ? d.descricao.slice(0, 18) + '…' : d.descricao);

    // Node groups
    const nodeGroup = g.append('g').selectAll('g')
      .data(simNodes)
      .enter().append('g')
      .attr('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, any>()
          .on('start', (event, d: any) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d: any) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d: any) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Node circles
    nodeGroup.append('circle')
      .attr('r', (d: any) => NODE_RADIUS[d.type])
      .attr('fill', (d: any) => `${getRiskColor(d.nivelRisco)}20`)
      .attr('stroke', (d: any) => getRiskColor(d.nivelRisco))
      .attr('stroke-width', 2)
      .attr('filter', (d: any) => `url(#glow-${d.nivelRisco})`);

    // Node icons
    nodeGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', (d: any) => NODE_RADIUS[d.type] * 0.9)
      .text((d: any) => NODE_ICON[d.type] || '●');

    // Node labels
    nodeGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d: any) => NODE_RADIUS[d.type] + 14)
      .attr('font-size', '10px')
      .attr('font-family', 'DM Sans, sans-serif')
      .attr('fill', '#CBD5E1')
      .attr('font-weight', '500')
      .text((d: any) => d.label.length > 16 ? d.label.slice(0, 14) + '…' : d.label);

    // Score badge
    nodeGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d: any) => NODE_RADIUS[d.type] + 25)
      .attr('font-size', '9px')
      .attr('font-family', 'Fira Code, monospace')
      .attr('fill', (d: any) => getRiskColor(d.nivelRisco))
      .text((d: any) => `${d.scoreRisco}%`);

    // Click handler
    nodeGroup.on('click', (event, d: any) => {
      event.stopPropagation();
      handleNodeClick(d);
    });

    // Hover effects
    nodeGroup
      .on('mouseenter', (event, d: any) => {
        d3.select(event.currentTarget).select('circle')
          .attr('stroke-width', 3)
          .attr('r', NODE_RADIUS[d.type] + 3);
        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top, node: d });
      })
      .on('mouseleave', (event, d: any) => {
        d3.select(event.currentTarget).select('circle')
          .attr('stroke-width', 2)
          .attr('r', NODE_RADIUS[d.type]);
        setTooltip(null);
      });

    // Simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkLabel
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

      nodeGroup.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Click on background to deselect
    svg.on('click', () => {
      setSelectedNode(null);
      setTooltip(null);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, height, handleNodeClick]);

  return (
    <div ref={containerRef} className="relative w-full" style={{ height }}>
      <svg ref={svgRef} className="w-full h-full" />

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <div
            className="rounded-lg border p-3 shadow-xl text-xs"
            style={{
              background: 'rgba(15,23,42,0.95)',
              borderColor: `${getRiskColor(tooltip.node.nivelRisco)}40`,
              backdropFilter: 'blur(8px)',
              minWidth: 160,
            }}
          >
            <div className="font-semibold text-white mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
              {tooltip.node.label}
            </div>
            <div className="text-slate-400 mb-2 capitalize">{tooltip.node.type}</div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Score de Risco:</span>
              <span className="font-mono font-bold" style={{ color: getRiskColor(tooltip.node.nivelRisco) }}>
                {tooltip.node.scoreRisco}%
              </span>
            </div>
            {tooltip.node.valor && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-400">Valor:</span>
                <span className="font-mono text-cyan-400">
                  R$ {(tooltip.node.valor / 1_000_000).toFixed(1)}M
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 text-xs">
        <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
          Legenda
        </div>
        {Object.entries(LINK_COLOR).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div className="w-6 h-0.5 rounded" style={{ backgroundColor: color }} />
            <span className="text-slate-400 capitalize">{type}</span>
          </div>
        ))}
      </div>

      {/* Node type legend */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 text-xs">
        <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
          Entidades
        </div>
        {Object.entries(NODE_ICON).map(([type, icon]) => (
          <div key={type} className="flex items-center gap-2">
            <span>{icon}</span>
            <span className="text-slate-400 capitalize">{type}</span>
          </div>
        ))}
      </div>

      {/* Zoom hint */}
      <div className="absolute top-3 right-3 text-[10px] text-slate-600 font-mono">
        Scroll para zoom · Arraste para mover
      </div>
    </div>
  );
}
