import type { ReactNode } from 'react';
import IOSFrame from './frames/IOSFrame';
import ChromeWindow from './frames/ChromeWindow';
import Welcome from './screens/Welcome';
import Deposit from './screens/Deposit';
import Home from './screens/Home';
import Draw from './screens/Draw';
import Pods from './screens/Pods';
import Withdraw from './screens/Withdraw';
import DesktopDashboard from './screens/DesktopDashboard';

// Numbered section label above each frame, matching the design canvas.
function Label({ n, name }: { n: string; name: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginBottom: 14 }}>
      <span className="disp" style={{ fontSize: 13, fontWeight: 700, color: '#B08A5B' }}>
        {n}
      </span>
      <span style={{ fontSize: 14, fontWeight: 600, color: '#1E1810' }}>{name}</span>
    </div>
  );
}

function Phone({ n, name, dark, children }: { n: string; name: string; dark?: boolean; children: ReactNode }) {
  return (
    <div style={{ flex: 'none' }}>
      <Label n={n} name={name} />
      <IOSFrame dark={dark}>{children}</IOSFrame>
    </div>
  );
}

const chipBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  padding: '7px 13px',
  background: '#fff',
  border: '1px solid rgba(30,24,16,.08)',
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 600,
  color: '#1E1810',
};

export default function App() {
  return (
    <div style={{ minWidth: 2100, padding: '56px 60px 80px' }}>
      {/* header */}
      <div style={{ maxWidth: 920, marginBottom: 8 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(150deg,#FFB443,#F7931A 55%,#EE6B12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 19,
              boxShadow: '0 3px 8px rgba(238,107,18,.35)',
            }}
          >
            ₿
          </div>
          <span className="disp" style={{ fontSize: 20, fontWeight: 700, color: '#1E1810', letterSpacing: '-.4px' }}>
            SatsTogether
          </span>
        </div>
        <h1
          className="disp"
          style={{ margin: '0 0 12px', fontSize: 44, lineHeight: 1.02, fontWeight: 800, color: '#1E1810', letterSpacing: '-1.4px' }}
        >
          Save Bitcoin. Win Bitcoin.
          <br />
          Never lose it.
        </h1>
        <p style={{ margin: 0, maxWidth: 640, fontSize: 16, lineHeight: 1.55, color: '#6B5D4C' }}>
          A prize-linked savings flow for a no-loss Bitcoin protocol. Your principal is always 100% yours — only the yield
          funds the weekly prize pool. Below: onboarding through the draw.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          <span style={chipBase}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#F7931A' }} />
            Bitcoin orange
          </span>
          <span style={chipBase}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#0E9E8E' }} />
            No-loss teal
          </span>
          <span style={chipBase}>Bricolage Grotesque · Instrument Sans</span>
        </div>
      </div>

      {/* mobile flow */}
      <div style={{ display: 'flex', gap: 52, alignItems: 'flex-start', marginTop: 44 }}>
        <Phone n="01" name="Welcome">
          <Welcome />
        </Phone>
        <Phone n="02" name="Deposit">
          <Deposit />
        </Phone>
        <Phone n="03" name="Home">
          <Home />
        </Phone>
        <Phone n="04" name="Weekly Draw" dark>
          <Draw />
        </Phone>
        <Phone n="05" name="Pods">
          <Pods />
        </Phone>
        <Phone n="06" name="Withdraw">
          <Withdraw />
        </Phone>
      </div>

      {/* desktop dashboard */}
      <div style={{ marginTop: 64 }}>
        <Label n="07" name="Desktop · Dashboard" />
        <ChromeWindow url="satstogether.app/dashboard" width={1360} height={860}>
          <DesktopDashboard />
        </ChromeWindow>
      </div>
    </div>
  );
}
