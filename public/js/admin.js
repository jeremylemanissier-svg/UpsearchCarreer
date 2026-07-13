const TABS = [
  { key: 'offres', label: 'Offres' },
  { key: 'equipe', label: 'Équipe' },
  { key: 'actualites', label: 'Actualités' },
  { key: 'temoignages', label: 'Témoignages' },
  { key: 'media', label: 'Médiathèque' },
  { key: 'candidatures', label: 'Candidatures' },
  { key: 'parametres', label: 'Paramètres' }
];

const SCHEMAS = {
  offres: {
    title: 'offre',
    titlePlural: "Offres d'emploi",
    fields: [
      { name: 'titre', label: 'Titre du poste', type: 'text', required: true },
      { name: 'entreprise', label: 'Entreprise (optionnel, affiché en petit sous le secteur)', type: 'text' },
      { name: 'metier', label: 'Métier', type: 'text' },
      { name: 'secteur', label: 'Secteur', type: 'text' },
      { name: 'ville', label: 'Ville', type: 'text' },
      { name: 'type_contrat', label: 'Type de contrat', type: 'text', placeholder: 'CDI, CDD...' },
      { name: 'salaire', label: 'Rémunération (optionnel)', type: 'text' },
      { name: 'urgent', label: 'Mettre en avant "à pourvoir rapidement"', type: 'checkbox' },
      { name: 'accroche', label: 'Accroche (1-2 phrases qui donnent envie, sous le bandeau)', type: 'textarea', placeholder: 'Rejoignez une équipe en forte croissance...', hint: 'Astuce : insère une image avec ![](adresse copiée depuis la Médiathèque)' },
      { name: 'stat1_label', label: 'Chiffre clé 1 — libellé', type: 'text', placeholder: 'ex: Effectif agence' },
      { name: 'stat1_value', label: 'Chiffre clé 1 — valeur', type: 'text', placeholder: 'ex: 80 personnes' },
      { name: 'stat2_label', label: 'Chiffre clé 2 — libellé', type: 'text' },
      { name: 'stat2_value', label: 'Chiffre clé 2 — valeur', type: 'text' },
      { name: 'stat3_label', label: 'Chiffre clé 3 — libellé', type: 'text' },
      { name: 'stat3_value', label: 'Chiffre clé 3 — valeur', type: 'text' },
      { name: 'missions', label: 'Missions (une par ligne)', type: 'textarea', hint: 'Une ligne = une mission affichée avec ✓' },
      { name: 'profil', label: 'Profil recherché (une caractéristique par ligne)', type: 'textarea', hint: 'Une ligne = une pastille affichée' },
      { name: 'avantages', label: 'Avantages (un par ligne)', type: 'textarea', hint: 'Une ligne = un avantage listé' },
      { name: 'description', label: 'Informations complémentaires (optionnel)', type: 'textarea', hint: 'Texte libre affiché en bas de l\'annonce. Astuce : insère une image avec ![](adresse copiée depuis la Médiathèque)' },
      { name: 'actif', label: 'Offre publiée sur le site', type: 'checkbox', default: true }
    ],
    renderRow: (item) => `
      <div>
        <p style="font-weight:600;margin:0 0 4px">${esc(item.titre)} ${item.actif === false ? '<span class="badge-off">Masquée</span>' : '<span class="badge-on">Publiée</span>'}</p>
        <p style="font-size:12px;color:var(--text-soft);margin:0">${esc(item.ville || '—')} · ${esc(item.secteur || '—')}</p>
      </div>`
  },
  equipe: {
    title: 'membre',
    titlePlural: 'Équipe',
    fields: [
      { name: 'nom', label: 'Nom', type: 'text', required: true },
      { name: 'role', label: 'Rôle', type: 'text' },
      { name: 'citation', label: 'Citation (optionnel)', type: 'text' },
      { name: 'photo', label: 'Photo', type: 'image' }
    ],
    renderRow: (item) => `
      <div style="display:flex;align-items:center;gap:10px">
        <div class="avatar" style="width:36px;height:36px;font-size:13px">${item.photo ? `<img src="${esc(item.photo)}">` : esc((item.nom || '').split(' ').map(w => w[0] || '').slice(0, 2).join('').toUpperCase())}</div>
        <div><p style="font-weight:600;margin:0">${esc(item.nom)}</p><p style="font-size:12px;color:var(--text-soft);margin:0">${esc(item.role || '')}</p></div>
      </div>`
  },
  actualites: {
    title: 'article',
    titlePlural: 'Actualités',
    fields: [
      { name: 'titre', label: 'Titre', type: 'text', required: true },
      { name: 'categorie', label: 'Catégorie', type: 'text', placeholder: 'Article, Actualité...' },
      { name: 'contenu', label: 'Contenu', type: 'textarea', hint: 'Astuce : insère une image avec ![](adresse copiée depuis la Médiathèque)' },
      { name: 'image', label: 'Image (optionnel)', type: 'image' }
    ],
    renderRow: (item) => `
      <div>
        <p style="font-weight:600;margin:0 0 4px">${esc(item.titre)}</p>
        <p style="font-size:12px;color:var(--text-soft);margin:0">${esc(item.categorie || 'Article')} · ${formatDate(item.created_at)}</p>
      </div>`
  },
  temoignages: {
    title: 'témoignage',
    titlePlural: 'Témoignages',
    fields: [
      { name: 'nom', label: 'Nom', type: 'text', required: true },
      { name: 'role', label: 'Fonction / entreprise', type: 'text' },
      { name: 'citation', label: 'Citation', type: 'textarea', required: true }
    ],
    renderRow: (item) => `
      <div>
        <p style="font-weight:600;margin:0 0 4px">${esc(item.nom)} <span style="font-weight:400;color:var(--text-soft)">— ${esc(item.role || '')}</span></p>
        <p style="font-size:12px;color:var(--text-soft);margin:0;font-style:italic">"${esc((item.citation || '').slice(0, 80))}${(item.citation || '').length > 80 ? '...' : ''}"</p>
      </div>`
  }
};

let CURRENT_TAB = 'offres';
let CACHE = {};

async function checkAuth() {
  const { isAdmin } = await api('GET', '/api/admin/me');
  if (isAdmin) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-app').style.display = 'block';
    renderTabs();
    selectTab(CURRENT_TAB);
  } else {
    document.getElementById('login-screen').style.display = 'block';
    document.getElementById('admin-app').style.display = 'none';
  }
}
async function doLogin() {
  const password = document.getElementById('login-password').value;
  try {
    await api('POST', '/api/admin/login', { password });
    checkAuth();
  } catch (e) { toast(e.message); }
}
async function doLogout() {
  await api('POST', '/api/admin/logout');
  checkAuth();
}

function renderTabs() {
  document.getElementById('admin-tabs').innerHTML = TABS.map(t =>
    `<div class="admin-tab ${t.key === CURRENT_TAB ? 'active' : ''}" onclick="selectTab('${t.key}')">${t.label}</div>`
  ).join('');
}
function selectTab(key) {
  CURRENT_TAB = key;
  renderTabs();
  if (key === 'candidatures') renderCandidatures();
  else if (key === 'parametres') renderParametres();
  else if (key === 'media') renderMedia();
  else renderCollection(key);
}

async function renderCollection(key) {
  const schema = SCHEMAS[key];
  const body = document.getElementById('admin-body');
  body.innerHTML = '<div class="empty">Chargement...</div>';
  const items = await api('GET', '/api/data/' + key);
  CACHE[key] = items;
  body.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h2 style="font-size:18px;margin:0">${schema.titlePlural}</h2>
      <button class="btn btn-primary" onclick="openForm('${key}')">+ Ajouter</button>
    </div>
    <div id="form-slot"></div>
    <div id="list-slot">${items.length ? items.map(it => rowHtml(key, it)).join('') : '<div class="empty">Rien pour l\'instant.</div>'}</div>
  `;
}
function rowHtml(key, item) {
  const schema = SCHEMAS[key];
  return `<div class="row-item">
    ${schema.renderRow(item)}
    <div class="actions">
      <button class="icon-btn" onclick="openForm('${key}','${item.id}')">✏️</button>
      <button class="icon-btn" onclick="deleteItem('${key}','${item.id}')">🗑</button>
    </div>
  </div>`;
}

function openForm(key, id) {
  const schema = SCHEMAS[key];
  const item = id ? (CACHE[key] || []).find(i => i.id === id) : {};
  const slot = document.getElementById('form-slot');
  slot.innerHTML = `
    <div class="form-panel">
      <h3 style="font-size:14px;margin:0 0 14px">${id ? 'Modifier' : 'Ajouter'} — ${schema.title}</h3>
      <form id="item-form">
        ${schema.fields.map(f => fieldHtml(f, item)).join('')}
        <div style="display:flex;gap:8px;margin-top:6px">
          <button type="submit" class="btn btn-primary">Enregistrer</button>
          <button type="button" class="btn btn-outline" onclick="document.getElementById('form-slot').innerHTML=''">Annuler</button>
        </div>
      </form>
    </div>`;
  document.getElementById('item-form').addEventListener('submit', (e) => { e.preventDefault(); saveItem(key, id, schema); });
}

function fieldHtml(f, item) {
  const val = item[f.name] !== undefined ? item[f.name] : (f.default !== undefined ? f.default : '');
  const hintHtml = f.hint ? `<div style="font-size:11px;color:var(--text-mute);margin-top:4px">${f.hint}</div>` : '';
  if (f.type === 'textarea') {
    return `<div class="field"><label>${f.label}</label><textarea name="${f.name}" ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ''} ${f.required ? 'required' : ''}>${esc(val)}</textarea>${hintHtml}</div>`;
  }
  if (f.type === 'checkbox') {
    return `<div class="field"><label style="display:flex;align-items:center;gap:8px;font-weight:400"><input type="checkbox" name="${f.name}" style="width:auto" ${val ? 'checked' : ''}> ${f.label}</label></div>`;
  }
  if (f.type === 'image') {
    return `<div class="field"><label>${f.label}</label>
      <input type="hidden" name="${f.name}" value="${esc(val)}" id="img-${f.name}">
      <input type="file" accept="image/*" onchange="uploadImage(this,'img-${f.name}')">
      ${val ? `<img src="${esc(val)}" style="height:50px;margin-top:8px;border-radius:6px">` : ''}
    </div>`;
  }
  return `<div class="field"><label>${f.label}</label><input name="${f.name}" value="${esc(val)}" ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ''} ${f.required ? 'required' : ''}></div>`;
}

async function uploadImage(inp, targetId) {
  const file = inp.files[0]; if (!file) return;
  const fd = new FormData(); fd.append('image', file);
  try {
    const res = await fetch('/api/upload-image', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Echec de l\'envoi');
    const data = await res.json();
    document.getElementById(targetId).value = data.url;
    toast('✓ Image envoyée');
  } catch (e) { toast(e.message); }
}

async function saveItem(key, id, schema) {
  const form = document.getElementById('item-form');
  const fd = new FormData(form);
  const payload = {};
  schema.fields.forEach(f => {
    if (f.type === 'checkbox') payload[f.name] = form.querySelector(`[name="${f.name}"]`).checked;
    else payload[f.name] = fd.get(f.name);
  });
  try {
    if (id) await api('PUT', `/api/${key}/${id}`, payload);
    else await api('POST', `/api/${key}`, payload);
    toast('✓ Enregistré');
    document.getElementById('form-slot').innerHTML = '';
    renderCollection(key);
  } catch (e) { toast(e.message); }
}

async function deleteItem(key, id) {
  if (!confirm('Supprimer cet élément ?')) return;
  try {
    await api('DELETE', `/api/${key}/${id}`);
    toast('✓ Supprimé');
    renderCollection(key);
  } catch (e) { toast(e.message); }
}

async function renderCandidatures() {
  const body = document.getElementById('admin-body');
  body.innerHTML = '<div class="empty">Chargement...</div>';
  const items = (await api('GET', '/api/candidatures')).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  body.innerHTML = `
    <h2 style="font-size:18px;margin:0 0 16px">Candidatures reçues (${items.length})</h2>
    ${items.length ? items.map(c => `
      <div class="row-item">
        <div>
          <p style="font-weight:600;margin:0 0 4px">${esc(c.prenom)} ${esc(c.nom)} ${c.traite ? '<span class="badge-on">Traitée</span>' : '<span class="badge-off">Nouvelle</span>'}</p>
          <p style="font-size:12px;color:var(--text-soft);margin:0 0 4px">${esc(c.offre_titre || 'Candidature spontanée')} · ${formatDate(c.created_at)}</p>
          <p style="font-size:12px;color:var(--text-soft);margin:0">${esc(c.email)} ${c.telephone ? '· ' + esc(c.telephone) : ''}</p>
          ${c.message ? `<p style="font-size:12px;color:var(--text-mute);margin:6px 0 0;font-style:italic">"${esc(c.message)}"</p>` : ''}
        </div>
        <div class="actions">
          ${c.cv_filename ? `<a class="icon-btn" href="/api/candidatures/${c.id}/cv" target="_blank">📄 CV</a>` : ''}
          <button class="icon-btn" onclick="toggleTraite('${c.id}',${!c.traite})">${c.traite ? '↩️' : '✓'}</button>
          <button class="icon-btn" onclick="deleteCandidature('${c.id}')">🗑</button>
        </div>
      </div>`).join('') : '<div class="empty">Aucune candidature reçue pour le moment.</div>'}
  `;
}
async function toggleTraite(id, traite) {
  try { await api('PUT', `/api/candidatures/${id}`, { traite }); renderCandidatures(); }
  catch (e) { toast(e.message); }
}
async function deleteCandidature(id) {
  if (!confirm('Supprimer cette candidature ?')) return;
  try { await api('DELETE', `/api/candidatures/${id}`); toast('✓ Supprimé'); renderCandidatures(); }
  catch (e) { toast(e.message); }
}

async function renderMedia() {
  const body = document.getElementById('admin-body');
  body.innerHTML = '<div class="empty">Chargement...</div>';
  const items = await api('GET', '/api/media');
  body.innerHTML = `
    <h2 style="font-size:18px;margin:0 0 6px">Médiathèque</h2>
    <p style="font-size:13px;color:var(--text-soft);margin:0 0 16px">Envoie une image ici, copie son adresse, puis colle-la où tu veux : dans un champ "Photo/Image", dans les images de fond des bandeaux (onglet Paramètres), ou dans n'importe quel texte libre avec <code>![](adresse-copiée)</code>.</p>
    <div class="form-panel">
      <input type="file" accept="image/*" id="media-upload-inp" onchange="uploadToMedia(this)">
      <div id="media-upload-status" style="font-size:12px;color:var(--text-soft);margin-top:8px"></div>
    </div>
    <div id="media-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px">
      ${items.length ? items.map(m => mediaCardHtml(m)).join('') : '<div class="empty">Aucune image envoyée pour le moment.</div>'}
    </div>
  `;
}
function mediaCardHtml(m) {
  return `<div class="row-item" style="flex-direction:column;align-items:stretch;padding:8px" id="media-${m.id}">
    <img src="${esc(m.url)}" style="width:100%;height:100px;object-fit:cover;border-radius:6px;margin-bottom:8px">
    <p style="font-size:11px;color:var(--text-soft);margin:0 0 8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(m.name || '')}</p>
    <div style="display:flex;gap:6px">
      <button class="icon-btn" style="flex:1" onclick="copyMediaUrl('${esc(m.url)}')">Copier l'adresse</button>
      <button class="icon-btn" onclick="deleteMedia('${m.id}')">🗑</button>
    </div>
  </div>`;
}
async function uploadToMedia(inp) {
  const file = inp.files[0]; if (!file) return;
  const statusEl = document.getElementById('media-upload-status');
  statusEl.textContent = 'Envoi...';
  const fd = new FormData(); fd.append('image', file);
  try {
    const res = await fetch('/api/upload-image', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Échec de l\'envoi');
    statusEl.textContent = '';
    inp.value = '';
    toast('✓ Image ajoutée à la médiathèque');
    renderMedia();
  } catch (e) { statusEl.textContent = ''; toast(e.message); }
}
function copyMediaUrl(url) {
  const fullUrl = window.location.origin + url;
  navigator.clipboard.writeText(fullUrl).then(() => toast('✓ Adresse copiée')).catch(() => toast('Impossible de copier automatiquement — sélectionne l\'adresse manuellement.'));
}
async function deleteMedia(id) {
  if (!confirm('Supprimer cette image ? Elle disparaîtra de partout où elle est utilisée sur le site.')) return;
  try { await api('DELETE', `/api/media/${id}`); toast('✓ Supprimée'); renderMedia(); }
  catch (e) { toast(e.message); }
}

async function renderParametres() {
  const body = document.getElementById('admin-body');
  const settings = await api('GET', '/api/data/settings');
  const c = settings.contact || {};
  const hb = settings.hero_bg || {};
  body.innerHTML = `
    <h2 style="font-size:18px;margin:0 0 16px">Paramètres</h2>
    <div class="form-panel">
      <h3 style="font-size:14px;margin:0 0 14px">Coordonnées</h3>
      <form id="contact-form">
        <p style="font-size:12px;font-weight:600;color:var(--text-soft);margin:0 0 8px">Rouen</p>
        <div class="field"><label>Adresse</label><input name="rouen_adresse" value="${esc(c.rouen_adresse)}"></div>
        <div class="field-row">
          <div class="field"><label>Téléphone</label><input name="rouen_tel" value="${esc(c.rouen_tel)}"></div>
          <div class="field"><label>Email</label><input name="rouen_email" value="${esc(c.rouen_email)}"></div>
        </div>
        <p style="font-size:12px;font-weight:600;color:var(--text-soft);margin:16px 0 8px">Amiens</p>
        <div class="field"><label>Adresse</label><input name="amiens_adresse" value="${esc(c.amiens_adresse)}"></div>
        <div class="field-row">
          <div class="field"><label>Téléphone</label><input name="amiens_tel" value="${esc(c.amiens_tel)}"></div>
          <div class="field"><label>Email</label><input name="amiens_email" value="${esc(c.amiens_email)}"></div>
        </div>
        <button type="submit" class="btn btn-primary">Enregistrer les coordonnées</button>
      </form>
    </div>
    <div class="form-panel">
      <h3 style="font-size:14px;margin:0 0 6px">Images de fond des bandeaux</h3>
      <p style="font-size:12px;color:var(--text-soft);margin:0 0 14px">Optionnel — sans image, le bandeau reste en couleur unie comme aujourd'hui.</p>
      <form id="herobg-form">
        ${['accueil','offres','equipe','actualites','temoignages','contact'].map(page => `
          <div class="field">
            <label>${page.charAt(0).toUpperCase()+page.slice(1)}</label>
            <input type="hidden" name="${page}" value="${esc(hb[page]||'')}" id="herobg-${page}">
            <input type="file" accept="image/*" onchange="uploadImage(this,'herobg-${page}')">
            ${hb[page] ? `<img src="${esc(hb[page])}" style="height:50px;margin-top:8px;border-radius:6px">` : ''}
          </div>`).join('')}
        <button type="submit" class="btn btn-primary">Enregistrer les images de fond</button>
      </form>
    </div>
    <div class="form-panel">
      <h3 style="font-size:14px;margin:0 0 14px">Changer le mot de passe administrateur</h3>
      <form id="password-form">
        <div class="field"><label>Nouveau mot de passe (6 caractères minimum)</label><input type="password" name="newPassword" minlength="6" required></div>
        <button type="submit" class="btn btn-primary">Changer le mot de passe</button>
      </form>
    </div>
  `;
  document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = Object.fromEntries(fd.entries());
    try { await api('PUT', '/api/settings/contact', payload); toast('✓ Coordonnées enregistrées'); }
    catch (err) { toast(err.message); }
  });
  document.getElementById('herobg-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = Object.fromEntries(fd.entries());
    try { await api('PUT', '/api/settings/hero-bg', payload); toast('✓ Images de fond enregistrées'); renderParametres(); }
    catch (err) { toast(err.message); }
  });
  document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api('POST', '/api/admin/change-password', { newPassword: fd.get('newPassword') });
      toast('✓ Mot de passe modifié');
      e.target.reset();
    } catch (err) { toast(err.message); }
  });
}

document.getElementById('login-password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doLogin();
});
checkAuth();
