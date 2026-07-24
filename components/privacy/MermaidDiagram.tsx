'use client';

import React, { useEffect, useId, useState } from 'react';

type MermaidDiagramProps = {
  chart: string;
  caption?: string;
};

// Generates a self-contained HTML page that renders a single Mermaid diagram.
// By using an iframe we completely isolate the SVG from Tailwind's CSS resets.
function buildIframeDoc(chart: string): string {
  const escaped = chart
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #ffffff; width: 100%; overflow-x: auto; }
  body { display: flex; align-items: flex-start; justify-content: center; padding: 32px 24px; }
  #diagram svg {
    max-width: 100%;
    height: auto;
    display: block;
    font-family: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
  }
  /* sequence diagram text fix */
  text, tspan { fill: #111111 !important; color: #111111 !important; }
  .actor { stroke: #333 !important; fill: #fff !important; }
  .actor-line { stroke: #aaa !important; }
  .messageLine0, .messageLine1 { stroke: #444 !important; }
  .messageText { fill: #111 !important; }
  .labelBox { stroke: #ccc !important; fill: #f5f5f5 !important; }
  .labelText { fill: #111 !important; }
  .loopText { fill: #111 !important; }
  .note { stroke: #ccc !important; fill: #fffde7 !important; }
  .noteText { fill: #333 !important; }
  .activation0, .activation1 { fill: #f0f0f0 !important; stroke: #333 !important; }
  /* flowchart node fix */
  .node rect, .node circle, .node ellipse, .node polygon, .node path { fill: #fff !important; stroke: rgba(0,0,0,0.2) !important; }
  .edgeLabel { background: #fff !important; }
  .cluster rect { fill: #fafafa !important; stroke: rgba(0,0,0,0.15) !important; }
  .arrowheadPath { fill: #444 !important; }
  .edgePath .path { stroke: #444 !important; }
</style>
</head>
<body>
<div id="diagram"></div>
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      primaryColor: '#ffffff',
      primaryTextColor: '#111111',
      primaryBorderColor: 'rgba(0,0,0,0.22)',
      secondaryColor: '#f5f5f5',
      tertiaryColor: '#f9f9f9',
      lineColor: '#444444',
      fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
      fontSize: '14px',
      nodeBorder: 'rgba(0,0,0,0.2)',
      clusterBkg: '#fafafa',
      clusterBorder: 'rgba(0,0,0,0.15)',
      edgeLabelBackground: '#ffffff',
      nodeTextColor: '#111111',
      labelTextColor: '#111111',
      actorBorder: '#333333',
      actorBkg: '#ffffff',
      actorTextColor: '#111111',
      actorLineColor: '#888888',
      signalColor: '#333333',
      signalTextColor: '#111111',
      noteBorderColor: '#cccccc',
      noteBkgColor: '#fffde7',
      noteTextColor: '#333333',
      activationBorderColor: '#333333',
      activationBkgColor: '#f0f0f0',
    },
    flowchart: { curve: 'basis', padding: 20, htmlLabels: true, useMaxWidth: true },
    sequence: { actorMargin: 60, messageMargin: 40, useMaxWidth: true, mirrorActors: false },
  });

  const chart = \`${escaped}\`;
  const { svg } = await mermaid.render('mermaid-diagram', chart);
  const el = document.getElementById('diagram');
  el.innerHTML = svg;

  // Make SVG responsive
  const svgEl = el.querySelector('svg');
  if (svgEl) {
    svgEl.removeAttribute('width');
    svgEl.removeAttribute('height');
    svgEl.style.width = '100%';
    svgEl.style.height = 'auto';
    svgEl.style.maxWidth = '100%';
  }

  // Notify parent of content height so iframe resizes
  const height = document.body.scrollHeight;
  window.parent.postMessage({ type: 'mermaid-height', height }, '*');
</script>
</body>
</html>`;
}

export function MermaidDiagram({ chart, caption }: MermaidDiagramProps) {
  const id = useId().replace(/:/g, '');
  const [height, setHeight] = useState(320);
  const [srcDoc, setSrcDoc] = useState('');

  useEffect(() => {
    setSrcDoc(buildIframeDoc(chart.trim()));
  }, [chart]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'mermaid-height' && typeof e.data.height === 'number') {
        setHeight(Math.max(160, e.data.height + 16));
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <figure className="my-10 border border-black/10 bg-white overflow-hidden" style={{ borderRadius: 2 }}>
      {srcDoc ? (
        <iframe
          id={`mermaid-iframe-${id}`}
          srcDoc={srcDoc}
          title={caption ?? 'Diagram'}
          sandbox="allow-scripts"
          scrolling="no"
          style={{
            width: '100%',
            height: `${height}px`,
            border: 'none',
            display: 'block',
            transition: 'height 0.3s ease',
          }}
        />
      ) : (
        <div className="h-36 flex items-center justify-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#050505]/25 animate-pulse">
            Rendering diagram…
          </span>
        </div>
      )}
      {caption && (
        <figcaption className="px-5 py-3 border-t border-black/8 font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[#050505]/35">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
