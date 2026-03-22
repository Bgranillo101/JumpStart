# OrgChartBackground Interactive Plan

## Goal
Transform the static [OrgChartBackground](file:///c:/Users/linco/OneDrive/Desktop/CompSci/Projects/JumpStart/frontend/src/tsx/components/OrgChartBackground.tsx#56-172) SVG into an interactive, physics-driven force-directed graph. 

## Status: IMPLEMENTED ✓

## Requirements Met
1. **Independently interactive:** Each node moves according to physics.
2. **Connected movement:** Edges act as springs; pulling one node drags its neighbors.
3. **Mouse repulsion:** Moving the mouse near a node pushes it away.
4. **Idle floating:** The graph subtly breathes/drifts when at rest.

## Approach: `d3-force` + Direct DOM Manipulation
Using `d3-force` is the ideal approach as it mathematically handles multi-body repulsion, structural link constraints, and velocity without needing a massive 2D physics engine. We will use it *headless*, letting it compute positions while retaining the current pattern of updating SVG elements directly via `useRef` (bypassing React state for 60fps performance).

## Step-by-Step Agent Implementation Guide

### Step 1: Install Dependencies
Run the following commands to install the necessary physics library:
```bash
npm install d3-force
npm install -D @types/d3-force
```

### Step 2: Prepare the Data
In [OrgChartBackground.tsx](file:///c:/Users/linco/OneDrive/Desktop/CompSci/Projects/JumpStart/frontend/src/tsx/components/OrgChartBackground.tsx), D3 will need to mutate node coordinates.
1. Import D3 modules: `import { forceSimulation, forceLink, forceManyBody, forceX, forceY } from "d3-force";`
2. Create deep copies of the original `nodes` and `edges` arrays inside the component or outside so D3 can append `vx`, `vy`, `x`, and `y` without overwriting the original "base" coordinates. Store the initial `x` and `y` as `baseX` and `baseY`.

### Step 3: Initialize the Physics Simulation
Inside the existing `useEffect`:
1. Initialize the simulation:
   ```typescript
   const simulation = forceSimulation(mutableNodes)
     .alphaTarget(0.01) // Keep simulation permanently running (never fully sleeps)
     .velocityDecay(0.15) // High friction so it feels like floating in fluid
   ```
2. Add structural forces to maintain the org-chart shape:
   ```typescript
   .force("x", forceX((d) => d.baseX).strength(0.05)) // Gently pull back to original X
   .force("y", forceY((d) => d.baseY).strength(0.05)) // Gently pull back to original Y
   .force("charge", forceManyBody().strength(-150)) // Prevent node overlap
   .force("link", forceLink(mutableEdges).id((d) => d.id).distance(100).strength(0.2)) // Tie nodes together
   ```

### Step 4: Add Idle Floating & Mouse Repulsion
Replace the existing [animate](file:///c:/Users/linco/OneDrive/Desktop/CompSci/Projects/JumpStart/frontend/src/tsx/components/OrgChartBackground.tsx#73-103) loop with the simulation's [on("tick")](file:///c:/Users/linco/OneDrive/Desktop/CompSci/Projects/JumpStart/frontend/src/tsx/components/OrgChartBackground.tsx#66-72) event handler:
```typescript
simulation.on("tick", () => {
  const time = Date.now() * 0.001;
  const { mouseX, mouseY } = getMouseRelativeSvgCoordinates(); // Map mouse to SVG viewBox

  mutableNodes.forEach((node, i) => {
    // 1. Idle Floating (Perlin noise or simple Sine waves)
    node.vx += Math.sin(time + i) * 0.05;
    node.vy += Math.cos(time + i) * 0.05;

    // 2. Mouse Repulsion
    const dx = node.x - mouseX;
    const dy = node.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 150 && dist > 0) {
      // Apply a force inversely proportional to distance
      const force = (150 - dist) / 150;
      node.vx += (dx / dist) * force * 2;
      node.vy += (dy / dist) * force * 2;
    }

    // 3. Direct DOM Update (Same as current implementation)
    const el = nodeRefs.current[node.id];
    if (el) el.setAttribute("transform", `translate(${node.x - node.baseX},${node.y - node.baseY})`);
  });

  // Update edges
  mutableEdges.forEach((edge) => {
    const el = lineRefs.current[`${edge.source.id}-${edge.target.id}`];
    if (el) {
      el.setAttribute("x1", edge.source.x);
      el.setAttribute("y1", edge.source.y);
      el.setAttribute("x2", edge.target.x);
      el.setAttribute("y2", edge.target.y);
    }
  });
});
```

### Step 5: Mouse Coordinate Mapping
The current `mouse.current` is mapped to `-0.5` to `0.5` percentages. Update the `mousemove` event listener to track exact pixel coordinates relative to the SVG `viewBox` (1400x760) so the mouse repulsion calculation (`mouseX`, `mouseY`) accurately aligns with the node coordinates.

## Verification Plan
1. **Install check:** Verify `d3-force` installs cleanly via package.json inspection.
2. **Visual testing:** Run `npm run dev` and navigate to a view that renders [OrgChartBackground](file:///c:/Users/linco/OneDrive/Desktop/CompSci/Projects/JumpStart/frontend/src/tsx/components/OrgChartBackground.tsx#56-172).
3. **Behavior check:** 
   - Observe the graph idly breathing/shifting without interaction.
   - Hover the mouse near a node; it should move away.
   - Verify that when a node moves, its connected lines stretch and gently pull adjacent nodes.
   - Ensure the chart generally retains its hierarchical shape due to the `forceX` and `forceY` anchoring.
