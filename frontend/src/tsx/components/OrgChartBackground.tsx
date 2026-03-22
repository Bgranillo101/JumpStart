import { useEffect, useRef } from 'react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceX,
  forceY,
} from 'd3-force';
import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';

const nodes = [
  { id: 'ceo',    x: 700,  y: 110, r: 32, label: 'CEO',  level: 0 },
  { id: 'cto',    x: 280,  y: 290, r: 26, label: 'CTO',  level: 1 },
  { id: 'cmo',    x: 700,  y: 290, r: 26, label: 'CMO',  level: 1 },
  { id: 'cfo',    x: 1120, y: 290, r: 26, label: 'CFO',  level: 1 },
  { id: 'dev',    x: 150,  y: 460, r: 21, label: 'Dev',  level: 2 },
  { id: 'qa',     x: 340,  y: 460, r: 21, label: 'QA',   level: 2 },
  { id: 'design', x: 620,  y: 460, r: 21, label: 'UX',   level: 2 },
  { id: 'mktg',   x: 790,  y: 460, r: 21, label: 'Mktg', level: 2 },
  { id: 'fin',    x: 1020, y: 460, r: 21, label: 'Fin',  level: 2 },
  { id: 'hr',     x: 1220, y: 460, r: 21, label: 'HR',   level: 2 },
  { id: 'eng1',   x: 90,   y: 630, r: 16, label: 'Eng',  level: 3 },
  { id: 'eng2',   x: 210,  y: 630, r: 16, label: 'Eng',  level: 3 },
  { id: 'test',   x: 350,  y: 630, r: 16, label: 'Test', level: 3 },
  { id: 'ux',     x: 590,  y: 630, r: 16, label: 'UX',   level: 3 },
  { id: 'pr',     x: 810,  y: 630, r: 16, label: 'PR',   level: 3 },
  { id: 'acc',    x: 990,  y: 630, r: 16, label: 'Acc',  level: 3 },
  { id: 'rec',    x: 1210, y: 630, r: 16, label: 'Rec',  level: 3 },
] as const;

type NodeId = (typeof nodes)[number]['id'];

const edges: { from: NodeId; to: NodeId }[] = [
  { from: 'ceo', to: 'cto' },
  { from: 'ceo', to: 'cmo' },
  { from: 'ceo', to: 'cfo' },
  { from: 'cto', to: 'dev' },
  { from: 'cto', to: 'qa' },
  { from: 'cmo', to: 'design' },
  { from: 'cmo', to: 'mktg' },
  { from: 'cfo', to: 'fin' },
  { from: 'cfo', to: 'hr' },
  { from: 'dev', to: 'eng1' },
  { from: 'dev', to: 'eng2' },
  { from: 'qa', to: 'test' },
  { from: 'design', to: 'ux' },
  { from: 'mktg', to: 'pr' },
  { from: 'fin', to: 'acc' },
  { from: 'hr', to: 'rec' },
];

const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n])) as Record<NodeId, (typeof nodes)[number]>;

const levelColors = [
  { stroke: 'rgba(255,221,0,0.55)',   fill: 'rgba(255,221,0,0.07)',   text: 'rgba(255,221,0,0.75)'   },
  { stroke: 'rgba(255,255,255,0.28)', fill: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.55)' },
  { stroke: 'rgba(255,255,255,0.18)', fill: 'rgba(255,255,255,0.04)', text: 'rgba(255,255,255,0.38)' },
  { stroke: 'rgba(255,255,255,0.12)', fill: 'rgba(255,255,255,0.02)', text: 'rgba(255,255,255,0.28)' },
];

interface PhysicsNode extends SimulationNodeDatum {
  id: string;
  baseX: number;
  baseY: number;
  r: number;
  label: string;
  level: number;
}

type PhysicsEdge = SimulationLinkDatum<PhysicsNode>;

export default function OrgChartBackground() {
  const nodeRefs = useRef<Record<string, SVGGElement | null>>({});
  const lineRefs = useRef<Record<string, SVGLineElement | null>>({});
  const svgRef = useRef<SVGSVGElement | null>(null);
  const mouse = useRef({ x: 700, y: 380 }); // SVG viewBox center as default

  useEffect(() => {
    const mutableNodes: PhysicsNode[] = nodes.map(n => ({
      id: n.id,
      baseX: n.x,
      baseY: n.y,
      x: n.x,
      y: n.y,
      r: n.r,
      label: n.label,
      level: n.level,
    }));

    const mutableEdges: PhysicsEdge[] = edges.map(e => ({
      source: e.from as string,
      target: e.to as string,
    }));

    const simulation = forceSimulation(mutableNodes)
      .alphaTarget(0.01)
      .velocityDecay(0.15)
      .force('x', forceX<PhysicsNode>(d => d.baseX).strength(0.05))
      .force('y', forceY<PhysicsNode>(d => d.baseY).strength(0.05))
      .force('charge', forceManyBody().strength(-150))
      .force(
        'link',
        forceLink<PhysicsNode, PhysicsEdge>(mutableEdges)
          .id(d => d.id)
          .distance(100)
          .strength(0.2),
      );

    const onMouseMove = (e: MouseEvent) => {
      const svgEl = svgRef.current;
      if (!svgEl) return;
      const rect = svgEl.getBoundingClientRect();
      // Map from client pixels → SVG viewBox (1400×760), accounting for xMidYMid slice
      const viewBoxScale = Math.max(rect.width / 1400, rect.height / 760);
      const scaledW = 1400 * viewBoxScale;
      const scaledH = 760 * viewBoxScale;
      const offsetX = (scaledW - rect.width) / 2;
      const offsetY = (scaledH - rect.height) / 2;
      mouse.current = {
        x: (e.clientX - rect.left + offsetX) / viewBoxScale,
        y: (e.clientY - rect.top + offsetY) / viewBoxScale,
      };
    };

    simulation.on('tick', () => {
      const time = Date.now() * 0.001;
      const { x: mouseX, y: mouseY } = mouse.current;

      mutableNodes.forEach((node, i) => {
        // Idle floating
        node.vx! += Math.sin(time + i) * 0.05;
        node.vy! += Math.cos(time + i) * 0.05;

        // Mouse repulsion
        const dx = (node.x ?? node.baseX) - mouseX;
        const dy = (node.y ?? node.baseY) - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 0) {
          const force = (150 - dist) / 150;
          node.vx! += (dx / dist) * force * 0.8;
          node.vy! += (dy / dist) * force * 0.8;
        }

        // Update node DOM position as offset from original
        const el = nodeRefs.current[node.id];
        if (el) {
          const tx = (node.x ?? node.baseX) - node.baseX;
          const ty = (node.y ?? node.baseY) - node.baseY;
          el.setAttribute('transform', `translate(${tx},${ty})`);
        }
      });

      // Update edge line endpoints
      mutableEdges.forEach(edge => {
        const src = edge.source as PhysicsNode;
        const tgt = edge.target as PhysicsNode;
        const el = lineRefs.current[`${src.id}-${tgt.id}`];
        if (el) {
          el.setAttribute('x1', String(src.x ?? src.baseX));
          el.setAttribute('y1', String(src.y ?? src.baseY));
          el.setAttribute('x2', String(tgt.x ?? tgt.baseX));
          el.setAttribute('y2', String(tgt.y ?? tgt.baseY));
        }
      });
    });

    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      simulation.stop();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="org-chart-bg"
      viewBox="0 0 1400 760"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g>
        {edges.map(({ from, to }, i) => {
          const a = nodeMap[from];
          const b = nodeMap[to];
          return (
            <line
              key={`${from}-${to}`}
              ref={el => { lineRefs.current[`${from}-${to}`] = el; }}
              x1={a.x} y1={a.y}
              x2={b.x} y2={b.y}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
              strokeDasharray="1000"
              className="org-line"
              style={{ animationDelay: `${0.08 * i}s` }}
            />
          );
        })}
      </g>

      <g>
        {nodes.map((node, i) => {
          const c = levelColors[node.level];
          const delay = `${node.level * 0.25 + i * 0.04}s`;
          const pulseClass = node.level === 0
            ? ' org-node-pulse-ceo'
            : node.level === 1 ? ' org-node-pulse' : '';
          return (
            // Outer g: d3-force sets the physics transform here
            <g key={node.id} ref={el => { nodeRefs.current[node.id] = el; }}>
              {/* Inner g: CSS handles the fade/scale animation without conflicting */}
              <g className={`org-node${pulseClass}`} style={{ animationDelay: delay }}>
                <circle cx={node.x} cy={node.y} r={node.r} fill={c.fill} stroke={c.stroke} strokeWidth="1" />
                <text
                  x={node.x} y={node.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={node.r * 0.56}
                  fill={c.text}
                  fontFamily="system-ui, sans-serif"
                  fontWeight="600"
                  letterSpacing="0.03em"
                >
                  {node.label}
                </text>
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
