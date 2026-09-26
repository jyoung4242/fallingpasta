import * as ex from "excalibur";
import { BOARD_POSITION, HUD_POSITION, Piece } from "../gameTypes";
import { BoardElement } from "../Actors/board";
import { HudElement } from "../Actors/hud";
import { PieceGenerator } from "../Lib/PieceGenerator";
import { FallingPieceController, PieceControllerDelegate } from "../Lib/FallingPieceController";
import { BoardResolver } from "../Lib/BoardResolver";
import { gameEvents } from "../Lib/GameEvents";
import { AudioControlGroup } from "../Actors/audiocontrol";
import { Resources } from "../resources";
import { AudioManager } from "../Lib/audioManager";

export class GameScene extends ex.Scene implements PieceControllerDelegate {
  private board!: BoardElement;
  private hud!: HudElement;
  private generator!: PieceGenerator;
  private controller!: FallingPieceController;
  private resolver!: BoardResolver;

  // Game Progress State
  private level: number = 1;
  private score: number = 0;
  private chainTarget: number = 3; // Level 1 target
  private currentChain: number = 0;
  private nextPiece: Piece | null = null;
  private isProcessingBoard: boolean = false;

  private audioControls!: AudioControlGroup;

  public override onInitialize(_engine: ex.Engine): void {
    // 1. Mount Board & HUD
    this.board = new BoardElement(BOARD_POSITION);
    this.hud = new HudElement(HUD_POSITION);
    this.audioControls = new AudioControlGroup(_engine.drawWidth - 80, 30);
    this.add(this.audioControls);

    this.add(this.board);
    this.add(this.hud);

    // 2. Instantiate Helpers
    this.generator = new PieceGenerator();
    this.controller = new FallingPieceController(this.board, this);
    this.resolver = new BoardResolver(this.board);

    // 3. Defer initial game start to the microtask queue so HudElement.onInitialize runs first
    _engine.clock.schedule(() => {
      this.startNewGame();
    }, 50);
  }

  public startNewGame(): void {
    this.level = 1;
    this.score = 0;
    this.chainTarget = 3;
    this.currentChain = 0;
    this.board.clearBoard();

    // Set initial speed for Level 1
    this.controller.setLevelSpeed(this.level);

    this.nextPiece = this.generator.spawnPiece();
    this.spawnNextPiece();
  }

  private spawnNextPiece(): void {
    if (!this.nextPiece) return;

    const currentPiece = this.nextPiece;
    // Generate the NEXT piece so preview is immediately ready
    this.nextPiece = this.generator.spawnPiece();

    // Pass active piece to controller
    const spawnedSuccessfully = this.controller.spawnPiece(currentPiece);
    if (spawnedSuccessfully) {
      this.board.setActivePiece(currentPiece);
    }

    // Force event broadcast immediately upon spawn
    this.syncHud();
  }
  public override onPreUpdate(engine: ex.Engine, delta: number): void {
    if (this.isProcessingBoard) return;

    // Tick active piece physics & inputs
    this.controller.update(engine, delta);
  }

  // -------------------------------------------------------------------------
  // PieceControllerDelegate Callback
  // -------------------------------------------------------------------------

  public async onPieceLocked(): Promise<void> {
    this.board.setActivePiece(null);
    this.isProcessingBoard = true;

    // Run Match-3 Clears, Cascades & Gravity
    const result = await this.resolver.resolveBoard();

    // Score evaluation
    if (result.clearedCount > 0) {
      this.score += result.clearedCount * 100;
    }

    this.currentChain = result.longestSpaghettiChain;
    this.syncHud();

    // Check Win Condition: Target Spaghetti Chain Reached
    if (this.currentChain >= this.chainTarget) {
      this.handleLevelComplete();
      this.isProcessingBoard = false;
      return;
    }

    // Spawn Next Piece
    this.isProcessingBoard = false;
    this.spawnNextPiece();
  }

  private handleLevelComplete(): void {
    this.score += 1000;
    this.level++;

    const targets = [3, 5, 7, 10, 14, 18, 24, 30];
    this.chainTarget = targets[Math.min(this.level - 1, targets.length - 1)];

    this.currentChain = 0;
    this.board.cameraShakeLarge();
    Resources.sfx_level.play();
    this.board.clearBoard();

    // Update fall speed for the new level
    this.controller.setLevelSpeed(this.level);

    gameEvents.emit("level:complete", {
      level: this.level,
      bonusScore: 1000,
    });

    this.spawnNextPiece();
  }

  public onGameOver(): void {
    AudioManager.setBGMPlaybackRate(1);
    gameEvents.emit("game:over", {
      finalScore: this.score,
      levelReached: this.level,
    });

    // Navigate to GameOver scene with context payload
    this.engine.goToScene("gameOver", {
      sceneActivationData: {
        finalScore: this.score,
        levelReached: this.level,
      },
    });
  }

  onActivate(context: ex.SceneActivationContext<unknown, undefined>): void {
    if (this.audioControls) {
      this.audioControls.updateVisualState();
    }

    this.startNewGame();
  }

  private syncHud(): void {
    gameEvents.emit("state:update", {
      level: this.level,
      score: this.score,
      chainCurrent: this.currentChain,
      chainTarget: this.chainTarget,
      nextPieceBlocks: this.nextPiece ? this.nextPiece.blocks.map(b => b.type) : null,
    });
  }
}
