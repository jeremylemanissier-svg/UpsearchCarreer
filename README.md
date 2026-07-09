# UpSearch Carrières

Site vitrine et carrières pour Réseau Alliance / UpSearch — indépendant de l'outil UpSearch CRM/ATS.

## Stack

Identique à UpSearch : Node.js/Express, base de données en fichiers JSON, prévu pour Railway + GitHub.

## Démarrer en local

```
npm install
npm start
```

Le site est accessible sur `http://localhost:3000`, l'administration sur `http://localhost:3000/admin`.

**Mot de passe admin par défaut : `carrieres2026`**
Change-le tout de suite depuis Admin > Paramètres, ou en définissant la variable d'environnement `ADMIN_PASSWORD` avant le tout premier démarrage (elle ne sert qu'à créer le mot de passe initial, change-le ensuite depuis l'interface).

## Déploiement sur Railway (comme UpSearch)

1. Crée un nouveau dépôt GitHub, pousse ce dossier dedans.
2. Sur Railway : **New Project > Deploy from GitHub repo**, sélectionne ce dépôt.
3. Railway détecte Node.js automatiquement et lance `npm start`.
4. Dans les Variables d'environnement Railway, ajoute :
   - `SESSION_SECRET` — une chaîne aléatoire longue (pour sécuriser les sessions admin)
   - `ADMIN_PASSWORD` — le mot de passe admin initial (optionnel, sinon `carrieres2026` par défaut — à changer immédiatement dans l'interface)
5. **Important** : ajoute un volume Railway monté sur `/data` et définis la variable `DATA_DIR=/data`, sinon les données (offres, candidatures, photos) seront perdues à chaque redéploiement — exactement comme pour UpSearch.
6. Une fois déployé, va sur `/admin`, connecte-toi, et commence à remplir : coordonnées (Paramètres), équipe, offres.

## Nom de domaine

Railway fournit une URL du type `xxx.up.railway.app` par défaut. Pour un vrai nom de domaine (ex: `carrieres.reseau-alliance.fr`) :
1. Achète le nom de domaine chez un registrar (OVH, Namecheap...)
2. Dans Railway > Settings > Networking, ajoute un domaine personnalisé
3. Configure les enregistrements DNS indiqués par Railway chez ton registrar

## Structure

```
server.js              → serveur Express, API, authentification admin
public/
  index.html            → page d'accueil
  offres.html           → liste des offres avec filtres
  offre.html            → détail d'une offre + candidature
  equipe.html           → page équipe
  actualites.html       → page actualités
  temoignages.html      → page témoignages
  contact.html          → contact + candidature spontanée
  admin.html            → panneau d'administration
  css/style.css         → styles partagés
  js/site.js            → en-tête/pied de page communs, utilitaires
  js/admin.js           → logique du panneau admin
  img/logo.png          → logo (fond clair)
  img/logo-white.png    → logo (fond sombre, footer)
data/                   → créé automatiquement au premier démarrage (offres.json, equipe.json, etc.)
```

## Lien futur avec UpSearch

Les offres sont stockées dans `data/offres.json` avec des champs simples (titre, métier,
secteur, ville, type_contrat, salaire, description, actif). Le jour où tu veux automatiser
la synchronisation avec les Commandes d'UpSearch, il suffira d'ajouter un script qui pousse
les commandes marquées "publiable" vers `POST /api/offres` de ce site via son API — aucune
restructuration nécessaire.

Idem pour les candidatures reçues (`data/candidatures.json`) : chaque candidature contient
CV, coordonnées et message, prêtes à être reprises pour créer une fiche dans le Vivier
UpSearch via son API le moment venu.
