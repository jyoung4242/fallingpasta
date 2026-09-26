import * as ex from "excalibur";
import { HighScoreManager } from "../Lib/HighScoreManager";
import { MuteButton } from "../Actors/muteButton";
import { AudioControlGroup } from "../Actors/audiocontrol";

export interface GameOverData {
  finalScore: number;
  levelReached: number;
}

export class GameOverScene extends ex.Scene {
  private scoreLabel!: ex.Label;
  private levelLabel!: ex.Label;
  private newRecordLabel!: ex.Label;
  private audioControls!: AudioControlGroup;

  public override onInitialize(engine: ex.Engine): void {
    this.createBackground(engine);
    this.createTitle(engine);
    this.createStats(engine);
    this.createButtons(engine);

    this.audioControls = new AudioControlGroup(engine.drawWidth - 80, 30);
    this.add(this.audioControls);
  }

  public override onActivate(context: ex.SceneActivationContext<GameOverData>): void {
    if (this.audioControls) {
      this.audioControls.updateVisualState();
    }
    if (context.data) {
      const { finalScore, levelReached } = context.data;

      // Check and update high score
      const isNewHighScore = HighScoreManager.updateHighScore(finalScore);
      const highScore = HighScoreManager.getHighScore();

      if (this.scoreLabel) {
        this.scoreLabel.text = `SCORE: ${finalScore}  |  BEST: ${highScore}`;
      }
      if (this.levelLabel) {
        this.levelLabel.text = `LEVEL REACHED: ${levelReached}`;
      }

      // Show "NEW HIGH SCORE!" callout if beaten
      if (this.newRecordLabel) {
        this.newRecordLabel.graphics.opacity = isNewHighScore ? 1 : 0;
      }
    }
  }

  private createBackground(engine: ex.Engine): void {
    const bg = new ex.Actor({
      x: engine.drawWidth / 2,
      y: engine.drawHeight / 2,
      width: engine.drawWidth,
      height: engine.drawHeight,
      color: ex.Color.fromHex("#0f0f1b"),
    });
    this.add(bg);
  }

  private createTitle(engine: ex.Engine): void {
    const title = new ex.Label({
      text: "GAME OVER",
      pos: ex.vec(engine.drawWidth / 2, 130),
      font: new ex.Font({
        family: "sans-serif",
        size: 52,
        bold: true,
        color: ex.Color.fromHex("#ff2e63"),
        textAlign: ex.TextAlign.Center,
      }),
    });
    this.add(title);
  }

  private createStats(engine: ex.Engine): void {
    const centerX = engine.drawWidth / 2;

    this.newRecordLabel = new ex.Label({
      text: "★ NEW HIGH SCORE! ★",
      pos: ex.vec(centerX, 200),
      font: new ex.Font({
        family: "sans-serif",
        size: 18,
        bold: true,
        color: ex.Color.fromHex("#ff2e63"),
        textAlign: ex.TextAlign.Center,
      }),
    });
    this.newRecordLabel.graphics.opacity = 0; // Hidden by default

    this.scoreLabel = new ex.Label({
      text: "SCORE: 0  |  BEST: 0",
      pos: ex.vec(centerX, 235),
      font: new ex.Font({
        family: "monospace",
        size: 20,
        bold: true,
        color: ex.Color.fromHex("#08d9d6"),
        textAlign: ex.TextAlign.Center,
      }),
    });

    this.levelLabel = new ex.Label({
      text: "LEVEL REACHED: 1",
      pos: ex.vec(centerX, 270),
      font: new ex.Font({
        family: "monospace",
        size: 16,
        color: ex.Color.fromHex("#eaeaea"),
        textAlign: ex.TextAlign.Center,
      }),
    });

    this.add(this.newRecordLabel);
    this.add(this.scoreLabel);
    this.add(this.levelLabel);
  }

  private createButtons(engine: ex.Engine): void {
    const centerX = engine.drawWidth / 2;

    // --- RESTART BUTTON ---
    const restartBtn = new ex.Actor({
      x: centerX,
      y: 350,
      width: 220,
      height: 50,
      color: ex.Color.fromHex("#08d9d6"),
    });

    const restartLabel = new ex.Label({
      text: "PLAY AGAIN",
      pos: ex.vec(0, -8),
      font: new ex.Font({
        family: "sans-serif",
        size: 20,
        bold: true,
        color: ex.Color.fromHex("#252a34"),
        textAlign: ex.TextAlign.Center,
      }),
    });
    restartBtn.addChild(restartLabel);

    restartBtn.pointer.useGraphicsBounds = true;
    restartBtn.on("pointerenter", () => (restartBtn.color = ex.Color.fromHex("#25f1ed")));
    restartBtn.on("pointerleave", () => (restartBtn.color = ex.Color.fromHex("#08d9d6")));
    restartBtn.on("pointerup", () => {
      engine.goToScene("game");
    });

    // --- MAIN MENU BUTTON ---
    const menuBtn = new ex.Actor({
      x: centerX,
      y: 420,
      width: 220,
      height: 50,
      color: ex.Color.fromHex("#ff2e63"),
    });

    const menuLabel = new ex.Label({
      text: "MAIN MENU",
      pos: ex.vec(0, -8),
      font: new ex.Font({
        family: "sans-serif",
        size: 20,
        bold: true,
        color: ex.Color.White,
        textAlign: ex.TextAlign.Center,
      }),
    });
    menuBtn.addChild(menuLabel);

    menuBtn.pointer.useGraphicsBounds = true;
    menuBtn.on("pointerenter", () => (menuBtn.color = ex.Color.fromHex("#ff537c")));
    menuBtn.on("pointerleave", () => (menuBtn.color = ex.Color.fromHex("#ff2e63")));
    menuBtn.on("pointerup", () => {
      engine.goToScene("main");
    });

    this.add(restartBtn);
    this.add(menuBtn);
  }
}
