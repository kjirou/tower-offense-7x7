/*
 * This file MUST NOT depend on any file in the project.
 */

/**
 * Validate that the matrix is not empty and is rectangular
 */
export function validateMatrix<Element>(matrix: Element[][]): boolean {
  return (
    Array.isArray(matrix) &&
    matrix.length > 0 &&
    Array.isArray(matrix[0]) &&
    matrix[0].length > 0 &&
    matrix.every((row: Element[]) => row.length === matrix[0].length)
  );
}

export function flattenMatrix<Element>(matrix: Element[][]): Element[] {
  const flattened: Element[] = [];

  matrix.forEach(row => {
    row.forEach(element => {
      flattened.push(element);
    });
  });
  return flattened;
}
