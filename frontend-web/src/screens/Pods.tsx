export default function Pods() {
  return (
    <div className="scr" style={{ background: '#FBF5EC' }}>
      <div style={{ flex: '1', overflow: 'auto', padding: '62px 20px 96px' }}>
        <h2 className="disp" style={{ margin: '0 0 4px', fontSize: '30px', fontWeight: '800', color: '#1E1810', letterSpacing: '-.8px' }}>Pods</h2>
        <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#6B5D4C' }}>Pool your shares with friends. Bigger combined odds, prizes split evenly on-chain.</p>

        <div style={{ borderRadius: '24px', overflow: 'hidden', background: '#fff', border: '1px solid rgba(30,24,16,.06)', boxShadow: '0 4px 20px rgba(120,80,20,.05)' }}>
          <div style={{ background: 'linear-gradient(135deg,#0E9E8E,#0B7F72)', padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '.8px', color: 'rgba(255,255,255,.85)' }}>YOUR POD</span>
              <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#fff', background: 'rgba(255,255,255,.2)', padding: '4px 10px', borderRadius: '999px' }}>8 members</span>
            </div>
            <div className="disp" style={{ fontSize: '24px', fontWeight: '800', color: '#fff', letterSpacing: '-.5px', marginTop: '8px' }}>Diamond Hands</div>
            <div style={{ display: 'flex', marginTop: '14px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFB84D', border: '2px solid #0B8578', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#7A4A12' }}>S</div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFCE8A', border: '2px solid #0B8578', marginLeft: '-9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#7A4A12' }}>M</div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFE0B0', border: '2px solid #0B8578', marginLeft: '-9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#7A4A12' }}>J</div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F4552E', border: '2px solid #0B8578', marginLeft: '-9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#fff' }}>K</div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,.25)', border: '2px solid #0B8578', marginLeft: '-9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff' }}>+4</div>
            </div>
          </div>
          <div style={{ display: 'flex', padding: '16px 20px' }}>
            <div style={{ flex: '1' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#9A8B76' }}>COMBINED SHARES</div>
              <div className="disp" style={{ fontSize: '22px', fontWeight: '800', color: '#1E1810', marginTop: '2px' }}>41,200</div>
            </div>
            <div style={{ width: '1px', background: 'rgba(30,24,16,.08)' }}></div>
            <div style={{ flex: '1', paddingLeft: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#9A8B76' }}>POOLED ODDS</div>
              <div className="disp" style={{ fontSize: '22px', fontWeight: '800', color: '#0E9E8E', marginTop: '2px' }}>12.4%</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '14px', background: 'rgba(14,158,142,.08)', border: '1px solid rgba(14,158,142,.18)', borderRadius: '18px', padding: '15px 16px', fontSize: '13.5px', lineHeight: '1.45', color: '#0B6F63' }}>
          <b>Fair split.</b> If any pod member wins, the prize is divided by share weight and settled to every member automatically.
        </div>

        <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#9A8B76', letterSpacing: '.5px', margin: '22px 0 10px' }}>DISCOVER PODS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', border: '1px solid rgba(30,24,16,.06)', borderRadius: '16px', padding: '13px 15px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(150deg,#FFE0B0,#FFB84D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800', color: '#E8620A' }} className="disp">₿</div>
            <div style={{ flex: '1' }}><div style={{ fontSize: '15px', fontWeight: '700', color: '#1E1810' }}>Sat Stackers</div><div style={{ fontSize: '12.5px', color: '#6B5D4C' }}>124 members · 9.1% pooled</div></div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#E8620A' }}>Join</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', border: '1px solid rgba(30,24,16,.06)', borderRadius: '16px', padding: '13px 15px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(150deg,#CDECE8,#0E9E8E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800', color: '#fff' }} className="disp">◇</div>
            <div style={{ flex: '1' }}><div style={{ fontSize: '15px', fontWeight: '700', color: '#1E1810' }}>HODL Club</div><div style={{ fontSize: '12.5px', color: '#6B5D4C' }}>57 members · 6.8% pooled</div></div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#E8620A' }}>Join</div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '14px 20px 34px', background: 'linear-gradient(0deg,#FBF5EC 70%,transparent)' }}>
        <div style={{ textAlign: 'center', background: 'linear-gradient(135deg,#FFB443,#F7931A 55%,#EE6B12)', borderRadius: '18px', padding: '17px', fontSize: '16px', fontWeight: '700', color: '#fff', boxShadow: '0 12px 26px rgba(238,107,18,.34)' }}>Create a pod</div>
      </div>
    </div>
  );
}
