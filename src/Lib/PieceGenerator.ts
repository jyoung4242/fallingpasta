import { BOARD_CONFIG, IngredientType, Piece, PieceBlock } from "../gameTypes";

const MATCHABLE_INGREDIENTS: IngredientType[] = ["Tomato", "Cheese", "Basil", "Meatball", "Garlic", "Bread"];

export class PieceGenerator {
  /**
   * Pick an ingredient based on the 70/30 matchable vs spaghetti split.
   */
  private getRandomIngredient(): IngredientType {
    if (Math.random() < 0.15) {
      return "Spaghetti";
    }
    const idx = Math.floor(Math.random() * MATCHABLE_INGREDIENTS.length);
    return MATCHABLE_INGREDIENTS[idx];
  }

  /**
   * Generate a 2-block piece centered at top (col 3, row 0).
   */
  public spawnPiece(): Piece {
    const topIngredient = this.getRandomIngredient();
    const bottomIngredient = this.getRandomIngredient();

    // Standard 2-block vertical domino
    const blocks: PieceBlock[] = [
      { relCol: 0, relRow: 0, type: topIngredient },
      { relCol: 0, relRow: 1, type: bottomIngredient },
    ];

    const startCol = Math.floor(BOARD_CONFIG.COLS / 2) - 1; // Column 3
    return new Piece(startCol, 0, blocks);
  }
}
