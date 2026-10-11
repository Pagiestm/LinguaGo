<div align="center">
  <img src="client/public/logo.svg" alt="LinguaGo" width="96" height="96" />
  <h1>LinguaGo</h1>
  <p>Apprendre l'anglais quelques minutes par jour : une PWA installable, utilisable hors connexion, avec des rappels.</p>

![Vue](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-12-e0234e?logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169e1?logo=postgresql&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8)

</div>

## Fonctionnalités

- **Cinq niveaux** du cadre européen (A1 à C1), 66 séries et 418 exercices : QCM, vrai ou faux, traduction libre, texte à trous, remise dans l'ordre, dictée et prononciation
- **Validation côté serveur** : les réponses ne quittent jamais l'API ; une traduction peut déclarer plusieurs formulations acceptées, les contractions anglaises sont comprises et une erreur montre mot à mot ce qui diffère de la réponse attendue
- **Révision espacée** : les exercices ratés reviennent à 1, 3, 7, 14, 30 puis 60 jours ; la session « Cinq minutes » mêle révisions dues et nouveautés du niveau
- **Objectif quotidien** réglable (5 à 40 points), série de jours fondée dessus, onze succès à débloquer, ligues hebdomadaires Bronze, Argent, Or et Diamant avec montée et descente le lundi
- **Administration** : écrans de gestion des séries et des exercices avec les réponses et leurs formulations alternatives
- **Compte** : connexion avec Google, mot de passe oublié par email, export de toutes ses données en JSON, suppression
- **Prononciation** : reconnaissance vocale du navigateur, les nombres dictés en chiffres sont compris (« 7:00 » vaut « seven o'clock »)
- **Progression** : points, niveau, exercices réussis par jour, séries terminées par niveau, temps passé, classement de la semaine
- **Hors connexion** : les séries favorites et les niveaux téléchargés sont conservés sur l'appareil, les réponses sont vérifiées localement puis synchronisées au retour du réseau, même application fermée (Background Sync)
- **Série de jours** : jours consécutifs avec au moins un exercice, record, badge sur l'icône quand la série est en danger
- **Rappels** : notification push à l'heure et à la fréquence choisies, dans le fuseau horaire de l'utilisateur, avec le texte adapté à la série en cours et deux actions (« Commencer », « Dans 1 h »)
- **Installable** : manifeste complet (raccourcis, captures, catégories), invitation à installer au bon moment et guide iOS, mise à jour proposée dans l'application, favoris rafraîchis en arrière-plan, interface sombre
- **Et aussi** : lecture à voix haute des phrases à prononcer, partage du score après une série, mascotte Lingo qui commente chaque étape

## Stack

| Couche    | Technologies                                                                            |
| --------- | --------------------------------------------------------------------------------------- |
| Client    | Vue 3, Vite, vue-router, Pinia et Pinia Colada, Nuxt UI, Tailwind CSS, Workbox          |
| API       | NestJS, Prisma, PostgreSQL, class-validator, Swagger, web-push, MJML                    |
| Tests     | Jest et Supertest (API), Vitest (client), Playwright (parcours navigateur)              |
| Outillage | npm workspaces, ESLint, Prettier, Husky, Commitlint, semantic-release, Renovate, Docker |

## Démarrage

**Prérequis** : Node.js 24.9 ou plus, Docker.

```sh
git clone https://github.com/Pagiestm/LinguaGo.git
cd LinguaGo && npm install && cp .env.example .env
docker compose up -d
```

| Service       | Adresse                                                 |
| ------------- | ------------------------------------------------------- |
| Application   | http://localhost:5173                                   |
| API / Swagger | http://localhost:3000/docs                              |
| pgAdmin       | http://localhost:5051 (`admin@linguago.dev` / `admin`)  |
| PostgreSQL    | `localhost:5435`, base `linguago` (`postgres` / `root`) |

Au démarrage, le conteneur `server` applique les migrations et le seed puis lance l'API en mode watch ; `client` sert Vite. Le code est monté dans les conteneurs : le rechargement à chaud fonctionne. Après un changement de dépendances, `docker compose up -d --build`. `PORT` et `CLIENT_PORT` dans le `.env` changent les ports publiés. Sans Docker pour les apps : `docker compose up -d db pgadmin`, puis `npm run db:migrate`, `npm run db:seed` et `npm run dev`.

Le seed charge le catalogue (niveaux, séries, exercices, avatars) et, hors production, deux comptes : `demo@linguago.fr` et `admin@linguago.fr`, mot de passe `Linguago1!`. En production, il ne crée que l’administrateur défini par `ADMIN_EMAIL` et `ADMIN_PASSWORD`. Il est idempotent et tourne à chaque démarrage après les migrations.

Le `.env` à la racine sert aux deux applications. Les variables facultatives :

| Variable                                   | Effet quand elle est renseignée                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------------- |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`    | les rappels push sont activés (`npx web-push generate-vapid-keys`)                    |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | le bouton « Continuer avec Google » apparaît sur la connexion                         |
| `SMTP_HOST`                                | les emails de bienvenue et de mot de passe oublié partent par SMTP (Mailpit en local) |
| `BREVO_API_KEY`                            | les mêmes emails partent par l’API HTTPS de Brevo, prioritaire sur SMTP               |
| `SWAGGER=true`                             | expose la documentation en production                                                 |

## Scripts

| Commande (depuis la racine)  | Effet                                                       |
| ---------------------------- | ----------------------------------------------------------- |
| `npm run dev`                | API et client en rechargement à chaud                       |
| `npm run build`              | build des deux applications                                 |
| `npm run lint` / `format`    | ESLint et Prettier sur tout le dépôt                        |
| `npm run typecheck`          | TypeScript sur le client et l'API                           |
| `npm test`                   | tests unitaires de l'API                                    |
| `npm run test:e2e -w server` | tests de l'API contre une base dédiée (`DATABASE_URL_TEST`) |
| `npm run test:unit`          | tests unitaires du client                                   |
| `npm run test:e2e`           | parcours Playwright contre le build de production           |

## Architecture

```
LinguaGo/
├── client/                   Vue 3 + Vite, PWA
│   ├── src/app/              App.vue, routeur, mises en page
│   ├── src/features/         home, auth, dashboard, learn, favorites, account
│   ├── src/shared/           api, stores, composables, offline, lib, ui
│   ├── src/pwa/              service worker (injectManifest) et enregistrement
│   ├── tests/                parcours Playwright avec une API simulée
│   ├── Dockerfile            image de développement (Vite)
│   └── Dockerfile.prod       build Vite puis nginx, qui réécrit /api vers l'API
├── server/                   NestJS + Prisma
│   ├── src/auth/             sessions par cookies, jeton de rafraîchissement tourné
│   ├── src/users/            profil, mot de passe, suppression de compte
│   ├── src/catalog/          niveaux, séries, exercices, progression par niveau
│   ├── src/progress/         réponses, temps passé, favoris
│   ├── src/reviews/          révision espacée, session du jour
│   ├── src/stats/            statistiques, classements, ligues
│   ├── src/achievements/     succès
│   ├── src/admin/            gestion des séries et des exercices
│   ├── src/mail/             gabarits MJML et envoi SMTP
│   ├── src/notifications/    abonnements push, planification, cron
│   ├── prisma/               schéma, migrations, seed et catalogue
│   ├── test/                 tests de bout en bout
│   ├── Dockerfile            image de développement (nest --watch)
│   └── Dockerfile.prod       image de production, utilisée par Render
├── docker-compose.yml        développement : PostgreSQL, pgAdmin, API et client en watch
├── docker-compose.prod.yml   auto-hébergement : images compilées, nginx devant le client
├── render.yaml               déploiement de l'API sur Render
└── vercel.json               déploiement du client sur Vercel
```

Le détail est dans [docs/architecture.md](docs/architecture.md) et le déploiement dans [docs/deploiement.md](docs/deploiement.md).

## Sécurité

- Jeton d'accès de 15 minutes et jeton de rafraîchissement de 30 jours, tous deux en cookies `httpOnly` ; le jeton de rafraîchissement est haché en base et tourné à chaque usage, un rejeu révoque toute la famille
- Mots de passe hachés avec bcrypt, règle de complexité vérifiée des deux côtés, même message d'erreur pour un email inconnu et un mauvais mot de passe
- Limitation de débit globale et renforcée sur la connexion et l'inscription, en-têtes `helmet`, CORS restreint au client
- Les réponses des exercices ne sont jamais envoyées au navigateur : seule une empreinte sert à la vérification hors connexion, et les points sont attribués par le serveur à la synchronisation
- Toutes les routes de progression travaillent avec l'utilisateur du jeton, jamais avec un identifiant fourni par le client

## Licence

[MIT](LICENSE)
