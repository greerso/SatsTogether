export default function Withdraw() {
  return (
    <div className="scr" style={{ background: '#FBF5EC' }}>
      <div style={{ flex: '1', overflow: 'auto', padding: '66px 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', border: '1px solid rgba(30,24,16,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="11" height="18" viewBox="0 0 12 20"><path d="M10 2L2 10l8 8" stroke="#1E1810" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>

        <h2 className="disp" style={{ margin: '14px 0 4px', fontSize: '30px', fontWeight: '800', color: '#1E1810', letterSpacing: '-.8px' }}>Withdraw</h2>
        <p style={{ margin: '0 0 22px', fontSize: '14px', color: '#6B5D4C' }}>Take out any part of your principal — instantly, over Lightning.</p>

        <div style={{ background: 'linear-gradient(135deg,#12A594,#0B7F72)', borderRadius: '24px', padding: '24px 22px', boxShadow: '0 12px 28px rgba(14,158,142,.28)' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,.85)' }}>AVAILABLE TO WITHDRAW</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
            <span className="disp" style={{ fontSize: '48px', fontWeight: '800', color: '#fff', letterSpacing: '-1.6px', lineHeight: '1' }}>₿0.025</span>
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,.9)', marginTop: '4px' }}>2,500,000 sats · 100% of your principal</div>
        </div>

        <div style={{ marginTop: '14px', background: '#fff', border: '1px solid rgba(30,24,16,.06)', borderRadius: '20px', padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', color: '#6B5D4C' }}>Withdraw amount</span>
            <span className="disp" style={{ fontSize: '20px', fontWeight: '800', color: '#1E1810' }}>₿0.025</span>
          </div>
          <div style={{ marginTop: '14px', height: '8px', borderRadius: '99px', background: '#F0E7D8', position: 'relative' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '99px', background: 'linear-gradient(90deg,#12A594,#0B7F72)' }}></div>
            <div style={{ position: 'absolute', right: '-4px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,.2)', border: '2px solid #0B7F72' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: '#9A8B76' }}><span>0</span><span>Max</span></div>
        </div>

        <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', border: '1px solid rgba(30,24,16,.06)', borderRadius: '16px', padding: '14px 16px' }}>
            <svg width="15" height="17" viewBox="0 0 24 24" fill="#F7931A"><path d="M13 2L3 14h7l-1 8L21 10h-7l-1-8z" /></svg>
            <span style={{ fontSize: '13.5px', color: '#1E1810', fontWeight: '600' }}>Arrives instantly via Lightning</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(244,85,46,.07)', border: '1px solid rgba(244,85,46,.2)', borderRadius: '16px', padding: '14px 16px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#F4552E" strokeWidth="2" /><path d="M12 7v6M12 16.5v.5" stroke="#F4552E" strokeWidth="2" strokeLinecap="round" /></svg>
            <span style={{ fontSize: '13px', lineHeight: '1.4', color: '#B23A1E' }}>Withdrawing your full balance removes you from this week’s draw.</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 24px 40px', background: '#FBF5EC' }}>
        <div style={{ textAlign: 'center', background: '#1E1810', borderRadius: '18px', padding: '18px', fontSize: '17px', fontWeight: '700', color: '#fff' }}>Withdraw ₿0.025</div>
      </div>
    </div>
  );
}
