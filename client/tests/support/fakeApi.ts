import type { Page, Route } from '@playwright/test';

export const demoUser = {
  id: 'u-demo',
  pseudo: 'Camille',
  email: 'camille@linguago.test',
  role: 'USER',
  firstLogin: false,
  dailyGoal: 5,
  leagueTier: 1,
  hasGoogle: false,
  createdAt: '2026-10-01T10:00:00.000Z',
  avatar: null,
};

const levelProgress = {
  current: { code: 'A1', title: 'Débutant' },
  next: { code: 'A2', title: 'Élémentaire', pointsRequired: 110 },
  pointsInLevel: 12,
  pointsForLevel: 110,
  progress: 12 / 110,
};

const series = {
  id: 96,
  title: 'Premiers mots en anglais',
  description: 'Apprends le vocabulaire de base pour te présenter.',
  type: 'DEFAULT',
  level: { code: 'A1', title: 'Débutant', pointsPerExercise: 1 },
  exerciseCount: 2,
  completedCount: 0,
  isFavorite: false,
  isCompleted: false,
};

export const seriesDetail = {
  ...series,
  exercises: [
    {
      id: 7,
      type: 'MULTIPLE_CHOICE',
      question: "How do you say 'Bonjour' in English?",
      choices: ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
      isCompleted: false,
      answerHash: 'd7bd4189af84a56006c282c883b3be9b6dfd3b6f17dda26411893bb7a62bba87',
    },
    {
      id: 9,
      type: 'TRUE_FALSE',
      question: "Is the following statement true or false? 'The English word for merci is Sorry'.",
      choices: [],
      isCompleted: false,
      answerHash: '0bbeb9df731f05751b1bab9645a55527688aa1d7c85a65b90a8362a2fc07ce36',
    },
  ],
};

export const dailySession = {
  id: 0,
  title: 'Cinq minutes',
  description: 'Vos révisions du jour, complétées par de nouveaux exercices de votre niveau.',
  type: 'DEFAULT',
  level: { code: 'A1', title: 'Débutant', pointsPerExercise: 1 },
  exerciseCount: 2,
  completedCount: 0,
  isFavorite: false,
  isCompleted: false,
  exercises: [
    {
      id: 21,
      type: 'FILL_BLANK',
      question: 'Complete: I ___ a student.',
      choices: [],
      isCompleted: false,
      answerHash: 'x',
    },
    {
      id: 22,
      type: 'ORDER',
      question: 'Mettez dans l’ordre : « Je suis étudiant »',
      choices: ['student', 'i', 'a', 'am'],
      isCompleted: false,
      answerHash: 'y',
    },
  ],
};

export interface FakeApiOptions {
  signedIn?: boolean;
  answers?: Record<number, boolean>;
}

export async function fakeApi(page: Page, options: FakeApiOptions = {}) {
  const state = { signedIn: options.signedIn ?? false, favorites: new Set<number>() };
  const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^\/api/, '');
    const method = request.method();

    if (path === '/auth/me') {
      return state.signedIn
        ? json(route, demoUser)
        : json(route, { message: 'Authentification requise' }, 401);
    }
    if (path === '/auth/login' && method === 'POST') {
      const body = request.postDataJSON() as { email: string; password: string };
      if (body.password === 'Motdepasse1!') {
        state.signedIn = true;
        return json(route, demoUser);
      }
      return json(route, { message: 'Email ou mot de passe incorrect' }, 401);
    }
    if (path === '/auth/register' && method === 'POST') {
      state.signedIn = true;
      const body = request.postDataJSON() as { pseudo: string; email: string };
      return json(
        route,
        { ...demoUser, pseudo: body.pseudo, email: body.email, firstLogin: true },
        201,
      );
    }
    if (path === '/auth/logout') {
      state.signedIn = false;
      return route.fulfill({ status: 204 });
    }
    if (path === '/auth/refresh') return json(route, { message: 'Session expirée' }, 401);

    if (!state.signedIn && !path.startsWith('/levels/public')) {
      return json(route, { message: 'Authentification requise' }, 401);
    }

    if (path === '/levels/public') {
      return json(route, [
        {
          code: 'A1',
          title: 'Débutant',
          position: 1,
          pointsPerExercise: 1,
          exerciseCount: 110,
          winnablePoints: 110,
        },
        {
          code: 'A2',
          title: 'Élémentaire',
          position: 2,
          pointsPerExercise: 2,
          exerciseCount: 81,
          winnablePoints: 162,
        },
      ]);
    }
    if (path === '/me/stats') {
      return json(route, {
        points: 12,
        successfulExercises: 12,
        failedExercises: 3,
        completedSeries: 1,
        timeSpentSeconds: 1260,
        favoritesCount: state.favorites.size,
        level: levelProgress,
        streak: { current: 3, best: 5, doneToday: false },
        today: { points: 2, goal: 5 },
        league: { tier: 1, name: 'Bronze' },
      });
    }
    if (path === '/me/activity') {
      return json(
        route,
        Array.from({ length: 7 }, (_, i) => ({
          date: `2026-10-0${i + 1}`,
          exercises: i,
          points: i,
        })),
      );
    }
    if (path === '/me/completed-series')
      return json(route, [{ code: 'A1', title: 'Débutant', count: 1 }]);
    if (path === '/leaderboard/week') {
      return json(route, [
        { rank: 1, pseudo: 'Lucas', avatar: null, points: 40, isMe: false },
        { rank: 2, pseudo: 'Camille', avatar: null, points: 12, isMe: true },
      ]);
    }
    if (path === '/levels') {
      return json(route, {
        userLevel: levelProgress,
        levels: [
          {
            code: 'A1',
            title: 'Débutant',
            description: 'Les bases.',
            position: 1,
            pointsPerExercise: 1,
            exerciseCount: 110,
            completedExercises: 12,
            series: { DEFAULT: { total: 10, completed: 1 }, TALK: { total: 5, completed: 0 } },
          },
          {
            code: 'A2',
            title: 'Élémentaire',
            description: 'Le quotidien.',
            position: 2,
            pointsPerExercise: 2,
            exerciseCount: 81,
            completedExercises: 0,
            series: { DEFAULT: { total: 10, completed: 0 }, TALK: { total: 3, completed: 0 } },
          },
        ],
      });
    }
    if (/^\/levels\/A1\/series/.test(path))
      return json(route, [{ ...series, isFavorite: state.favorites.has(series.id) }]);
    if (path === '/series/96')
      return json(route, { ...seriesDetail, isFavorite: state.favorites.has(96) });
    if (path === '/series/96/favorite') {
      if (method === 'PUT') state.favorites.add(96);
      else state.favorites.delete(96);
      return route.fulfill({ status: 204 });
    }
    if (path === '/me/favorites')
      return json(route, state.favorites.has(96) ? [{ ...seriesDetail, isFavorite: true }] : []);
    if (/^\/exercises\/(\d+)\/answer$/.test(path)) {
      const id = Number(path.split('/')[2]);
      const correct = options.answers?.[id] ?? false;
      return json(route, {
        correct,
        alreadyCompleted: false,
        pointsWon: correct ? 1 : 0,
        seriesCompleted: false,
        expectedAnswer: correct ? undefined : 'hello',
        verifiedBy: 'exact',
      });
    }
    if (/^\/series\/\d+\/time$/.test(path)) return route.fulfill({ status: 204 });
    if (path === '/push/public-key') return json(route, { publicKey: null });
    if (path === '/auth/providers') return json(route, { google: false });
    if (path === '/me/reviews') return json(route, { due: 0, total: 0, nextDueAt: null });
    if (path === '/me/reviews/session') return json(route, { ...dailySession, exercises: [] });
    if (path === '/me/daily') return json(route, dailySession);
    if (path === '/me/achievements') return json(route, []);
    if (path === '/leaderboard/league') {
      return json(route, {
        tier: 1,
        name: 'Bronze',
        top: false,
        promote: 3,
        relegate: 0,
        members: 2,
        resetsAt: '2026-10-13T00:00:00.000Z',
        entries: [
          { rank: 1, pseudo: 'Lucas', avatar: null, points: 40, isMe: false },
          { rank: 2, pseudo: 'Camille', avatar: null, points: 12, isMe: true },
        ],
      });
    }
    if (path === '/me/notification') return json(route, null);
    if (path === '/avatars') return json(route, []);

    return json(route, { message: `Route non simulée : ${method} ${path}` }, 404);
  });
}
