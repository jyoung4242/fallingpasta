import { BOARD_CONFIG, IngredientType, Piece, PieceBlock } from "../gameTypes";
import { MarbleBag, MarbleBagOptions } from "./marbleBag"; // adjust import path as needed

const MATCHABLE_INGREDIENTS: IngredientType[] = ["Tomato", "Cheese", "Basil", "Meatball", "Garlic", "Bread"];

export class PieceGenerator {
  private bag: MarbleBag<IngredientType>;

  constructor(options: MarbleBagOptions<IngredientType> = {}) {
    this.bag = new MarbleBag<IngredientType>(options);
    this.initBag();
  }

  /**
   * Initializes the bag with a balanced pool of ingredients.
   * Maintains the target ~15% Spaghetti / 85% Matchables distribution.
   */
  private initBag(): void {
    // Fill matchables (e.g., 3 of each matchable = 18 total)
    for (const matchable of MATCHABLE_INGREDIENTS) {
      this.bag.add(matchable, 3);
    }

    // Fill Spaghetti (3 total to maintain ~14.2% / 15% ratio across a 21-draw cycle)
    this.bag.add("Spaghetti", 3);

    // Initial shuffle & fill
    this.bag.refill();
  }

  /**
   * Pick an ingredient from the bag.
   */
  private getRandomIngredient(): IngredientType {
    return this.bag.draw() ?? "Tomato"; // Fallback safeguard
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
