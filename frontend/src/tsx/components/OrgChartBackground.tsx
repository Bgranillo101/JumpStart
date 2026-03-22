import React, { useEffect, useRef } from 'react';

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

// Each level has a different parallax strength — deeper levels drift more
const levelStrength = [8, 20, 34, 50];

const levelColors = [
  { stroke: 'rgba(255,221,0,0.55)',   fill: 'rgba(255,221,0,0.07)',   text: 'rgba(255,221,0,0.75)'   },
  { stroke: 'rgba(255,255,255,0.28)', fill: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.55)' },
  { stroke: 'rgba(255,255,255,0.18)', fill: 'rgba(255,255,255,0.04)', text: 'rgba(255,255,255,0.38)' },
  { stroke: 'rgba(255,255,255,0.12)', fill: 'rgba(255,255,255,0.02)', text: 'rgba(255,255,255,0.28)' },
];

export default function OrgChartBackground() {
  const nodeRefs = useRef<Record<string, SVGGElement | null>>({});
  const lineRefs = useRef<Record<string, SVGLineElement | null>>({});
  const mouse = useRef({ x: 0, y: 0 });
  const offsets = useRef(
    Object.fromEntries(nodes.map(n => [n.id, { x: 0, y: 0 }]))
  ) as React.MutableRefObject<Record<string, { x: number; y: number }>>;
  const raf = useRef<number>(0);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouse.current = {
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      };
    };

    const animate = () => {
      const renderedPos: Record<string, { x: number; y: number }> = {};

      nodes.forEach(node => {
        const strength = levelStrength[node.level];
        const off = offsets.current[node.id];

        off.x += (-mouse.current.x * strength - off.x) * 0.05;
        off.y += (-mouse.current.y * strength - off.y) * 0.05;

        renderedPos[node.id] = { x: node.x + off.x, y: node.y + off.y };

        const el = nodeRefs.current[node.id];
        if (el) el.setAttribute('transform', `translate(${off.x},${off.y})`);
      });

      edges.forEach(({ from, to }) => {
        const el = lineRefs.current[`${from}-${to}`];
        if (el) {
          const a = renderedPos[from];
          const b = renderedPos[to];
          el.setAttribute('x1', String(a.x));
          el.setAttribute('y1', String(a.y));
          el.setAttribute('x2', String(b.x));
          el.setAttribute('y2', String(b.y));
        }
      });

      raf.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove);
    raf.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <svg
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
            // Outer g: JavaScript sets the parallax transform here
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
