export default function DesktopDashboard() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#FBF5EC', fontFamily: "'Instrument Sans',system-ui,sans-serif" }}>

      {/* sidebar */}
      <div style={{ width: '248px', flexShrink: '0', background: '#fff', borderRight: '1px solid rgba(30,24,16,.07)', display: 'flex', flexDirection: 'column', padding: '26px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px 26px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(150deg,#FFB443,#F7931A 55%,#EE6B12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '19px' }} className="disp">₿</div>
          <span className="disp" style={{ fontSize: '19px', fontWeight: '700', color: '#1E1810', letterSpacing: '-.4px' }}>SatsTogether</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '13px', background: 'rgba(247,147,26,.12)', color: '#E8620A', fontWeight: '700', fontSize: '14.5px', marginBottom: '4px' }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-8z" fill="#E8620A" /></svg>Home
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '13px', color: '#6B5D4C', fontWeight: '600', fontSize: '14.5px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="#8A7B66" strokeWidth="2" /><path d="M12 8v4l3 2" stroke="#8A7B66" strokeWidth="2" strokeLinecap="round" /></svg>Weekly Draw
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '13px', color: '#6B5D4C', fontWeight: '600', fontSize: '14.5px' }}>
          <svg width="20" height="18" viewBox="0 0 24 24" fill="none"><circle cx="8" cy="9" r="3" stroke="#8A7B66" strokeWidth="2" /><circle cx="16" cy="9" r="3" stroke="#8A7B66" strokeWidth="2" /><path d="M3 19c0-2.8 2.2-5 5-5s5 2.2 5 5M13 19c0-2.8 2.2-5 5-5s3 1 3 3" stroke="#8A7B66" strokeWidth="2" strokeLinecap="round" /></svg>Pods
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '13px', color: '#6B5D4C', fontWeight: '600', fontSize: '14.5px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="#8A7B66" strokeWidth="2" strokeLinecap="round" /></svg>Activity
        </div>
        <div style={{ flex: '1' }}></div>
        <div style={{ background: 'linear-gradient(150deg,#FFF3E0,#FFE7CC)', borderRadius: '16px', padding: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: '#7A4A12' }}><svg width="15" height="17" viewBox="0 0 24 26" fill="none"><path d="M12 1c1.5 4-2 5.5-2 9a4 4 0 108 0c0-1.2-.4-2.3-1-3.2C18.5 9 20 12 20 15a8 8 0 11-16 0c0-5 4-8 8-14z" fill="#E8620A" /></svg>42-day streak</div>
          <div style={{ fontSize: '12px', color: '#8A5A1E', marginTop: '5px' }}>3 days to your next badge</div>
        </div>
      </div>

      {/* main */}
      <div style={{ flex: '1', overflow: 'auto', padding: '28px 34px' }}>
        {/* topbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#9A8B76', fontWeight: '500' }}>Good morning</div>
            <div className="disp" style={{ fontSize: '26px', fontWeight: '700', color: '#1E1810', letterSpacing: '-.6px' }}>Satoshi</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid rgba(30,24,16,.08)', padding: '10px 16px', borderRadius: '13px', fontSize: '14px', fontWeight: '600', color: '#1E1810' }}>Withdraw</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg,#FFB443,#F7931A 55%,#EE6B12)', padding: '10px 18px', borderRadius: '13px', fontSize: '14px', fontWeight: '700', color: '#fff', boxShadow: '0 8px 18px rgba(238,107,18,.3)' }}><svg width="13" height="15" viewBox="0 0 24 24" fill="#fff"><path d="M13 2L3 14h7l-1 8L21 10h-7l-1-8z" /></svg>Deposit</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          {/* left column */}
          <div style={{ flex: '1.6', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* prize pool hero */}
            <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', background: 'linear-gradient(120deg,#FFB84D,#F7931A 48%,#E8620A)', padding: '28px 30px', boxShadow: '0 18px 40px rgba(238,107,18,.28)' }}>
              <div style={{ position: 'absolute', top: '-50px', right: '-30px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,.3),transparent 70%)' }}></div>
              <div style={{ position: 'relative', zIndex: '2', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'rgba(255,255,255,.9)', letterSpacing: '.4px' }}>THIS WEEK’S PRIZE POOL</div>
                  <div className="disp" style={{ fontSize: '62px', fontWeight: '800', color: '#fff', letterSpacing: '-2.2px', lineHeight: '1', marginTop: '6px', textShadow: '0 2px 10px rgba(150,50,0,.2)' }}>₿0.84</div>
                  <div style={{ fontSize: '15px', color: 'rgba(255,255,255,.92)', marginTop: '6px' }}>≈ $92,400 · split across 12 winners</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ background: 'rgba(255,255,255,.18)', borderRadius: '12px', padding: '10px 12px', textAlign: 'center', minWidth: '52px' }}><div className="disp" style={{ fontSize: '24px', fontWeight: '800', color: '#fff', lineHeight: '1' }}>02</div><div style={{ fontSize: '10px', color: 'rgba(255,255,255,.75)', fontWeight: '600', marginTop: '3px' }}>DAYS</div></div>
                    <div style={{ background: 'rgba(255,255,255,.18)', borderRadius: '12px', padding: '10px 12px', textAlign: 'center', minWidth: '52px' }}><div className="disp" style={{ fontSize: '24px', fontWeight: '800', color: '#fff', lineHeight: '1' }}>14</div><div style={{ fontSize: '10px', color: 'rgba(255,255,255,.75)', fontWeight: '600', marginTop: '3px' }}>HRS</div></div>
                    <div style={{ background: 'rgba(255,255,255,.18)', borderRadius: '12px', padding: '10px 12px', textAlign: 'center', minWidth: '52px' }}><div className="disp" style={{ fontSize: '24px', fontWeight: '800', color: '#fff', lineHeight: '1' }}>06</div><div style={{ fontSize: '10px', color: 'rgba(255,255,255,.75)', fontWeight: '600', marginTop: '3px' }}>MIN</div></div>
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,.85)', marginTop: '10px' }}>until the next draw</div>
                </div>
              </div>
            </div>

            {/* recent winners */}
            <div style={{ background: '#fff', border: '1px solid rgba(30,24,16,.06)', borderRadius: '22px', padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div className="disp" style={{ fontSize: '17px', fontWeight: '700', color: '#1E1810' }}>Recent draws</div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#E8620A' }}>View all</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(30,24,16,.06)' }}>
                  <div style={{ flex: '1', fontSize: '14px', fontWeight: '600', color: '#1E1810' }}>Epoch #41 · Jul 5</div>
                  <div style={{ flex: '1', fontSize: '13px', color: '#6B5D4C' }}>12 winners</div>
                  <div style={{ flex: '1', fontSize: '13px', color: '#6B5D4C' }}>block #901,308</div>
                  <div className="disp" style={{ fontSize: '15px', fontWeight: '700', color: '#0E9E8E' }}>₿0.79</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(30,24,16,.06)' }}>
                  <div style={{ flex: '1', fontSize: '14px', fontWeight: '600', color: '#1E1810' }}>Epoch #40 · Jun 28</div>
                  <div style={{ flex: '1', fontSize: '13px', color: '#6B5D4C' }}>11 winners</div>
                  <div style={{ flex: '1', fontSize: '13px', color: '#6B5D4C' }}>block #900,297</div>
                  <div className="disp" style={{ fontSize: '15px', fontWeight: '700', color: '#0E9E8E' }}>₿0.81</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>
                  <div style={{ flex: '1', fontSize: '14px', fontWeight: '600', color: '#1E1810' }}>Epoch #39 · Jun 21</div>
                  <div style={{ flex: '1', fontSize: '13px', color: '#6B5D4C' }}>12 winners</div>
                  <div style={{ flex: '1', fontSize: '13px', color: '#6B5D4C' }}>block #899,281</div>
                  <div className="disp" style={{ fontSize: '15px', fontWeight: '700', color: '#0E9E8E' }}>₿0.76</div>
                </div>
              </div>
            </div>
          </div>

          {/* right column */}
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#fff', border: '1px solid rgba(30,24,16,.06)', borderRadius: '22px', padding: '22px 24px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#9A8B76', letterSpacing: '.4px' }}>YOUR SAVINGS</div>
              <div className="disp" style={{ fontSize: '38px', fontWeight: '800', color: '#1E1810', letterSpacing: '-1.2px', marginTop: '4px' }}>₿0.025</div>
              <div style={{ fontSize: '14px', color: '#6B5D4C' }}>2,500 SatsShares · ≈ $2,750</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '12px', fontWeight: '700', color: '#0E9E8E', background: 'rgba(14,158,142,.1)', padding: '5px 11px', borderRadius: '999px' }}><span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0E9E8E' }}></span>No-loss — principal protected</div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: '1', background: '#fff', border: '1px solid rgba(30,24,16,.06)', borderRadius: '20px', padding: '18px 20px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#9A8B76' }}>WIN ODDS</div>
                <div className="disp" style={{ fontSize: '28px', fontWeight: '800', color: '#E8620A', letterSpacing: '-.8px', marginTop: '3px' }}>3.2%</div>
                <div style={{ fontSize: '12.5px', color: '#6B5D4C' }}>≈ 1 in 31</div>
              </div>
              <div style={{ flex: '1', background: '#fff', border: '1px solid rgba(30,24,16,.06)', borderRadius: '20px', padding: '18px 20px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#9A8B76' }}>YIELD APY</div>
                <div className="disp" style={{ fontSize: '28px', fontWeight: '800', color: '#1E1810', letterSpacing: '-.8px', marginTop: '3px' }}>4.1%</div>
                <div style={{ fontSize: '12.5px', color: '#6B5D4C' }}>funds the pool</div>
              </div>
            </div>

            {/* pod card */}
            <div style={{ background: 'linear-gradient(135deg,#12A594,#0B7F72)', borderRadius: '22px', padding: '22px 24px', boxShadow: '0 12px 28px rgba(14,158,142,.24)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '.6px', color: 'rgba(255,255,255,.85)' }}>YOUR POD</span>
                <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#fff', background: 'rgba(255,255,255,.2)', padding: '4px 10px', borderRadius: '999px' }}>8 members</span>
              </div>
              <div className="disp" style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginTop: '8px' }}>Diamond Hands</div>
              <div style={{ display: 'flex', gap: '24px', marginTop: '14px' }}>
                <div><div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,.8)' }}>Combined</div><div className="disp" style={{ fontSize: '19px', fontWeight: '800', color: '#fff' }}>41,200</div></div>
                <div><div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,.8)' }}>Pooled odds</div><div className="disp" style={{ fontSize: '19px', fontWeight: '800', color: '#fff' }}>12.4%</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
