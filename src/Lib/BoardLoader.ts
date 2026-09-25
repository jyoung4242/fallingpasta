import { BoardElement } from "../Actors/board";
import { BOARD_CONFIG, IngredientType, PastaNode } from "../gameTypes";

// Key map for short-hand board diagrams
// Use uppercase for single items, and directions (N, S, E, W) for explicit Spaghetti connections
export type ShortCell =
  | "." // Empty
  | "T" // Tomato
  | "B" // Basil
  | "C" // Cheese
  | "G" // Garlic
  | "S" // Spaghetti (unconnected)
  | "S-E" // Spaghetti linked East
  | "S-W" // Spaghetti linked West
  | "S-H" // Spaghetti linked Horizontal (E + W)
  | "S-V"; // Spaghetti linked Vertical (N + S)

export function loadPrecomposedBoard(board: BoardElement, layout: ShortCell[][]): void {
  const numRows = layout.length;
  const numCols = layout[0].length;

  console.log("loading custom board", layout);

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const token = layout[r][c];

      if (token === ".") {
        board.setCell(c, r, null);
      } else if (token === "T") {
        board.setCell(c, r, "Tomato");
      } else if (token === "B") {
        board.setCell(c, r, "Basil");
      } else if (token === "C") {
        board.setCell(c, r, "Cheese");
      } else if (token === "G") {
        board.setCell(c, r, "Garlic");
      } else if (token.startsWith("S")) {
        // Construct PastaNode with explicit connections for test scenarios
        const node: PastaNode = {
          type: "Spaghetti",
          chainId: 1000 + r * numCols + c,
          connections: {
            N: token.includes("N") || token === "S-V",
            E: token.includes("E") || token === "S-H",
            S: token.includes("S") || token === "S-V",
            W: token.includes("W") || token === "S-H",
          },
        };
        board.setCell(c, r, node);
      }
    }
  }
}
