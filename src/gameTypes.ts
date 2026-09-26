import * as ex from "excalibur";
import { Resources } from "./resources";

export const BOARD_CONFIG = {
  COLS: 8,
  ROWS: 16,
  TILE_SIZE: 48, // 48x48px per cell
  get WIDTH() {
    return this.COLS * this.TILE_SIZE;
  }, // 384px
  get HEIGHT() {
    return this.ROWS * this.TILE_SIZE;
  }, // 768px
} as const;

export type IngredientType = "Tomato" | "Cheese" | "Basil" | "Meatball" | "Garlic" | "Bread" | "Spaghetti";

export const INGREDIENT_COLORS: Record<IngredientType, ex.Color> = {
  Tomato: ex.Color.fromHex("#E63946"),
  Cheese: ex.Color.fromHex("#FFB703"),
  Basil: ex.Color.fromHex("#2A9D8F"),
  Meatball: ex.Color.fromHex("#6F4E37"),
  Garlic: ex.Color.fromHex("#EDF2F4"),
  Bread: ex.Color.fromHex("#D4A373"),
  Spaghetti: ex.Color.fromHex("#F4A261"),
};

export const BOARD_POSITION = ex.vec(32, 16);
export const HUD_POSITION = ex.vec(448, 16);

export interface GridPos {
  col: number;
  row: number;
}

export interface PieceBlock {
  // Relative grid position from piece anchor (0,0)
  relCol: number;
  relRow: number;
  type: IngredientType;
}

export class Piece {
  public col: number;
  public row: number;
  public blocks: PieceBlock[];

  constructor(col: number, row: number, blocks: PieceBlock[]) {
    this.col = col;
    this.row = row;
    this.blocks = blocks;
  }

  /**
   * Get world/board grid cells occupied by this piece
   */
  public getOccupiedCells(): { col: number; row: number; type: IngredientType }[] {
    return this.blocks.map(b => ({
      col: this.col + b.relCol,
      row: this.row + b.relRow,
      type: b.type,
    }));
  }

  /**
   * Rotate piece 90 degrees clockwise relative to anchor
   */
  public rotateClockwise(): void {
    this.blocks = this.blocks.map(b => ({
      relCol: -b.relRow,
      relRow: b.relCol,
      type: b.type,
    }));
  }

  public rotateCounterClockwise(): void {
    this.blocks = this.blocks.map(b => ({
      relCol: b.relRow,
      relRow: -b.relCol,
      type: b.type,
    }));
  }
}

// Add to gameTypes.ts or SpaghettiChainManager.ts

export type Direction = "N" | "E" | "S" | "W";

export interface PastaNode {
  type: "Spaghetti";
  chainId: number;
  connections: Record<Direction, boolean>;
}

export type GridCell = IngredientType | PastaNode | null;
