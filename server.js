const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
app.disable('x-powered-by');

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'carrieres2026';
const SESSION_SECRET = process.env.SESSION_SECRET || 'upsearch-carrieres-secret';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_FILES = new Set([
  'offres.json', 'equipe.json', 'actualites.json',
  'temoignages.json', 'candidatures.json', 'settings.json', 'media.json'
]);

function genId() { return crypto.randomBytes(6).toString('hex'); }

function readJSON(name, fallback) {
  const p = path.join(DATA_DIR, name);
  if (!fs.existsSync(p)) return fallback;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return fallback; }
}
function writeJSON(name, data) {
  if (!ALLOWED_FILES.has(name)) throw new Error('Fichier non autorise: ' + name);
  fs.writeFileSync(path.join(DATA_DIR, name), JSON.stringify(data, null, 2));
}

// Seed des donnees par defaut au premier demarrage
function seed() {
  if (!fs.existsSync(path.join(DATA_DIR, 'offres.json'))) writeJSON('offres.json', []);
  if (!fs.existsSync(path.join(DATA_DIR, 'equipe.json'))) writeJSON('equipe.json', []);
  if (!fs.existsSync(path.join(DATA_DIR, 'actualites.json'))) writeJSON('actualites.json', []);
  if (!fs.existsSync(path.join(DATA_DIR, 'temoignages.json'))) writeJSON('temoignages.json', []);
  if (!fs.existsSync(path.join(DATA_DIR, 'candidatures.json'))) writeJSON('candidatures.json', []);
  if (!fs.existsSync(path.join(DATA_DIR, 'media.json'))) writeJSON('media.json', []);
  if (!fs.existsSync(path.join(DATA_DIR, 'settings.json'))) {
    writeJSON('settings.json', {
      admin_password_hash: bcrypt.hashSync(ADMIN_PASSWORD, 10),
      contact: {
        rouen_tel: '', rouen_email: '', rouen_adresse: '',
        amiens_tel: '', amiens_email: '', amiens_adresse: ''
      },
      hero_bg: {
        accueil: '', offres: '', equipe: '', actualites: '', temoignages: '', contact: ''
      }
    });
  } else if (process.env.RESET_ADMIN_PASSWORD) {
    // Filet de secours en cas de mot de passe oublié : definir la variable d'environnement
    // RESET_ADMIN_PASSWORD sur Railway puis redemarrer le service reinitialise le mot de passe.
    // A retirer ensuite pour eviter qu'un redemarrage futur ne le reinitialise a nouveau.
    const settings = readJSON('settings.json', {});
    settings.admin_password_hash = bcrypt.hashSync(process.env.RESET_ADMIN_PASSWORD, 10);
    writeJSON('settings.json', settings);
    console.log('[BOOT] Mot de passe administrateur reinitialise via RESET_ADMIN_PASSWORD.');
  }
}
seed();

app.use(express.json({ limit: '5mb' }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

function auth(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: 'Non autorise' });
}

// ── Authentification admin ─────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  const settings = readJSON('settings.json', {});
  if (password && settings.admin_password_hash && bcrypt.compareSync(password, settings.admin_password_hash)) {
    req.session.isAdmin = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'Mot de passe incorrect' });
});
app.post('/api/admin/logout', (req, res) => { req.session.destroy(() => res.json({ ok: true })); });
app.get('/api/admin/me', (req, res) => { res.json({ isAdmin: !!(req.session && req.session.isAdmin) }); });
app.post('/api/admin/change-password', auth, (req, res) => {
  const { newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Mot de passe trop court (6 caracteres minimum)' });
  }
  const settings = readJSON('settings.json', {});
  settings.admin_password_hash = bcrypt.hashSync(newPassword, 10);
  writeJSON('settings.json', settings);
  res.json({ ok: true });
});

// ── Donnees generiques (lecture publique, ecriture admin) ──
app.get('/api/data/:key', (req, res) => {
  const key = req.params.key;
  if (!ALLOWED_FILES.has(key + '.json')) return res.status(400).json({ error: 'Cle invalide' });
  const data = readJSON(key + '.json', key === 'settings' ? {} : []);
  if (key === 'settings') {
    const { admin_password_hash, ...publicSettings } = data;
    return res.json(publicSettings);
  }
  res.json(data);
});
app.put('/api/data/:key', auth, (req, res) => {
  const key = req.params.key;
  if (key === 'settings') return res.status(403).json({ error: 'Utilisez /api/settings/contact' });
  if (!ALLOWED_FILES.has(key + '.json')) return res.status(400).json({ error: 'Cle invalide' });
  writeJSON(key + '.json', req.body);
  res.json({ ok: true });
});
app.put('/api/settings/contact', auth, (req, res) => {
  const settings = readJSON('settings.json', {});
  settings.contact = { ...settings.contact, ...req.body };
  writeJSON('settings.json', settings);
  res.json({ ok: true });
});
app.put('/api/settings/hero-bg', auth, (req, res) => {
  const settings = readJSON('settings.json', {});
  settings.hero_bg = { ...settings.hero_bg, ...req.body };
  writeJSON('settings.json', settings);
  res.json({ ok: true });
});

// ── CRUD generique pour offres / equipe / actualites / temoignages ──
function crud(collection) {
  app.post(`/api/${collection}`, auth, (req, res) => {
    const items = readJSON(`${collection}.json`, []);
    const item = { id: genId(), created_at: new Date().toISOString(), ...req.body };
    items.push(item);
    writeJSON(`${collection}.json`, items);
    res.json(item);
  });
  app.put(`/api/${collection}/:id`, auth, (req, res) => {
    const items = readJSON(`${collection}.json`, []);
    const idx = items.findIndex(i => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Introuvable' });
    items[idx] = { ...items[idx], ...req.body, id: req.params.id };
    writeJSON(`${collection}.json`, items);
    res.json(items[idx]);
  });
  app.delete(`/api/${collection}/:id`, auth, (req, res) => {
    let items = readJSON(`${collection}.json`, []);
    items = items.filter(i => i.id !== req.params.id);
    writeJSON(`${collection}.json`, items);
    res.json({ ok: true });
  });
}
['offres', 'equipe', 'actualites', 'temoignages'].forEach(crud);

// ── Upload de fichiers (CV, photos) ─────────────────────
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => cb(null, genId() + path.extname(file.originalname || ''))
  }),
  limits: { fileSize: 8 * 1024 * 1024 }
});

app.post('/api/upload-image', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier' });
  const url = '/uploads/' + req.file.filename;
  const media = readJSON('media.json', []);
  media.unshift({ id: genId(), url, name: req.file.originalname || req.file.filename, uploaded_at: new Date().toISOString() });
  writeJSON('media.json', media);
  res.json({ url });
});

// ── Médiathèque : parcourir / supprimer les images déjà envoyées ──
app.get('/api/media', auth, (req, res) => {
  res.json(readJSON('media.json', []));
});
app.delete('/api/media/:id', auth, (req, res) => {
  const media = readJSON('media.json', []);
  const item = media.find(m => m.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Introuvable' });
  const filename = item.url.split('/uploads/')[1];
  if (filename) {
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) { try { fs.unlinkSync(filePath); } catch (e) { /* fichier deja absent, on continue */ } }
  }
  writeJSON('media.json', media.filter(m => m.id !== req.params.id));
  res.json({ ok: true });
});

// ── Candidatures : creation publique, lecture/suppression admin ──
app.post('/api/candidatures', upload.single('cv'), (req, res) => {
  const candidatures = readJSON('candidatures.json', []);
  const item = {
    id: genId(),
    created_at: new Date().toISOString(),
    offre_id: req.body.offre_id || '',
    offre_titre: req.body.offre_titre || '',
    prenom: (req.body.prenom || '').trim(),
    nom: (req.body.nom || '').trim().toUpperCase(),
    email: (req.body.email || '').trim(),
    telephone: (req.body.telephone || '').trim(),
    message: (req.body.message || '').trim(),
    cv_filename: req.file ? req.file.filename : null,
    cv_original_name: req.file ? req.file.originalname : null,
    traite: false
  };
  if (!item.prenom || !item.nom || !item.email) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }
  candidatures.push(item);
  writeJSON('candidatures.json', candidatures);
  res.json({ ok: true });
});
app.get('/api/candidatures', auth, (req, res) => {
  res.json(readJSON('candidatures.json', []));
});
app.put('/api/candidatures/:id', auth, (req, res) => {
  const items = readJSON('candidatures.json', []);
  const idx = items.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Introuvable' });
  items[idx] = { ...items[idx], ...req.body, id: req.params.id };
  writeJSON('candidatures.json', items);
  res.json(items[idx]);
});
app.delete('/api/candidatures/:id', auth, (req, res) => {
  let items = readJSON('candidatures.json', []);
  items = items.filter(i => i.id !== req.params.id);
  writeJSON('candidatures.json', items);
  res.json({ ok: true });
});
app.get('/api/candidatures/:id/cv', auth, (req, res) => {
  const items = readJSON('candidatures.json', []);
  const item = items.find(i => i.id === req.params.id);
  if (!item || !item.cv_filename) return res.status(404).send('Introuvable');
  res.download(path.join(UPLOADS_DIR, item.cv_filename), item.cv_original_name || item.cv_filename);
});

app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.listen(PORT, () => console.log('UpSearch Carrieres demarre sur le port ' + PORT));
