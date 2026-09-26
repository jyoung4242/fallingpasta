import { BOARD_CONFIG, IngredientType } from "../gameTypes";
import { BoardElement } from "../Actors/board";
import { SpaghettiChainManager } from "./SpaghettiChain";
import { Resources } from "../resources";

export interface ResolutionResult {
  clearedCount: number;
  matchesFound: number;
  longestSpaghettiChain: number;
}

export class BoardResolver {
  private board: BoardElement;
  private chainManager: SpaghettiChainManager = new SpaghettiChainManager(); // Add chain manager instance

  constructor(board: BoardElement) {
    this.board = board;
  }

  public async resolveBoard(): Promise<ResolutionResult> {
    let totalCleared = 0;
    let totalMatches = 0;
    let hasMoreMatches = true;

    while (hasMoreMatches) {
      const matchedCells = this.findMatch3Cells();

      if (matchedCells.length === 0) {
        hasMoreMatches = false;
      } else {
        totalMatches++;
        totalCleared += matchedCells.length;
        Resources.sfx_match.play();
        this.board.cameraShakeSmall();
        // 1. Clear matched ingredients from board
        for (const { col, row } of matchedCells) {
          this.board.setCell(col, row, null);
        }

        // 2. Apply gravity to drop remaining blocks down
        this.applyGravity();

        // 3. Re-link all spaghetti nodes to reflect their new adjacent neighbors
        this.rebuildAllSpaghettiConnections();
      }
    }

    // 4. Compute current longest spaghetti chain on settled board
    const longestChain = this.calculateLongestSpaghettiChain();

    return {
      clearedCount: totalCleared,
      matchesFound: totalMatches,
      longestSpaghettiChain: longestChain,
    };
  }

  /**
   * Resets all connections across the board and re-evaluates orthogonal neighbors.
   */
  private rebuildAllSpaghettiConnections(): void {
    const allSpaghettiPositions: { col: number; row: number }[] = [];

    // Step 1: Wipe stale connection state on all existing PastaNodes
    for (let r = 0; r < BOARD_CONFIG.ROWS; r++) {
      for (let c = 0; c < BOARD_CONFIG.COLS; c++) {
        const node = this.board.getPastaNode(c, r);
        if (node) {
          node.connections = { N: false, E: false, S: false, W: false };
          allSpaghettiPositions.push({ col: c, row: r });
        }
      }
    }

    // Step 2: Re-link adjacent nodes using current board positions
    this.chainManager.linkNewSpaghettiNodes(this.board, allSpaghettiPositions);
  }

  private findMatch3Cells(): { col: number; row: number }[] {
    const toClear = new Set<string>();

    // Horizontal check
    for (let r = 0; r < BOARD_CONFIG.ROWS; r++) {
      let matchLen = 1;
      for (let c = 0; c < BOARD_CONFIG.COLS; c++) {
        const current = this.board.getCell(c, r);
        const next = this.board.getCell(c + 1, r);

        if (current && current !== "Spaghetti" && current === next) {
          matchLen++;
        } else {
          if (matchLen >= 3) {
            for (let i = 0; i < matchLen; i++) {
              toClear.add(`${c - i},${r}`);
            }
          }
          matchLen = 1;
        }
      }
    }

    // Vertical check
    for (let c = 0; c < BOARD_CONFIG.COLS; c++) {
      let matchLen = 1;
      for (let r = 0; r < BOARD_CONFIG.ROWS; r++) {
        const current = this.board.getCell(c, r);
        const next = this.board.getCell(c, r + 1);

        if (current && current !== "Spaghetti" && current === next) {
          matchLen++;
        } else {
          if (matchLen >= 3) {
            for (let i = 0; i < matchLen; i++) {
              toClear.add(`${c},${r - i}`);
            }
          }
          matchLen = 1;
        }
      }
    }

    return Array.from(toClear).map(coord => {
      const [col, row] = coord.split(",").map(Number);
      return { col, row };
    });
  }

  private applyGravity(): void {
    let moved = true;

    // Loop until no more individual tiles or connected spaghetti clusters can drop
    while (moved) {
      moved = false;

      // 1. Identify connected Spaghetti clusters
      const clusters = this.findSpaghettiClusters();
      const processedSpaghetti = new Set<string>();

      // 2. Try moving Spaghetti clusters down as single units
      for (const cluster of clusters) {
        cluster.forEach(c => processedSpaghetti.add(`${c.col},${c.row}`));

        if (this.canClusterDrop(cluster)) {
          this.dropCluster(cluster);
          moved = true;
        }
      }

      // 3. Fall standard non-spaghetti tiles (and isolated/unconnected spaghetti)
      for (let c = 0; c < BOARD_CONFIG.COLS; c++) {
        for (let r = BOARD_CONFIG.ROWS - 2; r >= 0; r--) {
          const key = `${c},${r}`;

          // Skip spaghetti nodes handled by cluster logic
          if (processedSpaghetti.has(key)) continue;

          const current = this.board.getCell(c, r);
          const below = this.board.getCell(c, r + 1);

          if (current !== null && current !== "Spaghetti" && below === null) {
            this.board.setCell(c, r + 1, current);
            this.board.setCell(c, r, null);
            moved = true;
          }
        }
      }
    }
  }

  private canClusterDrop(cluster: { col: number; row: number }[]): boolean {
    const clusterSet = new Set(cluster.map(c => `${c.col},${c.row}`));

    for (const cell of cluster) {
      const targetRow = cell.row + 1;

      // Out of bounds (hit bottom of board)
      if (targetRow >= BOARD_CONFIG.ROWS) return false;

      const cellBelowKey = `${cell.col},${targetRow}`;
      const itemBelow = this.board.getCell(cell.col, targetRow);

      // If space below is occupied by something outside this cluster, block the drop
      if (itemBelow !== null && !clusterSet.has(cellBelowKey)) {
        return false;
      }
    }

    return true;
  }

  private dropCluster(cluster: { col: number; row: number }[]): void {
    // Sort bottom-to-top to prevent overwriting cells during downward shift
    const sorted = [...cluster].sort((a, b) => b.row - a.row);

    for (const cell of sorted) {
      const node = this.board.getPastaNode(cell.col, cell.row);
      if (node) {
        this.board.setCell(cell.col, cell.row + 1, node);
        this.board.setCell(cell.col, cell.row, null);
      }
    }
  }

  private findSpaghettiClusters(): { col: number; row: number }[][] {
    const visited = new Set<string>();
    const clusters: { col: number; row: number }[][] = [];

    for (let r = 0; r < BOARD_CONFIG.ROWS; r++) {
      for (let c = 0; c < BOARD_CONFIG.COLS; c++) {
        const key = `${c},${r}`;
        const node = this.board.getPastaNode(c, r);

        if (node && !visited.has(key)) {
          const cluster: { col: number; row: number }[] = [];
          const queue = [{ col: c, row: r }];
          visited.add(key);

          while (queue.length > 0) {
            const curr = queue.shift()!;
            cluster.push(curr);
            const currNode = this.board.getPastaNode(curr.col, curr.row);
            if (!currNode) continue;

            // Follow explicitly locked connections
            const neighbors = [
              { check: currNode.connections.N, col: curr.col, row: curr.row - 1 },
              { check: currNode.connections.E, col: curr.col + 1, row: curr.row },
              { check: currNode.connections.S, col: curr.col, row: curr.row + 1 },
              { check: currNode.connections.W, col: curr.col - 1, row: curr.row },
            ];

            for (const { check, col: nc, row: nr } of neighbors) {
              const nKey = `${nc},${nr}`;
              if (check && !visited.has(nKey) && !this.board.isOutOfBounds(nc, nr)) {
                visited.add(nKey);
                queue.push({ col: nc, row: nr });
              }
            }
          }

          // Only treat as a rigid cluster if it actually contains links
          if (cluster.length > 1) {
            clusters.push(cluster);
          }
        }
      }
    }

    return clusters;
  }

  public getLongestChainLength(board: BoardElement): number {
    const visited = new Set<string>();
    let maxLength = 0;

    for (let r = 0; r < BOARD_CONFIG.ROWS; r++) {
      for (let c = 0; c < BOARD_CONFIG.COLS; c++) {
        const node = board.getPastaNode(c, r);
        if (node && !visited.has(`${c},${r}`)) {
          const length = this.traverseChain(board, c, r, visited);
          maxLength = Math.max(maxLength, length);
        }
      }
    }

    return maxLength;
  }

  private traverseChain(board: BoardElement, startCol: number, startRow: number, visited: Set<string>): number {
    let length = 0;
    const stack: { col: number; row: number }[] = [{ col: startCol, row: startRow }];

    while (stack.length > 0) {
      const { col, row } = stack.pop()!;
      const key = `${col},${row}`;

      if (visited.has(key)) continue;
      visited.add(key);
      length++;

      const node = board.getPastaNode(col, row);
      if (!node) continue;

      // Follow ONLY explicitly locked connections
      if (node.connections.N) stack.push({ col, row: row - 1 });
      if (node.connections.E) stack.push({ col: col + 1, row });
      if (node.connections.S) stack.push({ col, row: row + 1 });
      if (node.connections.W) stack.push({ col: col - 1, row });
    }

    return length;
  }

  public calculateLongestSpaghettiChain(): number {
    let maxChainLength = 0;
    const visited = new Set<string>();

    for (let r = 0; r < BOARD_CONFIG.ROWS; r++) {
      for (let c = 0; c < BOARD_CONFIG.COLS; c++) {
        const node = this.board.getPastaNode(c, r);
        if (node && !visited.has(`${c},${r}`)) {
          const chainLength = this.traverseNodeConnections(c, r, visited);
          maxChainLength = Math.max(maxChainLength, chainLength);
        }
      }
    }

    return maxChainLength;
  }

  private traverseNodeConnections(col: number, row: number, visited: Set<string>): number {
    const key = `${col},${row}`;
    if (visited.has(key)) return 0;

    visited.add(key);

    const node = this.board.getPastaNode(col, row);
    if (!node) return 0;

    let length = 1;

    // Traverse explicitly established directional connections
    if (node.connections.N && !this.board.isOutOfBounds(col, row - 1)) {
      length += this.traverseNodeConnections(col, row - 1, visited);
    }
    if (node.connections.E && !this.board.isOutOfBounds(col + 1, row)) {
      length += this.traverseNodeConnections(col + 1, row, visited);
    }
    if (node.connections.S && !this.board.isOutOfBounds(col, row + 1)) {
      length += this.traverseNodeConnections(col, row + 1, visited);
    }
    if (node.connections.W && !this.board.isOutOfBounds(col - 1, row)) {
      length += this.traverseNodeConnections(col - 1, row, visited);
    }

    return length;
  }
}
