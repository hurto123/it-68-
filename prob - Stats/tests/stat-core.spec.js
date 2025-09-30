import { normCdf } from '../tools/distributions.js';

describe('stat-core', () => {
  it('should approximate Z critical ~1.96', () => {
    const p = normCdf(1.96);
    if (Math.abs(p - 0.975) > 0.001) {
      throw new Error('Z critical outside tolerance');
    }
  });
});
