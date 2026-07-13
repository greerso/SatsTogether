// SatsTogether prototype — client glue for Flow UI + session ledger APIs.
// Hero / pod / streak reflect live session data (not fake marketing numbers).

const $ = (id) => document.getElementById(id);
const logEl = $('log');

// Escape user-controlled strings (account ids) before innerHTML. Account names
// are arbitrary and can arrive via session import, so unescaped injection = XSS.
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
const AVATAR_COLORS = ['#FFB84D', '#FFCE8A', '#FFE0B0', '#F4552E', '#12A594', '#F7931A'];

let toastTimer;
function log(msg, ok) {
  const t = new Date().toISOString().slice(11, 19);
  logEl.textContent = '[' + t + '] ' + msg + '\n' + logEl.textContent;
  logEl.className = ok === false ? 'err' : ok === true ? 'ok' : '';
  // Mirror the latest message into a fixed, always-visible toast. Only the
  // single latest string lives here, so aria-live announces just that (the
  // #log node holds full history and must NOT be a live region).
  const toastEl = $('toast');
  if (toastEl) {
    toastEl.textContent = msg;
    toastEl.className = 'show' + (ok === false ? ' err' : ok === true ? ' ok' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.className = '';
    }, 4500);
  }
}

function fmt(n) {
  return Number(n).toLocaleString('en-US');
}

function btc(sats) {
  return '₿' + (Number(sats) / 1e8).toLocaleString('en-US', { maximumFractionDigits: 8 });
}

function shortHash(h) {
  if (!h || h.length < 16) return h || '—';
  return h.slice(0, 10) + '…' + h.slice(-8);
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

async function withBusy(btn, fn) {
  if (!btn) return fn();
  const prev = btn.disabled;
  btn.disabled = true;
  try {
    return await fn();
  } finally {
    btn.disabled = prev;
  }
}

function render(snap) {
  const shares = Number(snap.totalShares || 0);
  const positions = snap.positions || [];
  const draws = snap.draws || [];
  const pool = snap.yieldPoolSats || '0';
  const winnersN = Number($('winners')?.value || 3);

  $('stat-principal').textContent = btc(snap.totalPrincipalSats);
  $('stat-shares').textContent = fmt(snap.totalShares) + ' shares';
  $('stat-pool').textContent = fmt(pool) + ' sats';
  $('stat-epoch').textContent = String(snap.epoch);
  $('draw-pool').textContent = fmt(pool) + ' sats';
  $('yield-hint').textContent = fmt(pool) + ' sats';

  // Hero — live session prize pool
  $('hero-pool-btc').textContent = btc(pool);
  $('hero-pool-sub').textContent =
    fmt(pool) + ' sats · only yield funds prizes · principal never at risk in this sim';
  $('hero-shares').textContent = fmt(shares);
  $('hero-accounts').textContent = String(positions.length);
  $('hero-epoch').textContent = String(snap.epoch);
  $('hero-winners-badge').textContent = 'up to ' + winnersN + ' winners';
  if (draws.length) {
    const last = draws[draws.length - 1];
    $('hero-last').textContent = last.winners.length ? last.winners.length + 'w' : '0';
  } else {
    $('hero-last').textContent = '—';
  }

  // Odds for deposit account
  const acct = $('dep-account').value.trim();
  const mine = positions.find((p) => p.account === acct);
  const odds =
    shares > 0 && mine ? ((Number(mine.shareCount) / shares) * 100).toFixed(1) + '%' : '—';
  $('stat-odds').textContent = odds;
  $('pod-odds').textContent = odds;

  // Withdraw available
  const wacct = $('wd-account').value.trim();
  const wpos = positions.find((p) => p.account === wacct);
  $('wd-available').textContent = wpos ? fmt(wpos.principalSats) + ' sats' : '0 sats';

  // Positions table
  $('positions').innerHTML = positions.length
    ? '<table><tr><th>account</th><th>start</th><th>shares</th><th>principal</th></tr>' +
      positions
        .map(
          (p) =>
            '<tr><td>' +
            esc(p.account) +
            '</td><td class="mono">' +
            p.startIndex +
            '</td><td>' +
            fmt(p.shareCount) +
            '</td><td>' +
            fmt(p.principalSats) +
            '</td></tr>',
        )
        .join('') +
      '</table>'
    : 'No positions yet — deposit to mint SatsShares.';

  // Draws table (include owners + byAccount)
  $('draws').innerHTML = draws.length
    ? '<table><tr><th>epoch</th><th>winners</th><th>by account</th><th>allocated</th></tr>' +
      draws
        .slice()
        .reverse()
        .map((d) => {
          const details = d.winnerDetails;
          const winLabel = details && details.length
            ? details.map((w) => w.index + (w.account ? '→' + esc(w.account) : '')).join(', ')
            : d.winners.length
              ? d.winners.join(', ')
              : '—';
          const by = d.byAccount
            ? Object.entries(d.byAccount)
                .map(([k, v]) => esc(k) + ':' + fmt(v))
                .join(' · ')
            : '—';
          return (
            '<tr><td>' +
            d.epoch +
            '</td><td class="mono">' +
            winLabel +
            '</td><td class="mono">' +
            by +
            '</td><td class="win">' +
            fmt(d.allocated) +
            ' sats</td></tr>'
          );
        })
        .join('') +
      '</table>'
    : 'No draws yet';

  // Session streak = epochs run (honest)
  const ep = Number(snap.epoch || 0);
  $('streak-title').textContent = ep + ' draw' + (ep === 1 ? '' : 's') + ' this session';
  $('streak-sub').textContent =
    ep === 0 ? 'Run a testnet draw to grow history' : 'Each epoch is one offline draw against live tip hashes';
  $('streak-bar').style.width = Math.min(100, ep * 20) + '%';

  // Session pod from real accounts
  $('pod-members').textContent = positions.length + ' member' + (positions.length === 1 ? '' : 's');
  $('pod-shares').textContent = fmt(shares);
  const av = $('pod-avatars');
  av.innerHTML = '';
  positions.slice(0, 6).forEach((p, i) => {
    const el = document.createElement('div');
    el.className = 'a';
    el.style.background = AVATAR_COLORS[i % AVATAR_COLORS.length];
    if (i === 3) el.style.color = '#fff';
    el.textContent = (p.account || '?').slice(0, 1).toUpperCase();
    el.title = p.account;
    av.appendChild(el);
  });
  if (positions.length > 6) {
    const more = document.createElement('div');
    more.className = 'a';
    more.style.background = 'rgba(255,255,255,.25)';
    more.style.color = '#fff';
    more.style.fontSize = '11px';
    more.textContent = '+' + (positions.length - 6);
    av.appendChild(more);
  }
  if (!positions.length) {
    const empty = document.createElement('div');
    empty.className = 'a';
    empty.style.background = 'rgba(255,255,255,.2)';
    empty.style.color = '#fff';
    empty.textContent = '·';
    av.appendChild(empty);
  }

  // Claim balances
  const claims = snap.claimBalances || {};
  const claimEntries = Object.entries(claims).filter(([, v]) => Number(v) > 0);
  const claimsEl = $('claims');
  if (claimsEl) {
    claimsEl.innerHTML = claimEntries.length
      ? '<table><tr><th>account</th><th>claimable (sim)</th></tr>' +
        claimEntries
          .map(([k, v]) => '<tr><td>' + esc(k) + '</td><td class="win">' + fmt(v) + ' sats</td></tr>')
          .join('') +
        '</table>'
      : 'No claim credits';
  }

  // Seed commit status
  const cs = $('commit-status');
  if (cs) {
    if (snap.seedCommit && snap.seedCommit.hashHex) {
      cs.textContent =
        'Committed sha256=' +
        snap.seedCommit.hashHex.slice(0, 16) +
        '… · draw must reveal same seed';
    } else {
      cs.textContent = 'No commitment — free seed allowed at draw';
    }
  }
}

function showDrawResult(body) {
  const box = $('draw-result');
  const el = $('draw-result-body');
  if (!box || !el) return;
  box.hidden = false;
  const owners = (body.draw.winnerDetails || [])
    .map((w) => w.index + (w.account ? '→' + w.account : ''))
    .join(', ');
  el.textContent =
    'epoch ' +
    body.draw.epoch +
    '\nwinners [' +
    (owners || body.draw.winners.join(', ')) +
    ']\nallocated ' +
    fmt(body.draw.allocated) +
    ' sats' +
    '\n' +
    body.chain.network +
    ' heights ' +
    body.chain.heights.n +
    ' / ' +
    body.chain.heights.n1 +
    '\nhash n  ' +
    shortHash(body.chain.hashes.n) +
    '\nhash n1 ' +
    shortHash(body.chain.hashes.n1);
}

async function refresh() {
  const body = await api('/api/session');
  render(body.snapshot);
  return body;
}

function updateSharePreview() {
  const sats = Number($('dep-sats').value || 0);
  const n = Math.floor(sats / 1000);
  $('dep-shares-preview').textContent = fmt(n) + ' SatsShares';
}

$('dep-sats').addEventListener('input', updateSharePreview);
$('dep-account').addEventListener('input', () => refresh().catch(() => {}));
$('wd-account').addEventListener('input', () => refresh().catch(() => {}));
$('winners').addEventListener('input', () => {
  const n = Number($('winners').value || 0);
  $('hero-winners-badge').textContent = 'up to ' + n + ' winners';
});

$('dep-quick').addEventListener('click', (e) => {
  const t = e.target.closest('[data-sats]');
  if (!t) return;
  $('dep-sats').value = t.getAttribute('data-sats');
  updateSharePreview();
});

$('btn-refresh').onclick = () =>
  withBusy($('btn-refresh'), async () => {
    try {
      await refresh();
      log('Refreshed', true);
    } catch (e) {
      log(String(e), false);
    }
  });

$('btn-reset').onclick = () =>
  withBusy($('btn-reset'), async () => {
    try {
      const body = await api('/api/session/reset', { method: 'POST', body: '{}' });
      render(body.snapshot);
      $('draw-result').hidden = true;
      log('Session reset', true);
    } catch (e) {
      log(String(e), false);
    }
  });

$('btn-demo').onclick = () =>
  withBusy($('btn-demo'), async () => {
    try {
      log('Running demo walkthrough (reset → multi-user → yield → testnet draw)…');
      const body = await api('/api/session/demo', {
        method: 'POST',
        body: JSON.stringify({
          network: $('network').value,
          numWinners: Number($('winners').value),
          userSeed: 'overnight-demo',
        }),
      });
      render(body.snapshot);
      if (body.soft_fail) {
        log('Demo deposits applied; draw SOFT FAIL: ' + body.error, false);
        return;
      }
      showDrawResult(body);
      log(
        'Demo done — epoch ' +
          body.draw.epoch +
          ' winners=[' +
          (body.draw.winnerDetails || [])
            .map((w) => w.index + '→' + (w.account || '?'))
            .join(', ') +
          ']',
        true,
      );
    } catch (e) {
      log(String(e), false);
    }
  });

$('btn-deposit').onclick = () =>
  withBusy($('btn-deposit'), async () => {
    try {
      const body = await api('/api/session/deposit', {
        method: 'POST',
        body: JSON.stringify({ account: $('dep-account').value, principalSats: $('dep-sats').value }),
      });
      render(body.snapshot);
      if ($('wd-account').value.trim() === '') $('wd-account').value = body.position.account;
      log(
        'Deposited ' +
          fmt(body.position.principalSats) +
          ' sats → ' +
          body.position.shareCount +
          ' shares for ' +
          body.position.account,
        true,
      );
    } catch (e) {
      log(String(e), false);
    }
  });

$('btn-accrue').onclick = () =>
  withBusy($('btn-accrue'), async () => {
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
  });

$('btn-withdraw').onclick = () =>
  withBusy($('btn-withdraw'), async () => {
    try {
      const amountRaw = $('wd-amount') ? $('wd-amount').value.trim() : '';
      const payload = { account: $('wd-account').value };
      if (amountRaw) payload.principalSats = amountRaw;
      const body = await api('/api/session/withdraw', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      render(body.snapshot);
      log(
        'Withdrew ' +
          fmt(body.principalSats) +
          ' sats principal; remaining ' +
          fmt(body.remainingPrincipal),
        true,
      );
    } catch (e) {
      log(String(e), false);
    }
  });

$('btn-draw').onclick = () =>
  withBusy($('btn-draw'), async () => {
    try {
      // Auto-commit if server requires reveal and we have no open commit.
      const sess = await api('/api/session');
      if (!sess.snapshot.seedCommit) {
        log('Committing seed before draw (commit-reveal)…');
        await api('/api/session/commit', {
          method: 'POST',
          body: JSON.stringify({ seed: $('seed').value }),
        });
      }
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
      showDrawResult(body);
      log(
        'Draw epoch ' +
          body.draw.epoch +
          ' winners=[' +
          body.draw.winners.join(',') +
          '] heights ' +
          body.chain.heights.n +
          '/' +
          body.chain.heights.n1,
        true,
      );
    } catch (e) {
      log(String(e), false);
    }
  });

$('btn-claim').onclick = () =>
  withBusy($('btn-claim'), async () => {
    try {
      const amountRaw = $('claim-amount') ? $('claim-amount').value.trim() : '';
      const payload = { account: $('claim-account').value };
      if (amountRaw) payload.amountSats = amountRaw;
      const body = await api('/api/session/claim', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      render(body.snapshot);
      log(
        'Claimed ' + fmt(body.claimedSats) + ' sats (sim); remaining ' + fmt(body.remaining),
        true,
      );
    } catch (e) {
      log(String(e), false);
    }
  });

$('btn-commit').onclick = () =>
  withBusy($('btn-commit'), async () => {
    try {
      const body = await api('/api/session/commit', {
        method: 'POST',
        body: JSON.stringify({ seed: $('seed').value }),
      });
      render(body.snapshot);
      log('Seed committed ' + body.commit.hashHex.slice(0, 20) + '…', true);
    } catch (e) {
      log(String(e), false);
    }
  });

$('btn-export').onclick = () =>
  withBusy($('btn-export'), async () => {
    try {
      const body = await api('/api/session/export');
      const text = JSON.stringify(body, null, 2);
      const out = $('export-out');
      out.hidden = false;
      out.textContent = text;
      const blob = new Blob([text], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'satstogether-session.json';
      a.click();
      URL.revokeObjectURL(a.href);
      log('Exported session JSON', true);
    } catch (e) {
      log(String(e), false);
    }
  });

if ($('btn-export-csv')) {
  $('btn-export-csv').onclick = () =>
    withBusy($('btn-export-csv'), async () => {
      try {
        const res = await fetch('/api/session/export.csv', { credentials: 'same-origin' });
        if (!res.ok) throw new Error('CSV export failed: ' + res.status);
        const text = await res.text();
        const blob = new Blob([text], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'satstogether-session.csv';
        a.click();
        URL.revokeObjectURL(a.href);
        log('Downloaded prototype CSV (not tax advice)', true);
      } catch (e) {
        log(String(e), false);
      }
    });
}

$('import-file').addEventListener('change', async (ev) => {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const snapshot = parsed.snapshot || parsed;
    const body = await api('/api/session/import', {
      method: 'POST',
      body: JSON.stringify({ snapshot }),
    });
    render(body.snapshot);
    log('Imported session snapshot', true);
  } catch (e) {
    log(String(e), false);
  } finally {
    ev.target.value = '';
  }
});

updateSharePreview();
refresh().catch((e) => log(String(e), false));
