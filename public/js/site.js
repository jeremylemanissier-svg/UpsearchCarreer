// ── Utilitaires generaux ────────────────────────────────
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
// Texte libre avec prise en charge d'une syntaxe simple pour insérer une image :
// ![texte alternatif](adresse-de-l-image) -- l'adresse vient de la Médiathèque (admin).
// Le texte est d'abord entièrement échappé (sécurité), puis ce seul motif est transformé en <img>.
function renderRichText(s) {
  let html = esc(s);
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, url) => {
    if (!/^(https?:\/\/|\/uploads\/)/.test(url)) return m;
    return `<img src="${url}" alt="${alt}" style="max-width:100%;border-radius:8px;margin:14px 0;display:block">`;
  });
  return html.replace(/\n/g, '<br>');
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
  let settings = {};
  try { settings = await api('GET', '/api/data/settings'); } catch (e) { /* pied de page et fond affiches sans ces donnees */ }
  if (fm) fm.innerHTML = renderFooter(settings.contact || {});
  applyHeroBg(settings.hero_bg || {});
}

const HERO_BG_KEY_BY_PAGE = {
  'index.html': 'accueil', 'offres.html': 'offres', 'offre.html': 'offres',
  'equipe.html': 'equipe', 'actualites.html': 'actualites',
  'temoignages.html': 'temoignages', 'contact.html': 'contact'
};
function applyHeroBg(heroBg) {
  const page = document.body.dataset.page || '';
  const key = HERO_BG_KEY_BY_PAGE[page];
  const url = key ? heroBg[key] : '';
  const heroEl = document.querySelector('.hero, .offer-hero');
  if (!heroEl || !url) return;
  heroEl.style.backgroundImage = `url('${url}')`;
  heroEl.classList.add('has-bg');
}

document.addEventListener('DOMContentLoaded', () => {
  mountLayout(document.body.dataset.page || '');
});
