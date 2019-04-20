/*
 * This file MUST NOT depend on any file in the project.
 */

export function flattenMatrix<Element>(matrix: Element[][]) {
  const flattened: Element[] = [];
  matrix.forEach(row => {
    row.forEach(element => {
      flattened.push(element);
    });
  });
  return flattened;
}
