// resources.ts
import { ImageSource, Loader, Sound } from "excalibur";
import pasta from "./Assets/pasta.png";
import basil from "./Assets/basil.png";
import cheese from "./Assets/cheese.png";
import meatball from "./Assets/meatball.png";
import bread from "./Assets/bread.png";
import garlic from "./Assets/garlic.png";
import tomato from "./Assets/tomato.png";

//music
import music_blossom from "./Assets/music/blossom.wav";
import music_boss from "./Assets/music/boss battle.wav";
import music_journey from "./Assets/music/journey.wav";
import music_regrowth from "./Assets/music/regrowth wip.wav";
import music_shop from "./Assets/music/shop.wav";
import music_start from "./Assets/music/start.wav";
import music_town from "./Assets/music/town.wav";
import music_yeah from "./Assets/music/yeahhhhh yuh.wav";

//sfx
import sfx_land from "./Assets/sfx/land.mp3";
import sfx_select from "./Assets/sfx/buttonselect.mp3";
import sfx_match from "./Assets/sfx/match.mp3";
import sfx_move from "./Assets/sfx/move.mp3";
import sfx_rotate from "./Assets/sfx/rotate.mp3";
import sfx_level from "./Assets/sfx/levelClear.wav";

export const Resources = {
  pasta: new ImageSource(pasta),
  basil: new ImageSource(basil),
  meatball: new ImageSource(meatball),
  cheese: new ImageSource(cheese),
  bread: new ImageSource(bread),
  garlic: new ImageSource(garlic),
  tomato: new ImageSource(tomato),
  music_blossom: new Sound({ paths: [music_blossom], loop: true }),
  music_boss: new Sound({ paths: [music_boss], loop: true }),
  music_journey: new Sound({ paths: [music_journey], loop: true }),
  music_shop: new Sound({ paths: [music_shop], loop: true }),
  music_regrowth: new Sound({ paths: [music_regrowth], loop: true }),
  music_start: new Sound({ paths: [music_start], loop: true }),
  music_town: new Sound({ paths: [music_town], loop: true }),
  music_yeah: new Sound({ paths: [music_yeah], loop: true }),
  sfx_land: new Sound(sfx_land),
  sfx_select: new Sound(sfx_select),
  sfx_match: new Sound(sfx_match),
  sfx_move: new Sound(sfx_move),
  sfx_rotate: new Sound(sfx_rotate),
  sfx_level: new Sound(sfx_level),
};

export const loader = new Loader();

for (let res of Object.values(Resources)) {
  loader.addResource(res);
}
