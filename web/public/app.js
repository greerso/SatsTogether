// SatsTogether prototype — client glue. Wires the design UI to the real
// session-ledger + testnet-draw API. Illustrative cards (pods, streak, APY,
// countdown) are static in index.html and intentionally not wired.

const $ = (id) => document.getElementById(id);
const logEl = $('log');

function log(msg, ok) {
  const t = new Date().toISOString().slice(11, 19);
  logEl.textContent = '[' + t + '] ' + msg + '\n' + logEl.textContent;
  logEl.className = ok === false ? 'err' : ok === true ? 'ok' : '';
}

function fmt(n) {
  return Number(n).toLocaleString('en-US');
}
function btc(sats) {
  return '₿' + (Number(sats) / 1e8).toLocaleString('en-US', { maximumFractionDigits: 8 });
}

async function api(path, opts) {
  const res = await fetch(
    path,
    Object.assign({ credentials: 'same-origin', headers: { 'content-type': 'application/json' } }, opts || {}),
  );
  const body = await res.json();
  if (!res.ok || (body.ok === false && !body.soft_fail)) {
    throw new Error(body.error || 'HTTP ' + res.status);
  }
  return body;
}

function render(snap) {
  const shares = Number(snap.totalShares || 0);
  $('stat-principal').textContent = btc(snap.totalPrincipalSats);
  $('stat-shares').textContent = fmt(snap.totalShares) + ' shares';
  $('stat-pool').textContent = fmt(snap.yieldPoolSats) + ' sats';
  $('stat-epoch').textContent = String(snap.epoch);
  $('draw-pool').textContent = fmt(snap.yieldPoolSats) + ' sats';

  const positions = snap.positions || [];
  // "Win odds" (est.): the active deposit account's share of the pool.
  const acct = $('dep-account').value.trim();
  const mine = positions.find((p) => p.account === acct);
  $('stat-odds').textContent =
    shares > 0 && mine ? ((Number(mine.shareCount) / shares) * 100).toFixed(1) + '%' : '—';

  // "Available to withdraw": the withdraw account's principal.
  const wacct = $('wd-account').value.trim();
  const wpos = positions.find((p) => p.account === wacct);
  $('wd-available').textContent = wpos ? fmt(wpos.principalSats) + ' sats' : '0 sats';

  const draws = snap.draws || [];
  $('draws').innerHTML = draws.length
    ? '<table><tr><th>epoch</th><th>winners</th><th>allocated</th></tr>' +
      draws
        .slice()
        .reverse()
        .map(
          (d) =>
            '<tr><td>' +
            d.epoch +
            '</td><td class="mono">' +
            (d.winners.length ? d.winners.join(', ') : '—') +
            '</td><td class="win">' +
            fmt(d.allocated) +
            ' sats</td></tr>',
        )
        .join('') +
      '</table>'
    : 'No draws yet';
}

async function refresh() {
  const body = await api('/api/session');
  render(body.snapshot);
  return body;
}

// live SatsShares preview on the deposit card
function updateSharePreview() {
  const sats = Number($('dep-sats').value || 0);
  const n = Math.floor(sats / 1000);
  $('dep-shares-preview').textContent = fmt(n) + ' SatsShares';
}
$('dep-sats').addEventListener('input', updateSharePreview);

$('btn-refresh').onclick = async () => {
  try {
    await refresh();
    log('Refreshed', true);
  } catch (e) {
    log(String(e), false);
  }
};
$('btn-reset').onclick = async () => {
  try {
    const body = await api('/api/session/reset', { method: 'POST', body: '{}' });
    render(body.snapshot);
    log('Session reset', true);
  } catch (e) {
    log(String(e), false);
  }
};
$('btn-deposit').onclick = async () => {
  try {
    const body = await api('/api/session/deposit', {
      method: 'POST',
      body: JSON.stringify({ account: $('dep-account').value, principalSats: $('dep-sats').value }),
    });
    render(body.snapshot);
    log('Deposited ' + fmt(body.position.principalSats) + ' sats → ' + body.position.shareCount + ' shares for ' + body.position.account, true);
  } catch (e) {
    log(String(e), false);
  }
};
$('btn-accrue').onclick = async () => {
  try {
    const body = await api('/api/session/accrue', {
      method: 'POST',
      body: JSON.stringify({ amountSats: $('acc-sats').value }),
    });
    render(body.snapshot);
    log('Accrued yield; pool=' + fmt(body.snapshot.yieldPoolSats) + ' sats', true);
  } catch (e) {
    log(String(e), false);
  }
};
$('btn-withdraw').onclick = async () => {
  try {
    const body = await api('/api/session/withdraw', {
      method: 'POST',
      body: JSON.stringify({ account: $('wd-account').value }),
    });
    render(body.snapshot);
    log('Withdrew ' + fmt(body.principalSats) + ' sats principal', true);
  } catch (e) {
    log(String(e), false);
  }
};
$('btn-draw').onclick = async () => {
  try {
    log('Fetching ' + $('network').value + ' tip hashes…');
    const body = await api('/api/session/draw', {
      method: 'POST',
      body: JSON.stringify({
        network: $('network').value,
        numWinners: Number($('winners').value),
        userSeed: $('seed').value,
      }),
    });
    if (body.soft_fail) {
      log('SOFT FAIL network: ' + body.error, false);
      return;
    }
    render(body.snapshot);
    log(
      'Draw epoch ' + body.draw.epoch + ' winners=[' + body.draw.winners.join(',') + '] heights ' +
        body.chain.heights.n + '/' + body.chain.heights.n1,
      true,
    );
  } catch (e) {
    log(String(e), false);
  }
};

updateSharePreview();
refresh().catch((e) => log(String(e), false));
