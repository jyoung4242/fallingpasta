import { BOARD_CONFIG, IngredientType, Piece, PieceBlock } from "../gameTypes";
import { MarbleBag, MarbleBagOptions } from "./marbleBag";

const MATCHABLE_INGREDIENTS: IngredientType[] = ["Tomato", "Cheese", "Basil", "Meatball", "Garlic", "Bread"];

export class PieceGenerator {
  private bag: MarbleBag<IngredientType>;

  constructor(options: MarbleBagOptions<IngredientType> = {}) {
    this.bag = new MarbleBag<IngredientType>(options);
    this.initBag();
  }
  private initBag(): void {
    for (const matchable of MATCHABLE_INGREDIENTS) {
      this.bag.add(matchable, 3);
    }
    this.bag.add("Spaghetti", 3);
    this.bag.refill();
  }

  private getRandomIngredient(): IngredientType {
    return this.bag.draw() ?? "Tomato";
  }

  public spawnPiece(): Piece {
    const topIngredient = this.getRandomIngredient();
    const bottomIngredient = this.getRandomIngredient();

    const blocks: PieceBlock[] = [
      { relCol: 0, relRow: 0, type: topIngredient },
      { relCol: 0, relRow: 1, type: bottomIngredient },
    ];

    const startCol = Math.floor(BOARD_CONFIG.COLS / 2) - 1;
    return new Piece(startCol, 0, blocks);
  }
}
