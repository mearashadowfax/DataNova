/** Whether `index` falls in the last row of a grid with `perRow` columns. */
export function isLastRow(
  index: number,
  total: number,
  perRow: number
): boolean {
  return Math.floor(index / perRow) === Math.floor((total - 1) / perRow);
}
