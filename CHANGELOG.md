## [1.2.1](https://github.com/Pagiestm/LinguaGo/compare/v1.2.0...v1.2.1) (2026-10-11)


### Bug Fixes

* **api:** ne plus bloquer la demande de mot de passe sur l'envoi SMTP ([ae6e289](https://github.com/Pagiestm/LinguaGo/commit/ae6e2897890d45211da6d6ea3e381789d3114876))

# [1.2.0](https://github.com/Pagiestm/LinguaGo/compare/v1.1.2...v1.2.0) (2026-10-11)


### Features

* **client:** menus mobiles animés et niveau visible sur téléphone ([2ffd9c2](https://github.com/Pagiestm/LinguaGo/commit/2ffd9c2b28b2456354b3b734352fb97cb4189731))

## [1.1.2](https://github.com/Pagiestm/LinguaGo/compare/v1.1.1...v1.1.2) (2026-10-10)


### Bug Fixes

* **render:** migrer sans verrou consultatif ([71fbdc1](https://github.com/Pagiestm/LinguaGo/commit/71fbdc10a7c735a8888cba33f241a2e4db781fdc))

## [1.1.1](https://github.com/Pagiestm/LinguaGo/compare/v1.1.0...v1.1.1) (2026-10-10)


### Bug Fixes

* **api:** migrer par la connexion directe de Neon ([256d908](https://github.com/Pagiestm/LinguaGo/commit/256d908935df6566de208b7e0f76553682c3a2c4))

# [1.1.0](https://github.com/Pagiestm/LinguaGo/compare/v1.0.1...v1.1.0) (2026-10-10)


### Features

* **api:** lancer le seed au démarrage et créer l'administrateur depuis l'environnement ([e784417](https://github.com/Pagiestm/LinguaGo/commit/e784417efb7d28ddea39d35116a8672dd71bc4c9))

## [1.0.1](https://github.com/Pagiestm/LinguaGo/compare/v1.0.0...v1.0.1) (2026-10-10)


### Bug Fixes

* **render:** retirer COOKIE_DOMAIN du Blueprint ([77aa69b](https://github.com/Pagiestm/LinguaGo/commit/77aa69b6058e9aae6f3fbb9ff05d1e58998f5e5f))

# 1.0.0 (2026-10-10)


* feat!: refonte complète de LinguaGo ([5b50d7a](https://github.com/Pagiestm/LinguaGo/commit/5b50d7ad91fcd756490c33704d7d1f1b654d61d9))


### Bug Fixes

* **auth:** update navigation paths after login and registration ([a671aac](https://github.com/Pagiestm/LinguaGo/commit/a671aac202f1c2660550bd0c89ec128109752ab8))
* **dashboard:** améliorer la détection de la disponibilité de l'API Speech ([2d84a69](https://github.com/Pagiestm/LinguaGo/commit/2d84a69dd3e5e5553f20567dd4946e5a8713bc85))
* **service-worker:** update service worker configuration and add missing injection point ([951d12b](https://github.com/Pagiestm/LinguaGo/commit/951d12b9cebabff506bacdf519cd6239e86ccbfa))
* sw-route API_URL not working in prod ([13f6ed5](https://github.com/Pagiestm/LinguaGo/commit/13f6ed509dbf25ec437acd8b22ed81611a29e8dc))
* **TalkExerciseCard:** 7:00 to seven oclock ([4693eb5](https://github.com/Pagiestm/LinguaGo/commit/4693eb52a2d94c71375e3adc200db9f04751208e))
* **TalkExerciseCard:** optimize answer sanitization and handle time formatting ([0545da7](https://github.com/Pagiestm/LinguaGo/commit/0545da7673be21686623d2689eaa265ea86120c3))
* **user.service:** Hash password in method update. ([2b6a135](https://github.com/Pagiestm/LinguaGo/commit/2b6a135df7ab051ffbc53d16e7a011953b46180f))
* **user:** Change Number(id) to String(id). ([fd608a7](https://github.com/Pagiestm/LinguaGo/commit/fd608a79185856c8bf6f858da183e3e102411128))
* **vuex:** Declare module vuex to remove error of no module found for vuex. ([38d1d7c](https://github.com/Pagiestm/LinguaGo/commit/38d1d7c37ca4f0ca5acb60ace96d0e1014d9c0d4))


### Features

* add error message if SpeechAPI is not available ([3f60a59](https://github.com/Pagiestm/LinguaGo/commit/3f60a598b88e528bac6a073f6c0c61f2d5a5f6d0))
* add loading spinner to various dashboard components and update user interfaces to include firstTimeConnection flag ([3dc76d6](https://github.com/Pagiestm/LinguaGo/commit/3dc76d6d06eb89403501f4b4346373dd1d05ce83))
* add mysql ([0df1d84](https://github.com/Pagiestm/LinguaGo/commit/0df1d846aa620e18210409872cf308a2e26c84b3))
* add notification table and controller with user notification creation logic ([2b690b4](https://github.com/Pagiestm/LinguaGo/commit/2b690b4aa96bd112a1bf2e60ab6297c4d2fe5e16))
* Add Prisma and Swagger. Add entity user. ([2292fe5](https://github.com/Pagiestm/LinguaGo/commit/2292fe57ad1689935267558187374a1dcd3fec4d))
* **AI:** Implement AI to check if translation answer is correct or not. ([586195b](https://github.com/Pagiestm/LinguaGo/commit/586195be874379c6cdd3886cc1bf5906f70126cc))
* **analytics:** add Microsoft Clarity integration and initialize on app mount ([ce76a59](https://github.com/Pagiestm/LinguaGo/commit/ce76a59c83fe217e98a1afd88f0fe64f57b960a1))
* **AsideDashboard, Routes:** Add a new route called 'ToTalk'. ([f29af7a](https://github.com/Pagiestm/LinguaGo/commit/f29af7a54f74605fd64c3f3b2bd72ab054ae7ba4))
* **auth, config, form:** :sparkles: Integrate vue-toastification for enhanced error handling and user feedback; refactor login component and validation logic ([7d6af0e](https://github.com/Pagiestm/LinguaGo/commit/7d6af0ef99f59002c85aff64de283f1a4cccca8a))
* **auth, user:** :sparkles: Add class-transformer dependency; enhance validation in DTOs and improve error messages ([cf4ac55](https://github.com/Pagiestm/LinguaGo/commit/cf4ac55b10791efab87e9158e78d86bdda063455))
* **auth, user:** Add bcrypt module. ([433e719](https://github.com/Pagiestm/LinguaGo/commit/433e719804a4d35d2141c67d7a830c73e607d586))
* **auth, user:** Enhance authentication and user role management; improve error messages and include user role in JWT payload ([b0255f8](https://github.com/Pagiestm/LinguaGo/commit/b0255f82fd7bb353524ef3ff9d503065601c42ec))
* **auth:** :sparkles: Implement refresh token functionality and enhance authentication flow; add refresh token model and related API endpoints ([6eb25fa](https://github.com/Pagiestm/LinguaGo/commit/6eb25fa3fc9dc953bbe82441603f5c6c58d24a80))
* **auth:** Add Authentication. ([efb95ef](https://github.com/Pagiestm/LinguaGo/commit/efb95efd6e023284ffbffb6bde669d6c5090682a))
* **auth:** implement cookie-based authentication and update token handling ([9a36e6d](https://github.com/Pagiestm/LinguaGo/commit/9a36e6db7b4f9e85bab8aab1c026d3ca04dc8a90))
* **auth:** implement cookie-based authentication and update token handling ([24086ba](https://github.com/Pagiestm/LinguaGo/commit/24086ba484c35e2dfcb1df6a65efdb1030284b09))
* **auth:** implement cookie-based authentication and update token handling ([397981a](https://github.com/Pagiestm/LinguaGo/commit/397981ab163315a01c6716507f538d8e9df16a1f))
* **auth:** implement cookie-based authentication and update token handling ([0b50374](https://github.com/Pagiestm/LinguaGo/commit/0b50374601b5a6c4e6bea0ff87a017eebb4588b0))
* **auth:** implement cookie-based authentication and update token handling ([2180f86](https://github.com/Pagiestm/LinguaGo/commit/2180f866b521454904b93801d7782ce4350bb10b))
* **auth:** implement cookie-based authentication and update token handling ([a8e2d52](https://github.com/Pagiestm/LinguaGo/commit/a8e2d52492e5b22bf79a77df79ee69ae00a7c571))
* **auth:** implement cookie-based authentication and update token handling ([ff9d46e](https://github.com/Pagiestm/LinguaGo/commit/ff9d46ebcf3fa530a50c65bb746b945169681157))
* **auth:** implement cookie-based authentication and update token handling ([4aa5b70](https://github.com/Pagiestm/LinguaGo/commit/4aa5b702958ff979c5904d1bfbbaef0b3d26f459))
* **auth:** implement CryptoService for payload encryption and decryption ([e8e11fc](https://github.com/Pagiestm/LinguaGo/commit/e8e11fc1bddcbc87efe3fa8d16f7675df4e8494d))
* **Auth:** Implement registration functionality with validation and error handling ([c9d3080](https://github.com/Pagiestm/LinguaGo/commit/c9d3080b97b8db2d8dbc71d7f34604b1f643a59c))
* **auth:** implement user profile update and token refresh handling ([0f89666](https://github.com/Pagiestm/LinguaGo/commit/0f8966650f4e855f1258448438b1833f2c9b33fc))
* **auth:** refactor authentication flow and add middleware for token handling ([c053dbd](https://github.com/Pagiestm/LinguaGo/commit/c053dbd4dc21f345fec0fcf939c5ff3633c0cbcc))
* **auth:** refactor authentication flow and add middleware for token handling ([df31f7c](https://github.com/Pagiestm/LinguaGo/commit/df31f7c9b8b8d1a7cda13aba710ee5f842eab269))
* **auth:** refactor authentication flow and add middleware for token handling ([6ad4333](https://github.com/Pagiestm/LinguaGo/commit/6ad43336f77c03fbfa852c30b79cd11f5c4c5b45))
* **auth:** refactor authentication flow and add middleware for token handling ([e410573](https://github.com/Pagiestm/LinguaGo/commit/e410573a43b059145c39846a22f62c03a8bf3ec3))
* **auth:** refactor authentication flow and add middleware for token handling ([4f5cc9a](https://github.com/Pagiestm/LinguaGo/commit/4f5cc9aeeae56b4cf0b5dc8a3a5dee8f4b61de94))
* **auth:** refactor authentication flow and add middleware for token handling ([6836942](https://github.com/Pagiestm/LinguaGo/commit/6836942bb0e61b77047cc61cadac1a2f56da5a76))
* **auth:** refactor authentication flow and add middleware for token handling ([bae06d4](https://github.com/Pagiestm/LinguaGo/commit/bae06d4fe55367999d098bbe9529b07d4fb7a389))
* **auth:** refactor authentication flow and add middleware for token handling ([d323775](https://github.com/Pagiestm/LinguaGo/commit/d323775f94048a31abd04666d85749d3cb3ff24c))
* **auth:** Refactor authentication module to use ConfigService for JWT secret; remove hardcoded constants ([cb8c412](https://github.com/Pagiestm/LinguaGo/commit/cb8c412a680f5ad00bb8b516d44031930bdce40e))
* **auth:** switch from Bearer to Cookie authentication for user endpoints + create Passwordinput component ([df29855](https://github.com/Pagiestm/LinguaGo/commit/df298553edd2f9a64ec0f88859dd39eb0f4aa984))
* **avatar:** add avatar module, DTOs, and controller; implement user avatar updates ([67307d9](https://github.com/Pagiestm/LinguaGo/commit/67307d9c7a23bd09c92c18774f7db24769ef7492))
* **avatar:** add avatar module, DTOs, and controller; implement user avatar updates ([2762b99](https://github.com/Pagiestm/LinguaGo/commit/2762b993a25356b6f1ef9f932585ceb86c78cada))
* **Dashboard:** add dashboard. ([6d69750](https://github.com/Pagiestm/LinguaGo/commit/6d697505367c23e20085084282d98a653aa972df))
* **dashboard:** enhance UI for exercises and favorites with conditional rendering ([f545791](https://github.com/Pagiestm/LinguaGo/commit/f545791a23e080808b4cba1aed633c9c4ef68fd5))
* **dashboard:** enhance user stats display and improve loading spinner style ([ccb20ef](https://github.com/Pagiestm/LinguaGo/commit/ccb20efb07f2b3a4a876d61d07f4de0cc2450e12))
* **dashboard:** enhance user stats display and improve loading spinner style ([39efb13](https://github.com/Pagiestm/LinguaGo/commit/39efb13262c537595dcecf18d5f150f0822f5a01))
* enhance cookie security by using environment variable for secure flag ([dd6ad7e](https://github.com/Pagiestm/LinguaGo/commit/dd6ad7e343d6302111888b7345ec03a5914e1621))
* **exercise, exercises-serie:** Generate dto, entitie, controller, enum and module for exercise. Replace ExercisesSerieService by GenericService. ([70398b0](https://github.com/Pagiestm/LinguaGo/commit/70398b0e02bbda7c3580db450ae8e037e1ac1976))
* **exercise:** add bulk creation endpoint for exercises and update related DTOs ([fbe773e](https://github.com/Pagiestm/LinguaGo/commit/fbe773ef522b9ba87bc62a861ef98d0f61a5fa49))
* **exercises:** add confetti effect on completion and enhance UI for exercise components ([17064e5](https://github.com/Pagiestm/LinguaGo/commit/17064e5d10c46619585b10de065624743f81bfd5))
* **exercises:** Change route name. Delete exercise completed if user failed the exercise. ([9eff6e8](https://github.com/Pagiestm/LinguaGo/commit/9eff6e891d6e05b660e2bd959a473c75470967c7))
* **Exercises:** Display of exercises according to the exercise series + start of validation and success logic ([a2fc2c3](https://github.com/Pagiestm/LinguaGo/commit/a2fc2c382060ef6dcc463fe3fe5acd964e388e00))
* **FavoriteButton:** Add button to add favorite serie of exercises. ([9cacdc8](https://github.com/Pagiestm/LinguaGo/commit/9cacdc846d9420e8f258822e4b232eb7efbbe417))
* **favorites, exercisesSerieCard:** Add router params to card. Pass levelTitle from favorites view to exercisesSerieCard. ([bf7dd95](https://github.com/Pagiestm/LinguaGo/commit/bf7dd95c9b5257a7bccbd5061b249c21e5a1f831))
* **favorites:** Add cache to favorites. Even when offline, favorites are still showing. ([a736b59](https://github.com/Pagiestm/LinguaGo/commit/a736b59c18ad1c466baa7d518c1122c71eb2ac53))
* **favorites:** Add favorite page to see all favorites. ([fb517d1](https://github.com/Pagiestm/LinguaGo/commit/fb517d1d7381402a711bee55a9e71cde818d5285))
* **Hero:** Add animate bounce to 'Go'. ([af6ee2e](https://github.com/Pagiestm/LinguaGo/commit/af6ee2e7ca274e30186b4981860c630a6e981d8f))
* **Home, routes:** :sparkles: Add new components and routing for Levels and Exercises, enhance Home page layout ([ba2d04d](https://github.com/Pagiestm/LinguaGo/commit/ba2d04dfa069a642d22d4b6f03176461f9e9dba1))
* implement notification management with subscription handling and state updates ([81fe1e0](https://github.com/Pagiestm/LinguaGo/commit/81fe1e0d6a4aaa9aa067cde2d9cf89c3774a165d))
* **level:** Add Level entity, DTOs, module, and update related entities and services ([dc405ae](https://github.com/Pagiestm/LinguaGo/commit/dc405aeb0fd86a3436e0891141d7381ee5bec7d3))
* **LevelCard, LevelList, serie.interface:** Add levels route. Each levels has a color, a card. ([bc05cbe](https://github.com/Pagiestm/LinguaGo/commit/bc05cbed9e0b396d68e88d13c1ff9563468cb72a))
* **LevelDetail, ExercisesSerieCard:** Now fetch all exercises-series from view LevelDetail. Add card to each exercises series. ([86d2c48](https://github.com/Pagiestm/LinguaGo/commit/86d2c48bcb8e18fcdbe12e5ccb19525bb80b7b1a))
* **LevelList, style.css:** Add card for each level. Each level has now different colors. ([145e6a4](https://github.com/Pagiestm/LinguaGo/commit/145e6a4be7daa743ea0b48b512c56ec22e7b638a))
* **level:** Update LevelCard and LevelList components to use Level interface and fetch levels from database; adjust password validation length ([45a6be5](https://github.com/Pagiestm/LinguaGo/commit/45a6be548825a4f9eb5a6f4dac5061f7bf8f1ddc))
* **loading:** add LoadingSpinner component and integrate loading state in Login, Register, and Profile views ([7b7cbac](https://github.com/Pagiestm/LinguaGo/commit/7b7cbac7eaf72e38f1ff33cd99af1f1d551a452e))
* **logging:** implement winston logging with daily rotation and add logging interceptor ([78f3f46](https://github.com/Pagiestm/LinguaGo/commit/78f3f46aa414498990f6863db1e7ab35e1c84c9f))
* **Navbar:** Enhance mobile navigation with slide transition and improve button styles ([ba48cb1](https://github.com/Pagiestm/LinguaGo/commit/ba48cb13237a5e8e0ca90ff3c904ffb40bffea27))
* **navigation:** replace AsideLink component with Link component and update NavbarDashboard ([1c6cc28](https://github.com/Pagiestm/LinguaGo/commit/1c6cc28675bd7ac846054120cb0854bda71ece3e))
* **notification, user-completed-exercise, user-completed-exercises-serie, user-stats:** enhance API with authentication and detailed documentation ([d33a103](https://github.com/Pagiestm/LinguaGo/commit/d33a103d5504c134103380d1a67a0cb81016f1ed))
* **notification:** enhance subscription handling and improve notification service methods ([8a89881](https://github.com/Pagiestm/LinguaGo/commit/8a898813bddecd17c62b5cb0ef4c56ea4334d9d4))
* **NotificationService, NestCron:** Added cron to nestjs. Added notification service that trigger notifications to all notifications found in DB. ([625eacd](https://github.com/Pagiestm/LinguaGo/commit/625eacdbb261c390b314fcf62ae19c8ab7a044d0))
* **NotificationService, NestCron:** Added cron to nestjs. Added notification service that trigger notifications to all notifications found in DB. ([9c1712f](https://github.com/Pagiestm/LinguaGo/commit/9c1712f304705fa75262f53ee1f1e7655ab0293c))
* **NotificationService, NotificationButton, ServiceWorker:** Add TODAY in frequency selection. Notification now work with CRON. Service worker handle push notification and show the notification title and content. ([a5a0bf5](https://github.com/Pagiestm/LinguaGo/commit/a5a0bf5f1013d0acaa3f3b60c882ae7f3ef1a73c))
* **Notification:** Set default next notification time to 1 day and 17 hours from current date; update server to listen on all interfaces. ([df97ebd](https://github.com/Pagiestm/LinguaGo/commit/df97ebd70f70b014c5f85a804ee44b4fe0d74ec7))
* **offline-storage:** add offline storage that stock object, and route name then save it when user is online. ([59e8ead](https://github.com/Pagiestm/LinguaGo/commit/59e8ead4de98b235611c510628c15015268c917b))
* **prisma:** add migrations for triggers stats. ([c65496f](https://github.com/Pagiestm/LinguaGo/commit/c65496fc398bf8a2352b9cc8b7b96c2c06106fcf))
* **profile, user:** :sparkles: remove profile route and related components; update navbar to use user info + creation of the modal to display user information + modification of the nickname ([120a377](https://github.com/Pagiestm/LinguaGo/commit/120a3776fb04726e36a63d72de3bd0762b1bf7d0))
* **profile, user:** :sparkles: remove profile route and related components; update navbar to use user info + creation of the modal to display user information + modification of the nickname ([100a895](https://github.com/Pagiestm/LinguaGo/commit/100a895ec8158d49a114836fd9e4fb3879b183de))
* **Profile:** Add user profile view with data fetching and error handling ([0614f7e](https://github.com/Pagiestm/LinguaGo/commit/0614f7e9993367d0901210e3674d7d66dbac85c8))
* **roles, user, auth:** Added role to user. Implement roles guard and decorator. ([1012392](https://github.com/Pagiestm/LinguaGo/commit/10123925bb3763023689321cb9e2fc2309f757f6))
* **router:** Add Vue Router integration and create basic routing structure for Home page ([895d2b1](https://github.com/Pagiestm/LinguaGo/commit/895d2b165ff20566258d3041bb348a7ab65c182d))
* **sanitize:** add text sanitization utility function and update service methods to use destructured response ([9336f3b](https://github.com/Pagiestm/LinguaGo/commit/9336f3be94a669518e9fd387f0fbc3015aaea44b))
* **schema.prisma:** add firstTimeConnection in user. ([0724774](https://github.com/Pagiestm/LinguaGo/commit/0724774a84048d490d6dc96c5bc9379b62bc6e56))
* **series:** add Vuex module for exercises series management and integrate into store ([d033827](https://github.com/Pagiestm/LinguaGo/commit/d033827b00c76c91fe571fdc489d0529c0304792))
* **service-worker, network-observer:** Route /index.html as navigate fallback in service worker. Add network observer class to check when offline or online and keep user connected even when offline. ([7b4d393](https://github.com/Pagiestm/LinguaGo/commit/7b4d393c8e3f9f81ec954906ac6822d84b445e0d))
* **service-worker:** update routes to use dynamic API_URL and improve icon handling ([f36bce5](https://github.com/Pagiestm/LinguaGo/commit/f36bce573d76e18fe2bec91100cc6c67d68e676a))
* **ServiceWorker:** Implement precaching and update service worker configuration ([2d311e8](https://github.com/Pagiestm/LinguaGo/commit/2d311e8d4ba32c7be77747e6ed074fcc8f35c9d5))
* **stats:** add site and user statistics entities, roles enum, and related DTOs ([73ebe1e](https://github.com/Pagiestm/LinguaGo/commit/73ebe1ecdca2e95cc89d92f80b7a9525e00691c4))
* **store, auth:** Implement Vuex store with authentication module and API integration ([0f794f1](https://github.com/Pagiestm/LinguaGo/commit/0f794f133bc529ab9d46d21e1ff6870cd68c5ecf))
* **TalkExercises:** Added voice recognition. Added a link to new type of exercises 'TALK'. ([004b796](https://github.com/Pagiestm/LinguaGo/commit/004b796b7523f3f09d59f41e4df78dd53f0a590b))
* **test:** add health check endpoint to verify API status ([f55acd3](https://github.com/Pagiestm/LinguaGo/commit/f55acd3196d2fcf32a6e5703434185f238019a0b))
* **Timer, Exercises, Dashboard:** Add a timer to Exercises. Add stats to dashboard that check time spent on exercises. ([982f64f](https://github.com/Pagiestm/LinguaGo/commit/982f64fc33b337f503fb8c99bd84d5489b716dbe))
* **ToExercise, LevelDetail, ExercisesCard:** When user complete an exercise, it increment the progress bar. When user complete a serie of exercises, it turn the icon and progress bar to color completed. ([3cc51bc](https://github.com/Pagiestm/LinguaGo/commit/3cc51bc1ece0ce96b9379f240175255323b75a19))
* **user-favorite-serie:** enhance favorite series management with user authentication and validation ([b475ec7](https://github.com/Pagiestm/LinguaGo/commit/b475ec75ca031bf39d18e4e86ed3d89e7f916850))
* **user-stats:** add level and pointsWon fields to user stats and completed exercises ([f19c68f](https://github.com/Pagiestm/LinguaGo/commit/f19c68f99368b01fc1ebaccc4cf1252a95ef0eee))
* **user, notification, level:** add firstTimeConnection flag to user interface and update related services + implement notification module and DTOs for notification ([d783c89](https://github.com/Pagiestm/LinguaGo/commit/d783c89a694dac33c9156fcc7b2200c063cf6f4e))
* **User:** Add 'pseudo' field to User model and update related services and DTOs ([c30cf44](https://github.com/Pagiestm/LinguaGo/commit/c30cf4406d166c51b64db8d001c4d47ec348c32a))
* **user:** add avatarId to user interface and update user DTOs for avatar handling ([ac1759d](https://github.com/Pagiestm/LinguaGo/commit/ac1759d77681ff9e7ef2d60335fbaf72674645a8))
* **validation:** add password complexity validation and update registration form requirements ([a91949a](https://github.com/Pagiestm/LinguaGo/commit/a91949ac4ba949c393c0e11035ce0fa9ba97dc40))
* **vite.config.ts:** :sparkles: Changing the name of the back folder by server + configuration for the PWA and installation of tailwind 4 ([cead4b2](https://github.com/Pagiestm/LinguaGo/commit/cead4b2e750e178672d0f0b06a9311696be96a2a))


### BREAKING CHANGES

* les routes d'administration passent sous /admin, les
révisions, statistiques et succès ont leurs propres routes, et le schéma
Prisma repart de zéro avec de nouvelles migrations.
