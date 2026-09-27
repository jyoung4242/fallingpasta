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
      canPause: true,
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
    const tileSize = BOARD_CONFIG.TILE_SIZE; //[cite: 2]

    // 1. Background Pass[cite: 2]
    ctx.fillStyle = "#1E1E24"; //[cite: 2]
    ctx.fillRect(0, 0, BOARD_CONFIG.WIDTH, BOARD_CONFIG.HEIGHT); //[cite: 2]

    // 2. Grid & Static Tiles Pass[cite: 2]
    for (let r = 0; r < BOARD_CONFIG.ROWS; r++) {
      //[cite: 2]
      for (let c = 0; c < BOARD_CONFIG.COLS; c++) {
        //[cite: 2]
        const x = c * tileSize; //[cite: 2]
        const y = r * tileSize; //[cite: 2]

        if ((r + c) % 2 === 1) {
          //[cite: 2]
          ctx.fillStyle = "#25252D"; //[cite: 2]
          ctx.fillRect(x, y, tileSize, tileSize); //[cite: 2]
        } //[cite: 2]

        ctx.strokeStyle = "#2B2D42"; //[cite: 2]
        ctx.lineWidth = 1; //[cite: 2]
        ctx.strokeRect(x, y, tileSize, tileSize); //[cite: 2]

        const cell = this.getCell(c, r); //[cite: 2]
        const pastaNode = this.getPastaNode(c, r); //[cite: 2]

        // Draw static ingredient images (or lone unconnected spaghetti)[cite: 2]
        if (pastaNode) {
          //[cite: 2]
          const hasConnection = Object.values(pastaNode.connections).some(Boolean); //
          if (!hasConnection) {
            //
            const imgSource = INGREDIENT_IMAGES["Spaghetti"]; //[cite: 2]
            if (imgSource?.isLoaded()) ctx.drawImage(imgSource.image, x, y, tileSize, tileSize); //[cite: 2]
          }
        } else if (cell) {
          //[cite: 2]
          const imgSource = INGREDIENT_IMAGES[cell as IngredientType]; //[cite: 2]
          if (imgSource?.isLoaded()) ctx.drawImage(imgSource.image, x, y, tileSize, tileSize); //[cite: 2]
        }
      }
    }

    // 3. NOODLE PASS 1: Draw ALL Dark Outlines First[cite: 2]
    for (let r = 0; r < BOARD_CONFIG.ROWS; r++) {
      //[cite: 2]
      for (let c = 0; c < BOARD_CONFIG.COLS; c++) {
        //[cite: 2]
        const pastaNode = this.getPastaNode(c, r); //[cite: 2]
        if (pastaNode && Object.values(pastaNode.connections).some(Boolean)) {
          //[cite: 2]
          this.drawPastaNodePass(ctx, c, r, pastaNode.connections, "shadow"); //[cite: 2]
        }
      }
    }

    // 4. NOODLE PASS 2: Draw ALL Golden Pasta & Sauce Highlights On Top[cite: 2]
    for (let r = 0; r < BOARD_CONFIG.ROWS; r++) {
      //[cite: 2]
      for (let c = 0; c < BOARD_CONFIG.COLS; c++) {
        //[cite: 2]
        const pastaNode = this.getPastaNode(c, r); //[cite: 2]
        if (pastaNode && Object.values(pastaNode.connections).some(Boolean)) {
          //[cite: 2]
          this.drawPastaNodePass(ctx, c, r, pastaNode.connections, "body"); //[cite: 2]
        }
      }
    }

    // 5. Active Falling Piece Pass[cite: 2]
    if (this.activePiece) {
      //[cite: 2]
      this.drawActivePiece(ctx, this.activePiece); //[cite: 2]
    }

    // 6. Board Frame[cite: 2]
    ctx.strokeStyle = "#4A4E69"; //[cite: 2]
    ctx.lineWidth = 3; //[cite: 2]
    ctx.strokeRect(0, 0, BOARD_CONFIG.WIDTH, BOARD_CONFIG.HEIGHT); //[cite: 2]
  }

  private drawPastaNodePass(
    ctx: CanvasRenderingContext2D, //[cite: 2]
    col: number, //[cite: 2]
    row: number, //[cite: 2]
    connections: Record<Direction, boolean>, //[cite: 2]
    pass: "shadow" | "body", //[cite: 2]
  ): void {
    const tileSize = BOARD_CONFIG.TILE_SIZE; //[cite: 2]
    const cx = col * tileSize + tileSize / 2; //[cite: 2]
    const cy = row * tileSize + tileSize / 2; //[cite: 2]
    const noodleWidth = 14; //
    const overlap = 3; // Seamless connection overlap

    const wX = this.getDeterministicOffset(col, row, 1, 2.0); //
    const wY = this.getDeterministicOffset(col, row, 2, 2.0); //
    const midX = cx + wX; //
    const midY = cy + wY; //

    const topPoint = { x: cx, y: row * tileSize - overlap }; //
    const rightPoint = { x: (col + 1) * tileSize + overlap, y: cy }; //
    const bottomPoint = { x: cx, y: (row + 1) * tileSize + overlap }; //
    const leftPoint = { x: col * tileSize - overlap, y: cy }; //

    ctx.save(); //

    const tracePastaPaths = (context: CanvasRenderingContext2D) => {
      //
      context.beginPath(); //
      const activeDirs = (["N", "E", "S", "W"] as Direction[]).filter(d => connections[d]); //

      if (activeDirs.length !== 2) {
        //
        if (connections.N) {
          context.moveTo(midX, midY);
          context.quadraticCurveTo(cx + wX * 0.5, (cy + topPoint.y) / 2, topPoint.x, topPoint.y);
        } //
        if (connections.E) {
          context.moveTo(midX, midY);
          context.quadraticCurveTo((cx + rightPoint.x) / 2, cy + wY * 0.5, rightPoint.x, rightPoint.y);
        } //
        if (connections.S) {
          context.moveTo(midX, midY);
          context.quadraticCurveTo(cx + wX * 0.5, (cy + bottomPoint.y) / 2, bottomPoint.x, bottomPoint.y);
        } //
        if (connections.W) {
          context.moveTo(midX, midY);
          context.quadraticCurveTo((cx + leftPoint.x) / 2, cy + wY * 0.5, leftPoint.x, leftPoint.y);
        } //
      } else if (connections.N && connections.E) {
        //
        context.moveTo(topPoint.x, topPoint.y);
        context.quadraticCurveTo(midX, midY, rightPoint.x, rightPoint.y); //
      } else if (connections.E && connections.S) {
        //
        context.moveTo(rightPoint.x, rightPoint.y);
        context.quadraticCurveTo(midX, midY, bottomPoint.x, bottomPoint.y); //
      } else if (connections.S && connections.W) {
        //
        context.moveTo(bottomPoint.x, bottomPoint.y);
        context.quadraticCurveTo(midX, midY, leftPoint.x, leftPoint.y); //
      } else if (connections.W && connections.N) {
        //
        context.moveTo(leftPoint.x, leftPoint.y);
        context.quadraticCurveTo(midX, midY, topPoint.x, topPoint.y); //
      } else if (connections.N && connections.S) {
        //
        context.moveTo(topPoint.x, topPoint.y);
        context.quadraticCurveTo(midX, midY, bottomPoint.x, bottomPoint.y); //
      } else if (connections.E && connections.W) {
        //
        context.moveTo(leftPoint.x, leftPoint.y);
        context.quadraticCurveTo(midX, midY, rightPoint.x, rightPoint.y); //
      }
    };

    if (pass === "shadow") {
      //
      // Draw ONLY dark outline for all tiles first
      ctx.strokeStyle = "#1A0900"; //
      ctx.lineWidth = noodleWidth + 4; //
      ctx.lineCap = "round"; //
      ctx.lineJoin = "round"; //
      tracePastaPaths(ctx); //
      ctx.stroke(); //
    } else {
      // Draw primary golden noodle body & inner sauce highlight on top
      ctx.lineCap = "round"; //
      ctx.lineJoin = "round"; //

      ctx.strokeStyle = "#F4A261"; //
      ctx.lineWidth = noodleWidth; //
      tracePastaPaths(ctx); //
      ctx.stroke(); //

      ctx.strokeStyle = "#E9C46A"; //
      ctx.lineWidth = 4; //
      tracePastaPaths(ctx); //
      ctx.stroke(); //
    }

    ctx.restore(); //
  }

  private getDeterministicOffset(col: number, row: number, seedKey: number, intensity: number = 2.5): number {
    const seed = (col * 73856093) ^ (row * 19349663) ^ (seedKey * 83492791);
    const x = Math.sin(seed) * 10000;
    return (x - Math.floor(x) - 0.5) * 2 * intensity; // Value between -intensity and +intensity
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
