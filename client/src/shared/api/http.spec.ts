import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError } from './http';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('api', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('envoie les cookies et renvoie le JSON', async () => {
    fetchMock.mockResolvedValueOnce(json(200, { ok: true }));
    await expect(api('/levels')).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/levels',
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('renouvelle la session une seule fois après un 401 puis rejoue la requête', async () => {
    fetchMock
      .mockResolvedValueOnce(json(401, { message: 'Session expirée' }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(json(200, { points: 3 }));

    await expect(api('/me/stats')).resolves.toEqual({ points: 3 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1]![0]).toBe('/api/auth/refresh');
  });

  it('échoue proprement si le renouvellement échoue', async () => {
    fetchMock
      .mockResolvedValueOnce(json(401, { message: 'Session expirée' }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }));

    await expect(api('/me/stats')).rejects.toMatchObject({
      status: 401,
      message: 'Session expirée',
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('ne tente pas de renouvellement sur la connexion', async () => {
    fetchMock.mockResolvedValueOnce(json(401, { message: 'Email ou mot de passe incorrect' }));
    await expect(api('/auth/login', { method: 'POST', body: {} })).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('signale une erreur réseau', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(api('/levels')).rejects.toMatchObject({ status: 0, isNetworkError: true });
  });

  it('assemble les messages de validation', async () => {
    fetchMock.mockResolvedValueOnce(
      json(400, { message: ['pseudo trop court', 'email invalide'] }),
    );
    await expect(api('/auth/register', { method: 'POST', body: {} })).rejects.toMatchObject({
      message: 'pseudo trop court · email invalide',
    });
  });
});
