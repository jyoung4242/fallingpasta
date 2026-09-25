// resources.ts
import { ImageSource, Loader } from "excalibur";
import pasta from "./Assets/pasta.png";
import basil from "./Assets/basil.png";
import cheese from "./Assets/cheese.png";
import meatball from "./Assets/meatball.png";
import bread from "./Assets/bread.png";
import garlic from "./Assets/garlic.png";
import tomato from "./Assets/tomato.png";

export const Resources = {
  pasta: new ImageSource(pasta),
  basil: new ImageSource(basil),
  meatball: new ImageSource(meatball),
  cheese: new ImageSource(cheese),
  bread: new ImageSource(bread),
  garlic: new ImageSource(garlic),
  tomato: new ImageSource(tomato),
};

export const loader = new Loader();

for (let res of Object.values(Resources)) {
  loader.addResource(res);
}
