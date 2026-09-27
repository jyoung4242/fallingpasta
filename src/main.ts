// main.ts

import { AudioManager } from "./Lib/audioManager";
import { loader } from "./resources";
import { GameOverScene } from "./Scenes/GameOver";
import { GameScene } from "./Scenes/gameScene";
import { MainMenuScene } from "./Scenes/mainMenuScene";
import "./style.css";

import { Engine, DisplayMode, Color } from "excalibur";

const game = new Engine({
  width: 800, // the width of the canvas
  height: 800, // the height of the canvas
  displayMode: DisplayMode.FitScreen, // the display mode
  pixelArt: true,
  scenes: {
    game: new GameScene(),
    main: new MainMenuScene(),
    gameOver: new GameOverScene(),
  },
  backgroundColor: Color.fromHex("#059ef8"),
});

await game.start(loader);
AudioManager.init();

game.goToScene("main");
