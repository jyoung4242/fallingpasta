import * as ex from "excalibur";
import { BOARD_CONFIG, Direction, GridCell, IngredientType, PastaNode, Piece } from "../gameTypes";
import { Resources } from "../resources";

// Map IngredientType strings to loaded ImageSource instances
const INGREDIENT_IMAGES: Record<IngredientType, ex.ImageSource> = {
  Tomato: Resources.tomato,
  Cheese: Resources.cheese,
  Basil: Resources.basil,
  Meatball: Resources.meatball,
  Garlic: Resources.garlic,
  Bread: Resources.bread,
  Spaghetti: Resources.pasta,
};

export class BoardElement extends ex.Actor {
  private grid: GridCell[][];
  private boardCanvas: ex.Canvas;
  public activePiece: Piece | null = null;

  constructor(pos: ex.Vector) {
    super({
      pos,
      width: BOARD_CONFIG.WIDTH,
      height: BOARD_CONFIG.HEIGHT,
      anchor: ex.Vector.Zero,
    });

    this.grid = Array.from({ length: BOARD_CONFIG.ROWS }, () => Array(BOARD_CONFIG.COLS).fill(null));
    this.boardCanvas = new ex.Canvas({
      width: BOARD_CONFIG.WIDTH,
      height: BOARD_CONFIG.HEIGHT,
      draw: ctx => this.drawBoard(ctx),
    });

    this.graphics.use(this.boardCanvas);
  }

  public isOutOfBounds(col: number, row: number): boolean {
    return col < 0 || col >= BOARD_CONFIG.COLS || row < 0 || row >= BOARD_CONFIG.ROWS;
  }

  public isEmpty(col: number, row: number): boolean {
    if (this.isOutOfBounds(col, row)) return false;
    return this.grid[row][col] === null;
  }

  public getCell(col: number, row: number): GridCell | null {
    if (this.isOutOfBounds(col, row)) return null;
    return this.grid[row][col];
  }

  public getPastaNode(col: number, row: number): PastaNode | null {
    if (this.isOutOfBounds(col, row)) return null;
    const cell = this.grid[row][col];
    if (cell && typeof cell === "object" && cell.type === "Spaghetti") {
      return cell;
    }
    return null;
  }

  /**
   * Sets a cell as a simple ingredient or a full PastaNode structure.
   */
  public setCell(col: number, row: number, cellValue: GridCell): void {
    if (this.isOutOfBounds(col, row)) return;
    this.grid[row][col] = cellValue;
    this.boardCanvas.flagDirty();
  }

  public setActivePiece(piece: Piece | null): void {
    this.activePiece = piece;
    this.boardCanvas.flagDirty();
  }

  public updateChainIds(oldChainId: number, newChainId: number): void {
    for (let r = 0; r < BOARD_CONFIG.ROWS; r++) {
      for (let c = 0; c < BOARD_CONFIG.COLS; c++) {
        const node = this.getPastaNode(c, r);
        if (node && node.chainId === oldChainId) {
          node.chainId = newChainId;
        }
      }
    }
  }

  public clearBoard(): void {
    for (let r = 0; r < BOARD_CONFIG.ROWS; r++) {
      for (let c = 0; c < BOARD_CONFIG.COLS; c++) {
        this.grid[r][c] = null;
      }
    }
    this.boardCanvas.flagDirty();
  }

  public gridToLocalPos(col: number, row: number): ex.Vector {
    return ex.vec(col * BOARD_CONFIG.TILE_SIZE, row * BOARD_CONFIG.TILE_SIZE);
  }

  private drawBoard(ctx: CanvasRenderingContext2D): void {
    const tileSize = BOARD_CONFIG.TILE_SIZE;

    // 1. Background Pass
    ctx.fillStyle = "#1E1E24";
    ctx.fillRect(0, 0, BOARD_CONFIG.WIDTH, BOARD_CONFIG.HEIGHT);

    // 2. Grid Pass
    for (let r = 0; r < BOARD_CONFIG.ROWS; r++) {
      for (let c = 0; c < BOARD_CONFIG.COLS; c++) {
        const x = c * tileSize;
        const y = r * tileSize;

        if ((r + c) % 2 === 1) {
          ctx.fillStyle = "#25252D";
          ctx.fillRect(x, y, tileSize, tileSize);
        }

        ctx.strokeStyle = "#2B2D42";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, tileSize, tileSize);

        // Check for locked PastaNode structure
        const pastaNode = this.getPastaNode(c, r);

        if (pastaNode) {
          // Render dynamic connected noodle ONLY after piece has settled & locked connections
          // console.log(`Drawing PastaNode at (${c}, ${r}) with connections:`, pastaNode.connections);
          this.drawPastaNode(ctx, c, r, pastaNode.connections);
        } else {
          // Render static sprite for standard ingredients
          const ingredient = this.getCell(c, r);
          if (ingredient) {
            const imgSource = INGREDIENT_IMAGES[ingredient as IngredientType];
            if (imgSource?.isLoaded()) {
              ctx.drawImage(imgSource.image, x, y, tileSize, tileSize);
            }
          }
        }
      }
    }

    // 3. Falling Piece Pass (Uses static sprites)
    if (this.activePiece) {
      this.drawActivePiece(ctx, this.activePiece);
    }

    // 4. Board Outer Frame
    ctx.strokeStyle = "#4A4E69";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, BOARD_CONFIG.WIDTH, BOARD_CONFIG.HEIGHT);
  }

  /**
   * Renders a Spaghetti noodle segment using directional connection flags.
   */
  private drawPastaNode(ctx: CanvasRenderingContext2D, col: number, row: number, connections: Record<Direction, boolean>): void {
    const tileSize = BOARD_CONFIG.TILE_SIZE;
    const cx = col * tileSize + tileSize / 2;
    const cy = row * tileSize + tileSize / 2;
    const noodleRadius = 7;
    const noodleWidth = 14;

    ctx.save();

    // Primary Noodle Base Pass (Warm Golden Pasta)
    ctx.strokeStyle = "#F4A261";
    ctx.fillStyle = "#F4A261";
    ctx.lineWidth = noodleWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    // Central connection hub
    ctx.arc(cx, cy, noodleRadius, 0, Math.PI * 2);
    ctx.fill();

    // Extend strokes towards cell edges according to active connections
    if (connections.N) {
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, row * tileSize);
    }
    if (connections.E) {
      ctx.moveTo(cx, cy);
      ctx.lineTo((col + 1) * tileSize, cy);
    }
    if (connections.S) {
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, (row + 1) * tileSize);
    }
    if (connections.W) {
      ctx.moveTo(cx, cy);
      ctx.lineTo(col * tileSize, cy);
    }
    ctx.stroke();

    // Inner Sauce Highlight Pass for 3D Depth
    ctx.strokeStyle = "#E9C46A";
    ctx.lineWidth = 4;
    ctx.beginPath();
    if (connections.N) {
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, row * tileSize);
    }
    if (connections.E) {
      ctx.moveTo(cx, cy);
      ctx.lineTo((col + 1) * tileSize, cy);
    }
    if (connections.S) {
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, (row + 1) * tileSize);
    }
    if (connections.W) {
      ctx.moveTo(cx, cy);
      ctx.lineTo(col * tileSize, cy);
    }
    ctx.stroke();

    ctx.restore();
  }
  /**
   * Renders an immutable Spaghetti strand using stored directional connection flags.
   */
  private drawPersistentPastaTile(ctx: CanvasRenderingContext2D, col: number, row: number, node: PastaNode): void {
    const tileSize = BOARD_CONFIG.TILE_SIZE;
    const cx = col * tileSize + tileSize / 2;
    const cy = row * tileSize + tileSize / 2;
    const noodleRadius = 7;
    const noodleWidth = 14;

    ctx.save();

    // Primary Pasta Stroke Settings
    ctx.strokeStyle = "#F4A261"; // Warm Spaghetti Orange/Yellow
    ctx.lineWidth = noodleWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();

    // Center connection hub
    ctx.arc(cx, cy, noodleRadius, 0, Math.PI * 2);

    // Extend lines outward ONLY for established, locked connections
    if (node.connections.N) {
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, row * tileSize);
    }
    if (node.connections.E) {
      ctx.moveTo(cx, cy);
      ctx.lineTo((col + 1) * tileSize, cy);
    }
    if (node.connections.S) {
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, (row + 1) * tileSize);
    }
    if (node.connections.W) {
      ctx.moveTo(cx, cy);
      ctx.lineTo(col * tileSize, cy);
    }

    ctx.stroke();

    // Secondary Sauce/Highlight Inner Line for Depth
    ctx.strokeStyle = "#E9C46A";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.restore();
  }

  public cameraShakeSmall() {
    this.scene?.camera.shake(5, 1, 300);
  }
  public cameraShakeLarge() {
    this.scene?.camera.shake(5, 5, 600);
  }

  private drawActivePiece(ctx: CanvasRenderingContext2D, piece: Piece): void {
    const tileSize = BOARD_CONFIG.TILE_SIZE;
    const cells = piece.getOccupiedCells();

    for (const cell of cells) {
      if (this.isOutOfBounds(cell.col, cell.row)) continue;

      const x = cell.col * tileSize;
      const y = cell.row * tileSize;

      // Draw the static sprite image for ALL active falling ingredients (including Spaghetti)
      const imgSource = INGREDIENT_IMAGES[cell.type as IngredientType];
      if (imgSource?.isLoaded()) {
        ctx.drawImage(imgSource.image, x, y, tileSize, tileSize);
      }

      // Active block selection highlight box
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, tileSize, tileSize);
    }
  }
}
