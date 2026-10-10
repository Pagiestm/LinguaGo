import { createHash } from 'node:crypto';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';

const PASSWORD = 'Motdepasse1!';

describe('LinguaGo API (e2e)', () => {
  let app: INestApplication;
  let cookies: string[] = [];
  const email = `e2e-${Date.now()}@linguago.test`;

  const agent = () => request(app.getHttpServer());
  const authed = (req: request.Test) => req.set('Cookie', cookies);
  const keepCookies = (res: request.Response) => {
    const header = res.headers['set-cookie'];
    const list = Array.isArray(header) ? header : header ? [header] : [];
    for (const cookie of list) {
      const name = cookie.split('=')[0];
      cookies = cookies.filter((c) => !c.startsWith(`${name}=`));
      cookies.push(cookie.split(';')[0]);
    }
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('répond sur /health', async () => {
    await agent()
      .get('/health')
      .expect(200)
      .expect(({ body }) => expect(body.status).toBe('ok'));
  });

  it('refuse un mot de passe trop faible', async () => {
    await agent()
      .post('/auth/register')
      .send({ pseudo: 'Faible', email, password: 'faible' })
      .expect(400);
  });

  it('crée un compte et ouvre une session', async () => {
    const res = await agent()
      .post('/auth/register')
      .send({ pseudo: 'Testeur', email, password: PASSWORD })
      .expect(201);
    keepCookies(res);
    expect(res.body.email).toBe(email);
    expect(res.body.password).toBeUndefined();
    expect(cookies.some((c) => c.startsWith('lg_access='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('lg_refresh='))).toBe(true);
  });

  it('refuse un doublon d’email', async () => {
    await agent()
      .post('/auth/register')
      .send({ pseudo: 'Doublon', email, password: PASSWORD })
      .expect(409);
  });

  it('renvoie le même message pour un email inconnu et un mauvais mot de passe', async () => {
    const unknown = await agent()
      .post('/auth/login')
      .send({ email: 'inconnu@linguago.test', password: PASSWORD })
      .expect(401);
    const wrong = await agent()
      .post('/auth/login')
      .send({ email, password: 'Mauvais1!xx' })
      .expect(401);
    expect(unknown.body.message).toBe(wrong.body.message);
  });

  it('protège les routes sans cookie', async () => {
    await agent().get('/levels').expect(401);
  });

  it('liste les niveaux avec la progression', async () => {
    const { body } = await authed(agent().get('/levels')).expect(200);
    expect(body.levels).toHaveLength(5);
    expect(body.userLevel.current.code).toBe('A1');
  });

  let exerciseId = 0;
  let seriesId = 0;
  let expectedHash = '';

  it('renvoie les séries d’un niveau puis une série sans ses réponses', async () => {
    const { body: series } = await authed(
      agent().get('/levels/A1/series'),
    ).expect(200);
    expect(series.length).toBeGreaterThan(0);
    seriesId = series[0].id;

    const { body: detail } = await authed(
      agent().get(`/series/${seriesId}`),
    ).expect(200);
    expect(detail.exercises.length).toBeGreaterThan(0);
    expect(detail.exercises[0].answer).toBeUndefined();
    const multiple = detail.exercises.find(
      (e: { type: string }) => e.type === 'MULTIPLE_CHOICE',
    );
    exerciseId = multiple.id;
    expectedHash = multiple.answerHash;
    expect(multiple.choices.length).toBeGreaterThan(1);
  });

  it('valide une mauvaise réponse comme incorrecte et renvoie la réponse attendue', async () => {
    const { body } = await authed(
      agent().post(`/exercises/${exerciseId}/answer`),
    )
      .send({ answer: 'réponse volontairement fausse' })
      .expect(200);
    expect(body.correct).toBe(false);
    expect(body.expectedAnswer).toBeDefined();
  });

  it('valide la bonne réponse, attribue les points et ne les compte qu’une fois', async () => {
    const { body: before } = await authed(agent().get('/me/stats')).expect(200);
    const { body: detail } = await authed(
      agent().get(`/series/${seriesId}`),
    ).expect(200);
    const multiple = detail.exercises.find(
      (e: { id: number }) => e.id === exerciseId,
    );
    const good = multiple.choices.find(
      (choice: string) =>
        createHash('sha256')
          .update(`${exerciseId}:${choice.toLowerCase()}`)
          .digest('hex') === expectedHash,
    );
    expect(good).toBeDefined();

    const { body } = await authed(
      agent().post(`/exercises/${exerciseId}/answer`),
    )
      .send({ answer: good })
      .expect(200);
    expect(body.correct).toBe(true);
    expect(body.pointsWon).toBeGreaterThan(0);

    const { body: again } = await authed(
      agent().post(`/exercises/${exerciseId}/answer`),
    )
      .send({ answer: good })
      .expect(200);
    expect(again.alreadyCompleted).toBe(true);
    expect(again.pointsWon).toBe(0);

    const { body: after } = await authed(agent().get('/me/stats')).expect(200);
    expect(after.points).toBe(before.points + body.pointsWon);
    expect(after.successfulExercises).toBe(before.successfulExercises + 1);
    expect(after.today).toEqual({ points: 1, goal: 5 });
    expect(after.streak).toEqual({ current: 0, best: 0, doneToday: false });

    const { body: reviews } = await authed(agent().get('/me/reviews')).expect(
      200,
    );
    expect(reviews.total).toBe(1);
    const { body: achievements } = await authed(
      agent().get('/me/achievements'),
    ).expect(200);
    const first = achievements.find(
      (a: { code: string }) => a.code === 'FIRST_EXERCISE',
    );
    expect(first.unlocked).toBe(true);
    expect(first.isNew).toBe(true);

    const { body: daily } = await authed(agent().get('/me/daily')).expect(200);
    expect(daily.id).toBe(0);
    expect(daily.exercises.length).toBeGreaterThan(0);
  });

  it('gère les favoris', async () => {
    await authed(agent().put(`/series/${seriesId}/favorite`)).expect(204);
    const { body } = await authed(agent().get('/me/favorites')).expect(200);
    expect(body.map((s: { id: number }) => s.id)).toContain(seriesId);
    await authed(agent().delete(`/series/${seriesId}/favorite`)).expect(204);
  });

  it('refuse les routes administrateur à un utilisateur', async () => {
    await authed(agent().post('/admin/series'))
      .send({ title: 'Interdit', levelCode: 'A1' })
      .expect(403);
  });

  it('renouvelle la session puis la ferme', async () => {
    const refreshed = await authed(agent().post('/auth/refresh')).expect(200);
    keepCookies(refreshed);
    await authed(agent().get('/auth/me')).expect(200);
    await authed(agent().post('/auth/logout')).expect(204);
    await authed(agent().post('/auth/refresh')).expect(401);
  });
});
