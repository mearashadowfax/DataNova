import { describe, expect, it } from 'vitest';
import { isLastRow } from './grid';

describe('isLastRow', () => {
  it('marks only the final row, including a partial one', () => {
    // 7 items, 3 per row → rows [0,1,2] [3,4,5] [6]
    expect([0, 1, 2, 3, 4, 5, 6].map(i => isLastRow(i, 7, 3))).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      true,
    ]);
    // 4 items, 2 per row → rows [0,1] [2,3]
    expect([0, 1, 2, 3].map(i => isLastRow(i, 4, 2))).toEqual([
      false,
      false,
      true,
      true,
    ]);
  });

  it('treats a single row as the last row', () => {
    expect(isLastRow(0, 2, 3)).toBe(true);
  });
});
