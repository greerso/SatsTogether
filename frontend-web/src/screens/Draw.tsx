export default function Draw() {
  return (
    <div className="scr" style={{ background: 'radial-gradient(120% 90% at 50% -10%,#3A1E06 0%,#1A1206 55%,#0E0A04 100%)' }}>
      <div style={{ position: 'absolute', top: '40px', left: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(247,147,26,.35),transparent 70%)' }}></div>
      <div style={{ position: 'absolute', top: '220px', right: '-70px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(244,85,46,.3),transparent 70%)' }}></div>

      <div style={{ flex: '1', overflow: 'auto', padding: '70px 26px 30px', position: 'relative', zIndex: '2' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '12px', fontWeight: '700', letterSpacing: '1.5px', color: '#FFB84D', background: 'rgba(247,147,26,.14)', padding: '7px 14px', borderRadius: '999px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#F4552E', boxShadow: '0 0 8px #F4552E' }}></span>WEEKLY DRAW · LIVE SOON
          </span>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,.55)', fontWeight: '500' }}>Prize pool</div>
          <div className="disp" style={{ fontSize: '64px', fontWeight: '800', color: '#fff', letterSpacing: '-2.4px', lineHeight: '1', marginTop: '4px', textShadow: '0 0 30px rgba(247,147,26,.4)' }}>₿0.84</div>
          <div style={{ fontSize: '15px', color: '#FFB84D', fontWeight: '600', marginTop: '6px' }}>≈ $92,400 · split by 12 winners</div>
        </div>

        <div style={{ display: 'flex', gap: '9px', marginTop: '34px' }}>
          <div style={{ flex: '1', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '18px', padding: '16px 0', textAlign: 'center' }}>
            <div className="disp" style={{ fontSize: '34px', fontWeight: '800', color: '#fff', lineHeight: '1' }}>02</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.5)', fontWeight: '600', letterSpacing: '.5px', marginTop: '6px' }}>DAYS</div>
          </div>
          <div style={{ flex: '1', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '18px', padding: '16px 0', textAlign: 'center' }}>
            <div className="disp" style={{ fontSize: '34px', fontWeight: '800', color: '#fff', lineHeight: '1' }}>14</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.5)', fontWeight: '600', letterSpacing: '.5px', marginTop: '6px' }}>HOURS</div>
          </div>
          <div style={{ flex: '1', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '18px', padding: '16px 0', textAlign: 'center' }}>
            <div className="disp" style={{ fontSize: '34px', fontWeight: '800', color: '#fff', lineHeight: '1' }}>06</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.5)', fontWeight: '600', letterSpacing: '.5px', marginTop: '6px' }}>MINS</div>
          </div>
          <div style={{ flex: '1', background: 'linear-gradient(150deg,#F7931A,#E8620A)', borderRadius: '18px', padding: '16px 0', textAlign: 'center', boxShadow: '0 8px 20px rgba(238,107,18,.4)' }}>
            <div className="disp" style={{ fontSize: '34px', fontWeight: '800', color: '#fff', lineHeight: '1' }}>48</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.75)', fontWeight: '600', letterSpacing: '.5px', marginTop: '6px' }}>SECS</div>
          </div>
        </div>

        <div style={{ marginTop: '20px', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '20px', padding: '18px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,.6)' }}>You’re entered with</span>
            <span className="disp" style={{ fontSize: '18px', fontWeight: '700', color: '#FFB84D' }}>2,500 shares</span>
          </div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,.08)', margin: '14px 0' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,.6)' }}>Your win odds</span>
            <span className="disp" style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>3.2%</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', padding: '0 4px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5c0 4.3-2.9 7.6-7 8.8C7.9 18.6 5 15.3 5 11V6l7-3z" stroke="#FFB84D" strokeWidth="1.8" strokeLinejoin="round"/></svg>
          <span style={{ fontSize: '12.5px', lineHeight: '1.4', color: 'rgba(255,255,255,.55)' }}>Winners drawn from Bitcoin block <b style={{ color: 'rgba(255,255,255,.8)' }}>#902,144</b> hash — provably fair, no operator.</span>
        </div>
      </div>

      <div style={{ padding: '12px 26px 40px', position: 'relative', zIndex: '2' }}>
        <div style={{ textAlign: 'center', background: 'linear-gradient(135deg,#FFB443,#F7931A 55%,#EE6B12)', borderRadius: '18px', padding: '18px', fontSize: '17px', fontWeight: '700', color: '#fff', boxShadow: '0 12px 30px rgba(238,107,18,.4)' }}>Set a draw reminder</div>
      </div>
    </div>
  );
}
