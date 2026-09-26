import * as ex from "excalibur";
import { HighScoreManager } from "../Lib/HighScoreManager";
import { MuteButton } from "../Actors/muteButton";
import { AudioControlGroup } from "../Actors/audiocontrol";
import { Resources } from "../resources";

interface RevivableActor extends ex.Actor {
  revive: () => void;
}

export class MainMenuScene extends ex.Scene {
  private howToPlayOverlay!: RevivableActor;
  private isHowToPlayVisible: boolean = false;
  private audioControls!: AudioControlGroup;

  public override onInitialize(engine: ex.Engine): void {
    this.createBackground(engine);
    this.createTitle(engine);
    this.createMenuButtons(engine);
    this.createHowToPlayOverlay(engine);

    this.audioControls = new AudioControlGroup(engine.drawWidth - 80, 30);
    this.add(this.audioControls);
  }

  private createBackground(engine: ex.Engine): void {
    const bg = new ex.Actor({
      x: engine.drawWidth / 2,
      y: engine.drawHeight / 2,
      width: engine.drawWidth,
      height: engine.drawHeight,
      color: ex.Color.fromHex("#1a1a2e"),
    });
    this.add(bg);
  }

  public override onActivate(): void {
    if (this.audioControls) {
      this.audioControls.updateVisualState();
    }
  }

  private createTitle(engine: ex.Engine): void {
    const title = new ex.Label({
      text: "PASTA CASCADE",
      pos: ex.vec(engine.drawWidth / 2, 120),
      font: new ex.Font({
        family: "sans-serif",
        size: 48,
        bold: true,
        color: ex.Color.fromHex("#ff2e63"),
        textAlign: ex.TextAlign.Center,
      }),
    });

    const subtitle = new ex.Label({
      text: "Match Ingredients & Build Longest Chains!",
      pos: ex.vec(engine.drawWidth / 2, 175),
      font: new ex.Font({
        family: "sans-serif",
        size: 18,
        color: ex.Color.fromHex("#eaeaea"),
        textAlign: ex.TextAlign.Center,
      }),
    });

    this.add(title);
    this.add(subtitle);

    const highScore = HighScoreManager.getHighScore();
    const highScoreLabel = new ex.Label({
      text: `HIGH SCORE: ${highScore}`,
      pos: ex.vec(engine.drawWidth / 2, 215),
      font: new ex.Font({
        family: "monospace",
        size: 16,
        bold: true,
        color: ex.Color.fromHex("#08d9d6"),
        textAlign: ex.TextAlign.Center,
      }),
    });

    this.add(highScoreLabel);
  }

  private createMenuButtons(engine: ex.Engine): void {
    const centerX = engine.drawWidth / 2;

    // --- PLAY BUTTON ---
    const playBtn = new ex.Actor({
      x: centerX,
      y: 280,
      width: 220,
      height: 50,
      color: ex.Color.fromHex("#08d9d6"),
    });

    const playLabel = new ex.Label({
      text: "START GAME",
      pos: ex.vec(0, -8),
      font: new ex.Font({
        family: "sans-serif",
        size: 20,
        bold: true,
        color: ex.Color.fromHex("#252a34"),
        textAlign: ex.TextAlign.Center,
      }),
    });
    playBtn.addChild(playLabel);

    playBtn.pointer.useGraphicsBounds = true;
    playBtn.on("pointerenter", () => (playBtn.color = ex.Color.fromHex("#25f1ed")));
    playBtn.on("pointerleave", () => (playBtn.color = ex.Color.fromHex("#08d9d6")));
    playBtn.on("pointerup", () => {
      Resources.sfx_select.play();
      engine.goToScene("game"); // Transition to main gameplay scene
    });

    // --- HOW TO PLAY BUTTON ---
    const howToPlayBtn = new ex.Actor({
      x: centerX,
      y: 350,
      width: 220,
      height: 50,
      color: ex.Color.fromHex("#ff2e63"),
    });

    const howToPlayLabel = new ex.Label({
      text: "HOW TO PLAY",
      pos: ex.vec(0, -8),
      font: new ex.Font({
        family: "sans-serif",
        size: 20,
        bold: true,
        color: ex.Color.White,
        textAlign: ex.TextAlign.Center,
      }),
    });
    howToPlayBtn.addChild(howToPlayLabel);

    howToPlayBtn.pointer.useGraphicsBounds = true;
    howToPlayBtn.on("pointerenter", () => (howToPlayBtn.color = ex.Color.fromHex("#ff537c")));
    howToPlayBtn.on("pointerleave", () => (howToPlayBtn.color = ex.Color.fromHex("#ff2e63")));
    howToPlayBtn.on("pointerup", () => {
      this.toggleHowToPlay(true);
    });

    this.add(playBtn);
    this.add(howToPlayBtn);
  }

  private createHowToPlayOverlay(engine: ex.Engine): void {
    const centerX = engine.drawWidth / 2;
    const centerY = engine.drawHeight / 2;

    // Dark semi-transparent backdrop panel
    this.howToPlayOverlay = new ex.Actor({
      x: centerX,
      y: centerY,
      width: 480,
      height: 380,
      color: ex.Color.fromRGB(20, 20, 35, 0.95),
      z: 100, // Ensure it draws over menu elements
    }) as RevivableActor;

    // Define the custom revive method directly on the actor instance
    this.howToPlayOverlay.revive = () => {
      this.howToPlayOverlay.graphics.opacity = 1;
      this.howToPlayOverlay.pointer.useGraphicsBounds = true;
      this.howToPlayOverlay.children.forEach(child => {
        if (child instanceof ex.Actor) {
          child.pointer.useGraphicsBounds = true;
        }
      });
    };

    // Override kill to handle custom hide logic
    const originalKill = this.howToPlayOverlay.kill.bind(this.howToPlayOverlay);
    this.howToPlayOverlay.kill = () => {
      this.howToPlayOverlay.graphics.opacity = 0;
      this.howToPlayOverlay.pointer.useGraphicsBounds = false;
      this.howToPlayOverlay.children.forEach(child => {
        if (child instanceof ex.Actor) {
          child.pointer.useGraphicsBounds = false;
        }
      });
      return this.howToPlayOverlay;
    };

    // Header Title
    const header = new ex.Label({
      text: "HOW TO PLAY",
      pos: ex.vec(0, -150),
      font: new ex.Font({
        family: "sans-serif",
        size: 24,
        bold: true,
        color: ex.Color.fromHex("#08d9d6"),
        textAlign: ex.TextAlign.Center,
      }),
    });
    this.howToPlayOverlay.addChild(header);

    // Rule Instructions
    const rules = [
      "1. CONTROLS: Arrow keys / WASD to move & rotate pieces.",
      "   UP rotates, DOWN drops, L/R moves piece horizontally",
      "2. MATCH 3: Align 3+ matching ingredients (Tomato, Basil,",
      "   Cheese, Garlic, Meatball, Bread) to clear them from ",
      "   the board.",
      "3. SPAGHETTI CHAINS: Spaghetti tiles do NOT match.",
      "   Instead, adjacent Spaghetti links together automatically.",
      "4. GOAL: Connect Spaghetti into chains to reach target ,",
      "   length to hit level goal",
    ];

    rules.forEach((line, index) => {
      const lineLabel = new ex.Label({
        text: line,
        pos: ex.vec(-210, -100 + index * 32),
        font: new ex.Font({
          family: "monospace",
          size: 13,
          color: ex.Color.fromHex("#eaeaea"),
          textAlign: ex.TextAlign.Left,
        }),
      });
      this.howToPlayOverlay.addChild(lineLabel);
    });

    // Close / Back Button
    const closeBtn = new ex.Actor({
      x: 0,
      y: 250,
      width: 140,
      height: 40,
      color: ex.Color.fromHex("#ff2e63"),
    });

    const closeLabel = new ex.Label({
      text: "GOT IT!",
      pos: ex.vec(0, -8),
      font: new ex.Font({
        family: "sans-serif",
        size: 16,
        bold: true,
        color: ex.Color.White,
        textAlign: ex.TextAlign.Center,
      }),
    });
    closeBtn.addChild(closeLabel);

    closeBtn.pointer.useGraphicsBounds = true;
    closeBtn.on("pointerup", () => this.toggleHowToPlay(false));

    this.howToPlayOverlay.addChild(closeBtn);

    // Add overlay to scene and hide initially
    this.add(this.howToPlayOverlay);
    this.howToPlayOverlay.graphics.opacity = 0;
    this.howToPlayOverlay.kill(); // Disable input & interaction while hidden
  }

  private toggleHowToPlay(show: boolean): void {
    Resources.sfx_select.play();
    this.isHowToPlayVisible = show;
    if (show) {
      this.howToPlayOverlay.revive();
      this.howToPlayOverlay.graphics.opacity = 1;
    } else {
      this.howToPlayOverlay.graphics.opacity = 0;
      this.howToPlayOverlay.kill();
    }
  }
}
