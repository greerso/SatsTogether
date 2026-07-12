import type { ReactNode } from 'react';

// Simplified macOS Chrome window (traffic lights + tab + URL bar) adapted from
// the design's browser-window.jsx.

const C = {
  barBg: '#202124',
  tabBg: '#35363a',
  text: '#e8eaed',
  dim: '#9aa0a6',
  urlBg: '#282a2d',
};

function TrafficLights() {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '0 14px' }}>
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
    </div>
  );
}

export default function ChromeWindow({
  children,
  url = 'example.com',
  title = 'SatsTogether',
  width = 1360,
  height = 860,
}: {
  children: ReactNode;
  url?: string;
  title?: string;
  width?: number;
  height?: number;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        background: C.tabBg,
        flex: 'none',
      }}
    >
      {/* tab bar */}
      <div style={{ display: 'flex', alignItems: 'center', height: 44, background: C.barBg, paddingRight: 8 }}>
        <TrafficLights />
        <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', paddingLeft: 4, flex: 1 }}>
          <div
            style={{
              height: 34,
              alignSelf: 'flex-end',
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: C.tabBg,
              borderRadius: '8px 8px 0 0',
              minWidth: 140,
              maxWidth: 220,
              fontFamily: 'system-ui, sans-serif',
              fontSize: 12,
              color: C.text,
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#5f6368', flexShrink: 0 }} />
            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
          </div>
        </div>
      </div>
      {/* toolbar */}
      <div style={{ height: 40, background: C.tabBg, display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px' }}>
        <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: C.dim, opacity: 0.4 }} />
        </div>
        <div
          style={{
            flex: 1,
            height: 30,
            borderRadius: 15,
            background: C.urlBg,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 14px',
            margin: '0 6px',
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: C.dim, opacity: 0.4 }} />
          <span style={{ flex: 1, color: C.text, fontSize: 13, fontFamily: 'system-ui, sans-serif' }}>{url}</span>
        </div>
        <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: C.dim, opacity: 0.4 }} />
        </div>
      </div>
      {/* page content */}
      <div style={{ flex: 1, background: '#fff', overflow: 'auto' }}>{children}</div>
    </div>
  );
}
