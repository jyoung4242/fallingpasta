import * as ex from "excalibur";
import { IngredientType } from "../gameTypes";

export interface GameStateUpdateEvent {
  level: number;
  score: number;
  chainCurrent: number;
  chainTarget: number;
  nextPieceBlocks: IngredientType[] | null;
}

export interface LevelCompleteEvent {
  level: number;
  bonusScore: number;
}

export interface GameOverEvent {
  finalScore: number;
  levelReached: number;
}

export type GameEventTypes = {
  "state:update": GameStateUpdateEvent;
  "level:complete": LevelCompleteEvent;
  "game:over": GameOverEvent;
};

export const gameEvents = new ex.EventEmitter<GameEventTypes>();
