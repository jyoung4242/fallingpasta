// main.ts
import { BoardElement } from "./Actors/board";
import { HudElement } from "./Actors/hud";
import { BOARD_POSITION, HUD_POSITION } from "./gameTypes";
import { AudioManager } from "./Lib/audioManager";
import { loader, Resources } from "./resources";
import { GameOverScene } from "./Scenes/GameOver";
import { GameScene } from "./Scenes/gameScene";
import { MainMenuScene } from "./Scenes/mainMenuScene";
import "./style.css";

import { Engine, DisplayMode, vec, SoundManager } from "excalibur";

const game = new Engine({
  width: 800, // the width of the canvas
  height: 800, // the height of the canvas
  displayMode: DisplayMode.Fixed, // the display mode
  pixelArt: true,
  scenes: {
    game: new GameScene(),
    main: new MainMenuScene(),
    gameOver: new GameOverScene(),
  },
});

await game.start(loader);
AudioManager.init();

game.goToScene("main");
