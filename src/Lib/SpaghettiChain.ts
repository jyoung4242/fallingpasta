import { BoardElement } from "../Actors/board";
import { Direction } from "../gameTypes";

export class SpaghettiChainManager {
  private nextChainId = 1;

  /**
   * Processes new spaghetti blocks placed on the board, establishing immutable links.
   */
  // Inside SpaghettiChain.ts
  // SpaghettiChain.ts
  public linkNewSpaghettiNodes(board: BoardElement, newCells: { col: number; row: number }[]): void {
    // Check if cell is string "Spaghetti" OR a PastaNode object with type "Spaghetti"
    const spaghettiCells = newCells.filter(c => {
      const rawCell = board.getCell(c.col, c.row);
      if (typeof rawCell === "string") {
        return rawCell === "Spaghetti";
      }
      return rawCell?.type === "Spaghetti";
    });

    console.log("Spaghetti cells to process for linking:", spaghettiCells);

    for (const cell of spaghettiCells) {
      const node = board.getPastaNode(cell.col, cell.row);
      if (!node) continue;

      const neighbors: { dir: Direction; opp: Direction; dc: number; dr: number }[] = [
        { dir: "N", opp: "S", dc: 0, dr: -1 },
        { dir: "E", opp: "W", dc: 1, dr: 0 },
        { dir: "S", opp: "N", dc: 0, dr: 1 },
        { dir: "W", opp: "E", dc: -1, dr: 0 },
      ];

      for (const { dir, opp, dc, dr } of neighbors) {
        const nc = cell.col + dc;
        const nr = cell.row + dr;

        if (board.isOutOfBounds(nc, nr)) continue;

        const neighborNode = board.getPastaNode(nc, nr);

        if (neighborNode && !node.connections[dir] && !neighborNode.connections[opp]) {
          node.connections[dir] = true;
          neighborNode.connections[opp] = true;
          this.mergeChains(board, node.chainId, neighborNode.chainId);
        }
      }
    }
  }

  private mergeChains(board: BoardElement, targetId: number, sourceId: number): void {
    if (targetId === sourceId) return;
    board.updateChainIds(sourceId, targetId);
  }
}
