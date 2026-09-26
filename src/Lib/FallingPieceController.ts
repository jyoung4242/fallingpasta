import * as ex from "excalibur";
import { BOARD_CONFIG, Piece, IngredientType } from "../gameTypes";
import { BoardElement } from "../Actors/board";
import { SpaghettiChainManager } from "./SpaghettiChain";
import { Resources } from "../resources";

export interface PieceControllerDelegate {
  onPieceLocked: () => void;
  onGameOver: () => void;
}

export class FallingPieceController {
  private board: BoardElement;
  private delegate: PieceControllerDelegate;
  private chainManager: SpaghettiChainManager = new SpaghettiChainManager(); // Add instance

  public activePiece: Piece | null = null;
  private dropTimer: number = 0;

  // Speeds in milliseconds
  public normalDropInterval: number = 1000; // Normal speed (1 sec per tile)
  public fastDropInterval: number = 50; // Soft drop speed when holding Down/S

  // Movement repeat delay for smooth horizontal sliding
  private keyRepeatTimer: number = 0;
  private keyRepeatDelay: number = 120; // ms repeat rate for held left/right

  constructor(board: BoardElement, delegate: PieceControllerDelegate) {
    this.board = board;
    this.delegate = delegate;
  }

  public spawnPiece(piece: Piece): boolean {
    this.activePiece = piece;
    this.dropTimer = 0;

    // Check if spawn location is blocked (Game Over condition)
    if (this.checkCollision(this.activePiece, 0, 0)) {
      this.delegate.onGameOver();
      return false;
    }
    return true;
  }

  public update(engine: ex.Engine, delta: number): void {
    if (!this.activePiece) return;

    const keyboard = engine.input.keyboard;

    // 1. Handle Discrete Inputs (Rotate & Hard Drop)
    if (keyboard.wasPressed(ex.Keys.Up) || keyboard.wasPressed(ex.Keys.W) || keyboard.wasPressed(ex.Keys.E)) {
      Resources.sfx_rotate.play();
      this.tryRotate();
    }

    if (keyboard.wasPressed(ex.Keys.Space)) {
      Resources.sfx_move.play();
      this.hardDrop();
      return;
    }

    // 2. Smooth Horizontal Movement (Tap or Hold Left/Right)
    this.handleHorizontalInput(keyboard, delta);

    // 3. Dynamic Soft Drop (Hold Down/S to fall faster)
    const isSoftDropping = keyboard.isHeld(ex.Keys.Down) || keyboard.isHeld(ex.Keys.S);

    const currentInterval = isSoftDropping ? this.fastDropInterval : this.normalDropInterval;

    // 4. Gravity Tick
    this.dropTimer += delta;
    if (this.dropTimer >= currentInterval) {
      this.dropTimer = 0;
      this.stepGravity();
    }
  }

  private handleHorizontalInput(keyboard: ex.Keyboard, delta: number): void {
    const isLeft = keyboard.isHeld(ex.Keys.Left) || keyboard.isHeld(ex.Keys.A);
    const isRight = keyboard.isHeld(ex.Keys.Right) || keyboard.isHeld(ex.Keys.D);

    const wasLeftPressed = keyboard.wasPressed(ex.Keys.Left) || keyboard.wasPressed(ex.Keys.A);
    const wasRightPressed = keyboard.wasPressed(ex.Keys.Right) || keyboard.wasPressed(ex.Keys.D);

    // Initial press moves immediately
    if (wasLeftPressed) {
      this.moveHorizontal(-1);
      this.keyRepeatTimer = 0;
    } else if (wasRightPressed) {
      this.moveHorizontal(1);
      this.keyRepeatTimer = 0;
    } else if (isLeft || isRight) {
      // Repeat movement if key is held
      this.keyRepeatTimer += delta;
      if (this.keyRepeatTimer >= this.keyRepeatDelay) {
        this.keyRepeatTimer = 0;
        this.moveHorizontal(isLeft ? -1 : 1);
      }
    }
  }

  public setLevelSpeed(level: number): void {
    // Ramps speed up by 15% each level, capped at a blistering 100ms
    this.normalDropInterval = Math.max(100, Math.floor(1000 * Math.pow(0.85, level - 1)));

    // Scale soft drop speed slightly at high levels so soft dropping remains distinct
    this.fastDropInterval = Math.max(20, Math.floor(this.normalDropInterval * 0.1));
  }

  public moveHorizontal(dir: number): boolean {
    if (!this.activePiece) return false;
    if (!this.checkCollision(this.activePiece, dir, 0)) {
      this.activePiece.col += dir;
      Resources.sfx_move.play();
      return true;
    }
    return false;
  }

  public tryRotate(): boolean {
    if (!this.activePiece) return false;

    // Test rotation
    this.activePiece.rotateClockwise();

    // Basic wall-kick offset testing (Center, Left 1, Right 1)
    const offsets = [0, -1, 1];
    for (const offset of offsets) {
      if (!this.checkCollision(this.activePiece, offset, 0)) {
        this.activePiece.col += offset;
        return true;
      }
    }

    // If all offset tests fail, revert rotation
    this.activePiece.rotateCounterClockwise();
    return false;
  }

  public stepGravity(): void {
    if (!this.activePiece) return;

    if (!this.checkCollision(this.activePiece, 0, 1)) {
      this.activePiece.row += 1;
    } else {
      this.lockPiece();
    }
  }

  public hardDrop(): void {
    if (!this.activePiece) return;

    while (!this.checkCollision(this.activePiece, 0, 1)) {
      this.activePiece.row += 1;
    }
    this.lockPiece();
  }

  private lockPiece(): void {
    if (!this.activePiece) return;

    const cells = this.activePiece.getOccupiedCells();
    const placedPositions: { col: number; row: number }[] = [];

    console.log("--- LOCK PIECE TRIGGERED ---");
    console.log("Occupied Cells:", cells);

    for (const cell of cells) {
      placedPositions.push({ col: cell.col, row: cell.row });

      if (cell.type === "Spaghetti") {
        const newNode = {
          type: "Spaghetti" as const,
          chainId: Date.now() + Math.random(),
          connections: { N: false, E: false, S: false, W: false },
        };
        console.log(`Setting PastaNode at (${cell.col}, ${cell.row}):`, newNode);
        this.board.setCell(cell.col, cell.row, newNode);
      } else {
        this.board.setCell(cell.col, cell.row, cell.type);
      }
    }

    // 2. Link newly landed spaghetti nodes into adjacent open pasta neighbors
    console.log("Calling linkNewSpaghettiNodes with positions:", placedPositions);
    this.chainManager.linkNewSpaghettiNodes(this.board, placedPositions);

    this.activePiece = null;
    this.delegate.onPieceLocked();
  }

  /**
   * Tests whether active piece would collide with board boundaries or locked blocks.
   */
  private checkCollision(piece: Piece, offsetCol: number, offsetRow: number): boolean {
    const cells = piece.getOccupiedCells();

    for (const cell of cells) {
      const targetCol = cell.col + offsetCol;
      const targetRow = cell.row + offsetRow;

      // Wall / Floor Bounds Check
      if (targetCol < 0 || targetCol >= BOARD_CONFIG.COLS || targetRow < 0 || targetRow >= BOARD_CONFIG.ROWS) {
        return true;
      }

      // Check against occupied board grid
      if (!this.board.isEmpty(targetCol, targetRow)) {
        return true;
      }
    }

    return false;
  }
}
