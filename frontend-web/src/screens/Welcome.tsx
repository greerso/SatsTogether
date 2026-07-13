export default function Welcome() {
  return (
    <div className="scr" style={{ background: 'linear-gradient(165deg,#FFB84D 0%,#F7931A 46%,#E8620A 100%)' }}>
      <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,.35),transparent 70%)' }}></div>
      <div style={{ position: 'absolute', bottom: '180px', left: '-70px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,120,0,.4),transparent 70%)' }}></div>

      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', padding: '120px 30px 0', position: 'relative', zIndex: '2' }}>
        <div style={{ position: 'relative', height: '150px', marginBottom: '26px' }}>
          <div style={{ position: 'absolute', left: '96px', top: '8px', width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(150deg,#FFE7B0,#FFC24D)', boxShadow: '0 20px 40px rgba(140,60,0,.35),inset 0 3px 6px rgba(255,255,255,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="disp" style={{ fontSize: '62px', fontWeight: '800', color: '#E8620A' }}>₿</span></div>
          <div style={{ position: 'absolute', left: '26px', top: '56px', width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(150deg,#FFD98A,#FBB03B)', boxShadow: '0 12px 24px rgba(140,60,0,.3),inset 0 2px 4px rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="disp" style={{ fontSize: '34px', fontWeight: '800', color: '#E8620A' }}>₿</span></div>
          <div style={{ position: 'absolute', left: '236px', top: '70px', width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(150deg,#FFD98A,#FBB03B)', boxShadow: '0 10px 20px rgba(140,60,0,.3),inset 0 2px 4px rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="disp" style={{ fontSize: '26px', fontWeight: '800', color: '#E8620A' }}>₿</span></div>
        </div>

        <h2 className="disp" style={{ margin: '0 0 14px', fontSize: '40px', lineHeight: '1.02', fontWeight: '800', color: '#fff', letterSpacing: '-1.2px', textShadow: '0 2px 10px rgba(150,50,0,.25)' }}>The savings account that pays out in prizes.</h2>
        <p style={{ margin: '0', fontSize: '16px', lineHeight: '1.5', color: 'rgba(255,255,255,.92)' }}>Deposit sats, earn yield, and win a slice of the pool every week. Withdraw your full balance anytime.</p>

        <div style={{ marginTop: '26px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'rgba(255,255,255,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5c0 4.3-2.9 7.6-7 8.8C7.9 18.6 5 15.3 5 11V6l7-3z" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/><path d="M9 11.5l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>Principal-protected — you can’t lose it</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'rgba(255,255,255,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0' }}>
              <svg width="16" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M13 2L3 14h7l-1 8L21 10h-7l-1-8z"/></svg>
            </div>
            <span style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>Instant deposits over Lightning</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 30px 40px', position: 'relative', zIndex: '2' }}>
        <div style={{ background: '#fff', borderRadius: '18px', padding: '18px 20px', textAlign: 'center', fontSize: '17px', fontWeight: '700', color: '#E8620A', boxShadow: '0 12px 28px rgba(120,40,0,.28)' }}>Start saving</div>
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,.9)' }}>I already have a wallet</div>
      </div>
    </div>
  );
}
