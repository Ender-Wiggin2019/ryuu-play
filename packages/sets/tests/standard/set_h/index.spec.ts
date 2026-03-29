import { setH } from '../../../src/standard/set_h';
import { Miraidon } from '../../../src/standard/set_h/miraidon';
import { ShuangFuZhanLong } from '../../../src/standard/set_h/shuang-fu-zhan-long';

describe('set_h index', () => {
  it('registers manually implemented H Pokemon additions', () => {
    expect(setH.some(card => card instanceof Miraidon)).toBe(true);
    expect(setH.some(card => card instanceof ShuangFuZhanLong)).toBe(true);
  });
});
