import { nextInterval } from './reviews.service';

describe('nextInterval', () => {
  it('monte dans l’échelle des intervalles', () => {
    expect(nextInterval(1)).toBe(3);
    expect(nextInterval(3)).toBe(7);
    expect(nextInterval(7)).toBe(14);
    expect(nextInterval(14)).toBe(30);
    expect(nextInterval(30)).toBe(60);
  });

  it('plafonne au dernier intervalle', () => {
    expect(nextInterval(60)).toBe(60);
    expect(nextInterval(400)).toBe(60);
  });
});
