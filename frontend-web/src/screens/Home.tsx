export default function Home() {
  return (
    <div className="scr" style={{ background: '#FBF5EC' }}>
      <div style={{ flex: '1', overflow: 'auto', padding: '62px 20px 96px' }}>
        {/* top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#9A8B76', fontWeight: '500' }}>Good morning</div>
            <div className="disp" style={{ fontSize: '22px', fontWeight: '700', color: '#1E1810', letterSpacing: '-.5px' }}>Satoshi</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#fff', border: '1px solid rgba(30,24,16,.08)', padding: '7px 13px 7px 9px', borderRadius: '999px' }}>
            <svg width="16" height="18" viewBox="0 0 24 26" fill="none"><path d="M12 1c1.5 4-2 5.5-2 9a4 4 0 108 0c0-1.2-.4-2.3-1-3.2C18.5 9 20 12 20 15a8 8 0 11-16 0c0-5 4-8 8-14z" fill="#F7931A"/></svg>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#1E1810' }}>42</span>
          </div>
        </div>

        {/* prize pool hero */}
        <div style={{ position: 'relative', borderRadius: '26px', overflow: 'hidden', background: 'linear-gradient(155deg,#FFB84D,#F7931A 50%,#E8620A)', padding: '24px 22px 22px', boxShadow: '0 16px 34px rgba(238,107,18,.3)' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,.3),transparent 70%)' }}></div>
          <div style={{ position: 'relative', zIndex: '2' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'rgba(255,255,255,.9)' }}>THIS WEEK’S PRIZE POOL</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#fff', background: 'rgba(255,255,255,.2)', padding: '4px 10px', borderRadius: '999px' }}>12 winners</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '10px' }}>
              <span className="disp" style={{ fontSize: '50px', fontWeight: '800', color: '#fff', letterSpacing: '-1.6px', lineHeight: '1', textShadow: '0 2px 8px rgba(150,50,0,.2)' }}>₿0.84</span>
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,.9)', marginTop: '4px' }}>≈ $92,400 in prizes</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '18px', background: 'rgba(255,255,255,.16)', borderRadius: '14px', padding: '11px 14px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="8" stroke="#fff" strokeWidth="2"/><path d="M12 9v4l2.5 2.5M9 2h6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>Draws in</span>
              <span className="disp" style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginLeft: 'auto' }}>2d 14h 06m</span>
            </div>
          </div>
        </div>

        {/* balance + odds */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
          <div style={{ flex: '1.3', background: '#fff', border: '1px solid rgba(30,24,16,.06)', borderRadius: '20px', padding: '16px 16px 15px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#9A8B76' }}>YOUR SAVINGS</div>
            <div className="disp" style={{ fontSize: '26px', fontWeight: '800', color: '#1E1810', letterSpacing: '-.8px', marginTop: '4px' }}>₿0.025</div>
            <div style={{ fontSize: '13px', color: '#6B5D4C' }}>2,500 shares</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '9px', fontSize: '11.5px', fontWeight: '700', color: '#0E9E8E', background: 'rgba(14,158,142,.1)', padding: '4px 9px', borderRadius: '999px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0E9E8E' }}></span>No-loss
            </div>
          </div>
          <div style={{ flex: '1', background: '#fff', border: '1px solid rgba(30,24,16,.06)', borderRadius: '20px', padding: '16px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#9A8B76' }}>WIN ODDS</div>
            <div className="disp" style={{ fontSize: '26px', fontWeight: '800', color: '#E8620A', letterSpacing: '-.8px', marginTop: '4px' }}>3.2%</div>
            <div style={{ fontSize: '13px', color: '#6B5D4C' }}>≈ 1 in 31</div>
            <div style={{ fontSize: '11.5px', color: '#B08A5B', marginTop: '9px' }}>Deposit more to raise</div>
          </div>
        </div>

        {/* streak card */}
        <div style={{ marginTop: '14px', background: '#fff', border: '1px solid rgba(30,24,16,.06)', borderRadius: '20px', padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: 'linear-gradient(150deg,#FFE0B0,#FFB84D)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="23" viewBox="0 0 24 26" fill="none"><path d="M12 1c1.5 4-2 5.5-2 9a4 4 0 108 0c0-1.2-.4-2.3-1-3.2C18.5 9 20 12 20 15a8 8 0 11-16 0c0-5 4-8 8-14z" fill="#E8620A"/></svg>
              </div>
              <div>
                <div className="disp" style={{ fontSize: '18px', fontWeight: '700', color: '#1E1810' }}>42-day streak</div>
                <div style={{ fontSize: '13px', color: '#6B5D4C' }}>3 days to your next badge</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(247,147,26,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#E8620A' }} title="Saver">S</div>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(14,158,142,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#0E9E8E' }} title="Early Adopter">EA</div>
            </div>
          </div>
          <div style={{ marginTop: '14px', height: '8px', borderRadius: '99px', background: '#F0E7D8', overflow: 'hidden' }}>
            <div style={{ width: '82%', height: '100%', borderRadius: '99px', background: 'linear-gradient(90deg,#FFB443,#EE6B12)' }}></div>
          </div>
        </div>
      </div>

      {/* tab bar */}
      <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', height: '88px', background: 'rgba(251,245,236,.9)', backdropFilter: 'blur(14px)', borderTop: '1px solid rgba(30,24,16,.06)', display: 'flex', padding: '12px 30px 0' }}>
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-8z" fill="#E8620A"/></svg>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#E8620A' }}>Home</span>
        </div>
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="#B7A78E" strokeWidth="2"/><path d="M12 8v4l3 2" stroke="#B7A78E" strokeWidth="2" strokeLinecap="round"/></svg>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#B7A78E' }}>Draw</span>
        </div>
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
          <svg width="24" height="22" viewBox="0 0 24 24" fill="none"><circle cx="8" cy="9" r="3" stroke="#B7A78E" strokeWidth="2"/><circle cx="16" cy="9" r="3" stroke="#B7A78E" strokeWidth="2"/><path d="M3 19c0-2.8 2.2-5 5-5s5 2.2 5 5M13 19c0-2.8 2.2-5 5-5s3 1 3 3" stroke="#B7A78E" strokeWidth="2" strokeLinecap="round"/></svg>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#B7A78E' }}>Pods</span>
        </div>
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#B7A78E" strokeWidth="2"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#B7A78E" strokeWidth="2" strokeLinecap="round"/></svg>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#B7A78E' }}>Profile</span>
        </div>
      </div>
    </div>
  );
}
