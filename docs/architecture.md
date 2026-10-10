# Architecture

LinguaGo est un monorepo npm à deux applications qui ne partagent aucun code et ne se parlent qu'en HTTP. Le navigateur ne connaît qu'une origine : `/api` est réécrit vers l'API par Vite en développement et par Vercel en production, ce qui permet des cookies `sameSite` sans CORS.

## L'API

Chaque module de `server/src` suit le même découpage : un contrôleur qui décrit les routes et valide les entrées avec des DTO `class-validator`, un service qui porte les règles et parle à Prisma.

| Module          | Rôle                                                                              |
| --------------- | --------------------------------------------------------------------------------- |
| `auth`          | inscription, connexion, renouvellement, déconnexion, cookies et jetons            |
| `users`         | profil, avatar, mot de passe, première connexion, suppression de compte           |
| `avatars`       | la liste des avatars SVG                                                          |
| `catalog`       | niveaux, séries et exercices vus par l'apprenant, et leur administration          |
| `progress`      | validation des réponses, temps passé, favoris, statistiques, classement           |
| `notifications` | abonnements push, calcul des prochaines occurrences, envoi par cron chaque minute |
| `health`        | sondes de vie et de disponibilité de la base                                      |

Trois gardes sont globaux : le limiteur de débit, l'authentification par cookie (`@Public()` pour en sortir) et les rôles (`@Roles('ADMIN')`). La configuration est validée par zod au démarrage : une variable manquante arrête le serveur.

### Validation des réponses

Le client ne reçoit jamais la réponse d'un exercice. `POST /exercises/:id/answer` compare la proposition selon le type :

- choix multiple et traduction : égalité après normalisation (casse, ponctuation, espaces) ;
- vrai ou faux : `true`/`false`, `vrai`/`faux` acceptés ;
- prononciation : chaque mot attendu doit apparaître dans la transcription, les nombres et les heures dictés en chiffres sont convertis en mots ;
- traduction : la réponse enregistrée peut lister plusieurs formulations séparées par `|`, les contractions anglaises sont développées avant comparaison, et le client montre mot à mot ce qui diffère de la première formulation.

Un exercice réussi n'est compté qu'une fois. Les points, les compteurs et la complétion de la série sont mis à jour dans une seule transaction.

### Niveau de l'apprenant

Le niveau se déduit des points : chaque niveau vaut la somme des points de ses exercices, et l'apprenant franchit un niveau quand il a gagné tous les points des niveaux précédents. Le calcul est pur (`catalog/level-progress.ts`) et testé.

### Notifications

Un rappel porte une heure locale et un fuseau horaire. `notifications/schedule.ts` calcule la prochaine occurrence sans dépendance, heure d'été comprise. Le cron envoie les rappels échus, supprime les abonnements expirés (404 ou 410) et reprogramme la suite.

## Le client

`client/src` est découpé par fonctionnalité. Chaque dossier de `features/` contient ses pages et ses composants ; `shared/` porte ce que tout le monde utilise.

| Dossier              | Contenu                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `shared/api`         | `http.ts` (fetch avec cookies, renouvellement de session sur 401), `endpoints.ts`, types |
| `shared/stores`      | session (utilisateur, démarrage, connexion) et réseau                                    |
| `shared/composables` | requêtes Pinia Colada avec leurs clés, favoris                                           |
| `shared/offline`     | IndexedDB (favoris, file d'attente) et synchronisation                                   |
| `shared/lib`         | normalisation et empreinte des réponses, formats, reconnaissance vocale                  |
| `pwa`                | service worker Workbox, enregistrement, invite de mise à jour                            |

### Hors connexion

1. Les séries favorites sont enregistrées dans IndexedDB à chaque chargement de `/me/favorites`, exercices compris.
2. Sans réseau, une série favorite s'ouvre depuis ce cache. Une réponse est vérifiée localement en comparant son empreinte SHA-256 à celle fournie par le serveur, puis mise en file d'attente.
3. Au retour du réseau, la file est rejouée dans l'ordre : le serveur revalide et attribue les points. Une action refusée (404, 400) est abandonnée, une coupure interrompt la synchronisation sans perte.

Le service worker précache l'application et garde une copie des réponses d'API en lecture (`NetworkFirst`) pour que les écrans se chargent même sans réseau.

## Tests

- `server/src/**/*.spec.ts` : logique pure (normalisation, niveaux, planification) et services avec un Prisma simulé.
- `server/test` : parcours complets contre une base PostgreSQL dédiée, remise à zéro par le seed avant chaque exécution.
- `client/src/**/*.spec.ts` : couche HTTP, empreintes de réponses, synchronisation hors ligne.
- `client/tests` : parcours Playwright contre le build de production, avec une API simulée par interception des requêtes.
