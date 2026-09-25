import * as ex from "excalibur";
import { gameEvents, GameStateUpdateEvent } from "../Lib/GameEvents";
import { IngredientType } from "../gameTypes";
import { Resources } from "../resources";

const INGREDIENT_IMAGES: Record<IngredientType, ex.ImageSource> = {
  Tomato: Resources.tomato,
  Cheese: Resources.cheese,
  Basil: Resources.basil,
  Meatball: Resources.meatball,
  Garlic: Resources.garlic,
  Bread: Resources.bread,
  Spaghetti: Resources.pasta,
};

export class HudElement extends ex.ScreenElement {
  private levelText!: ex.Text;
  private chainText!: ex.Text;
  private scoreText!: ex.Text;
  private previewCanvas!: ex.Canvas;
  private nextPieceBlocks: IngredientType[] | null = null;

  constructor(pos: ex.Vector) {
    super({
      pos,
      width: 320,
      height: 768,
      anchor: ex.Vector.Zero,
    });
  }

  public override onInitialize(_engine: ex.Engine): void {
    // Event Subscription

    gameEvents.on("state:update", evt => this.onStateUpdate(evt));
    // 1. Title
    const titleActor = new ex.ScreenElement({ pos: ex.vec(0, 0), anchor: ex.Vector.Zero });
    titleActor.graphics.use(
      new ex.Text({
        text: "Pasta Drop",
        font: new ex.Font({ size: 36, family: "sans-serif", color: ex.Color.White, bold: true }),
      }),
    );
    this.addChild(titleActor);

    // 2. Next Block Preview Label & Canvas
    const nextLabel = new ex.ScreenElement({ pos: ex.vec(0, 80), anchor: ex.Vector.Zero });
    nextLabel.graphics.use(
      new ex.Text({
        text: "Next Block",
        font: new ex.Font({ size: 20, family: "sans-serif", color: ex.Color.fromHex("#CCCCCC") }),
      }),
    );
    this.addChild(nextLabel);

    const previewActor = new ex.ScreenElement({ pos: ex.vec(150, 60), anchor: ex.Vector.Zero });
    this.previewCanvas = new ex.Canvas({
      width: 96,
      height: 128,
      draw: ctx => this.drawNextPiece(ctx),
    });
    previewActor.graphics.use(this.previewCanvas);
    this.addChild(previewActor);

    // 3. Level Text
    const levelActor = new ex.ScreenElement({ pos: ex.vec(0, 200), anchor: ex.Vector.Zero });
    this.levelText = new ex.Text({
      text: "Current Level: 1",
      font: new ex.Font({ size: 22, family: "sans-serif", color: ex.Color.White }),
    });
    levelActor.graphics.use(this.levelText);
    this.addChild(levelActor);

    // 4. Pasta Chain Progress
    const chainActor = new ex.ScreenElement({ pos: ex.vec(0, 270), anchor: ex.Vector.Zero });
    this.chainText = new ex.Text({
      text: "Pasta Chain: 0/3",
      font: new ex.Font({ size: 22, family: "sans-serif", color: ex.Color.fromHex("#FFB703"), bold: true }),
    });
    chainActor.graphics.use(this.chainText);
    this.addChild(chainActor);

    // 5. Score Label & Value
    const scoreLabel = new ex.ScreenElement({ pos: ex.vec(0, 360), anchor: ex.Vector.Zero });
    scoreLabel.graphics.use(
      new ex.Text({
        text: "Score:",
        font: new ex.Font({ size: 28, family: "sans-serif", color: ex.Color.White, bold: true }),
      }),
    );
    this.addChild(scoreLabel);

    const scoreValActor = new ex.ScreenElement({ pos: ex.vec(0, 410), anchor: ex.Vector.Zero });
    this.scoreText = new ex.Text({
      text: "0000000",
      font: new ex.Font({ size: 32, family: "monospace", color: ex.Color.fromHex("#4EAEFF") }),
    });
    scoreValActor.graphics.use(this.scoreText);
    this.addChild(scoreValActor);
  }

  private onStateUpdate(evt: GameStateUpdateEvent): void {
    this.levelText.text = `Current Level: ${evt.level}`;
    this.chainText.text = `Pasta Chain: ${evt.chainCurrent}/${evt.chainTarget}`;
    this.scoreText.text = evt.score.toString().padStart(7, "0");

    this.nextPieceBlocks = evt.nextPieceBlocks;
    this.previewCanvas.flagDirty();
  }

  private drawNextPiece(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#1E1E24";
    ctx.fillRect(0, 0, 96, 128);
    ctx.strokeStyle = "#4A4E69";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 96, 128);

    if (!this.nextPieceBlocks) return;

    const blockSize = 40;
    const startX = (96 - blockSize) / 2; // Center horizontally
    const startY = (128 - blockSize * this.nextPieceBlocks.length) / 2; // Center vertically

    this.nextPieceBlocks.forEach((type, index) => {
      const imgSource = INGREDIENT_IMAGES[type];
      const yPos = startY + index * blockSize;

      if (imgSource?.isLoaded()) {
        ctx.drawImage(imgSource.image, startX, yPos, blockSize, blockSize);
      }

      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1;
      ctx.strokeRect(startX, yPos, blockSize, blockSize);
    });
  }
}
