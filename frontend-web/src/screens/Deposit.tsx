export default function Deposit() {
  return (
    <div className="scr" style={{ background: '#FBF5EC' }}>
      <div style={{ flex: '1', overflow: 'auto', padding: '66px 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', border: '1px solid rgba(30,24,16,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="11" height="18" viewBox="0 0 12 20"><path d="M10 2L2 10l8 8" stroke="#1E1810" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#0E9E8E', background: 'rgba(14,158,142,.1)', padding: '6px 12px', borderRadius: '999px' }}>Step 1 of 2</span>
        </div>

        <h2 className="disp" style={{ margin: '18px 0 4px', fontSize: '30px', fontWeight: '800', color: '#1E1810', letterSpacing: '-.8px' }}>Add Bitcoin</h2>
        <p style={{ margin: '0 0 22px', fontSize: '14px', color: '#6B5D4C' }}>Every 1,000 sats mints one SatsShare — your ticket to the weekly draw.</p>

        <div style={{ background: '#fff', borderRadius: '24px', padding: '26px 22px', border: '1px solid rgba(30,24,16,.06)', boxShadow: '0 4px 20px rgba(120,80,20,.05)' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#9A8B76', marginBottom: '8px' }}>DEPOSIT AMOUNT</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="disp" style={{ fontSize: '52px', fontWeight: '800', color: '#1E1810', letterSpacing: '-2px', lineHeight: '1' }}>0.025</span>
            <span className="disp" style={{ fontSize: '22px', fontWeight: '700', color: '#F7931A' }}>BTC</span>
          </div>
          <div style={{ marginTop: '6px', fontSize: '15px', color: '#6B5D4C' }}>2,500,000 sats · ≈ $2,750</div>
          <div style={{ height: '1px', background: 'rgba(30,24,16,.07)', margin: '18px 0' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', color: '#6B5D4C' }}>You’ll receive</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '6px 12px', background: 'rgba(247,147,26,.12)', borderRadius: '999px', fontSize: '14px', fontWeight: '700', color: '#E8620A' }}>2,500 SatsShares</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '9px', marginTop: '16px' }}>
          <div style={{ flex: '1', textAlign: 'center', padding: '12px 0', background: '#fff', border: '1px solid rgba(30,24,16,.08)', borderRadius: '14px', fontSize: '14px', fontWeight: '600', color: '#6B5D4C' }}>0.01</div>
          <div style={{ flex: '1', textAlign: 'center', padding: '12px 0', background: '#1E1810', borderRadius: '14px', fontSize: '14px', fontWeight: '700', color: '#fff' }}>0.025</div>
          <div style={{ flex: '1', textAlign: 'center', padding: '12px 0', background: '#fff', border: '1px solid rgba(30,24,16,.08)', borderRadius: '14px', fontSize: '14px', fontWeight: '600', color: '#6B5D4C' }}>0.1</div>
          <div style={{ flex: '1', textAlign: 'center', padding: '12px 0', background: '#fff', border: '1px solid rgba(30,24,16,.08)', borderRadius: '14px', fontSize: '14px', fontWeight: '600', color: '#6B5D4C' }}>Max</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '16px', background: 'linear-gradient(120deg,#FFF3E0,#FFE7CC)', borderRadius: '18px', padding: '16px 18px' }}>
          <div className="disp" style={{ fontSize: '30px', fontWeight: '800', color: '#E8620A', lineHeight: '1' }}>3.2%</div>
          <div style={{ fontSize: '13.5px', lineHeight: '1.4', color: '#8A5A1E' }}><b style={{ color: '#7A4A12' }}>Your odds this week.</b> Roughly 1 in 31 to win a prize — odds rise with every share.</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '14px', background: 'rgba(14,158,142,.09)', border: '1px solid rgba(14,158,142,.2)', borderRadius: '18px', padding: '15px 16px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: '0', marginTop: '1px' }}><path d="M12 3l7 3v5c0 4.3-2.9 7.6-7 8.8C7.9 18.6 5 15.3 5 11V6l7-3z" stroke="#0E9E8E" strokeWidth="2" strokeLinejoin="round" /><path d="M9 11.5l2 2 4-4" stroke="#0E9E8E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span style={{ fontSize: '13.5px', lineHeight: '1.45', color: '#0B6F63' }}><b>No-loss guarantee.</b> Withdraw your full 0.025 BTC whenever you like. Only yield feeds the prizes.</span>
        </div>
      </div>

      <div style={{ padding: '14px 24px 40px', background: '#FBF5EC' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px', background: 'linear-gradient(135deg,#FFB443,#F7931A 55%,#EE6B12)', borderRadius: '18px', padding: '18px', fontSize: '17px', fontWeight: '700', color: '#fff', boxShadow: '0 12px 26px rgba(238,107,18,.34)' }}>
          <svg width="15" height="17" viewBox="0 0 24 24" fill="#fff"><path d="M13 2L3 14h7l-1 8L21 10h-7l-1-8z" /></svg>
          Deposit via Lightning
        </div>
      </div>
    </div>
  );
}
