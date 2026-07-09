// ── Utilitaires generaux ────────────────────────────────
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}
async function api(method, url, body) {
  const opts = { method, headers: {} };
  if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  const res = await fetch(url, opts);
  if (!res.ok) {
    let e = {};
    try { e = await res.json(); } catch (err) { /* reponse non-JSON, message par defaut conserve */ }
    throw new Error(e.error || 'Erreur serveur');
  }
  return res.status === 204 ? null : res.json();
}
function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}
function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch (e) { return iso; }
}

// ── En-tete / pied de page communs ──────────────────────
const NAV_LINKS = [
  { href: 'offres.html', label: 'Offres' },
  { href: 'equipe.html', label: 'Notre équipe' },
  { href: 'actualites.html', label: 'Actualités' },
  { href: 'temoignages.html', label: 'Témoignages' },
  { href: 'contact.html', label: 'Contact' }
];

function renderHeader(active) {
  return `
  <header class="site-header">
    <div class="container">
      <a href="index.html"><img class="logo" src="img/logo.png" alt="UpSearch"></a>
      <nav class="nav-links" id="nav-links">
        ${NAV_LINKS.map(l => `<a href="${l.href}" class="${active === l.href ? 'active' : ''}">${l.label}</a>`).join('')}
      </nav>
      <button class="burger" id="burger" aria-label="Menu">&#9776;</button>
    </div>
  </header>`;
}

function renderFooter(contact) {
  contact = contact || {};
  return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <h4>UpSearch</h4>
          <p>Cabinet de recrutement CDI, spécialiste BTP — Réseau Alliance.</p>
        </div>
        <div>
          <h4>Rouen</h4>
          <p>${esc(contact.rouen_adresse || '')}${contact.rouen_adresse ? '<br>' : ''}${esc(contact.rouen_tel || '')}${contact.rouen_tel ? '<br>' : ''}${contact.rouen_email ? `<a href="mailto:${esc(contact.rouen_email)}">${esc(contact.rouen_email)}</a>` : ''}</p>
        </div>
        <div>
          <h4>Amiens</h4>
          <p>${esc(contact.amiens_adresse || '')}${contact.amiens_adresse ? '<br>' : ''}${esc(contact.amiens_tel || '')}${contact.amiens_tel ? '<br>' : ''}${contact.amiens_email ? `<a href="mailto:${esc(contact.amiens_email)}">${esc(contact.amiens_email)}</a>` : ''}</p>
        </div>
        <div>
          <h4>Liens</h4>
          <p><a href="offres.html">Offres d'emploi</a><br><a href="contact.html">Nous contacter</a></p>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} UpSearch — Réseau Alliance</span>
        <span>Mentions légales · Politique de confidentialité</span>
      </div>
    </div>
  </footer>`;
}

async function mountLayout(active) {
  const hm = document.getElementById('header-mount');
  const fm = document.getElementById('footer-mount');
  if (hm) {
    hm.innerHTML = renderHeader(active);
    const burger = document.getElementById('burger');
    if (burger) burger.addEventListener('click', () => {
      document.getElementById('nav-links').classList.toggle('open');
    });
  }
  if (fm) {
    let contact = {};
    try { const s = await api('GET', '/api/data/settings'); contact = s.contact || {}; }
    catch (e) { /* pied de page affiche quand meme, sans coordonnees */ }
    fm.innerHTML = renderFooter(contact);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  mountLayout(document.body.dataset.page || '');
});
