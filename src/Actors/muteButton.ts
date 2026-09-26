import * as ex from "excalibur";
import { AudioManager } from "../Lib/audioManager";

export class MuteButton extends ex.Actor {
  private label!: ex.Label;

  constructor(x: number, y: number) {
    super({
      x,
      y,
      width: 80,
      height: 36,
      color: ex.Color.fromHex("#252a34"),
      z: 200, // Keep UI elements on top
    });
  }

  public override onInitialize(_engine: ex.Engine): void {
    this.label = new ex.Label({
      text: "",
      pos: ex.vec(0, -7),
      font: new ex.Font({
        family: "sans-serif",
        size: 14,
        bold: true,
        color: ex.Color.White,
        textAlign: ex.TextAlign.Center,
      }),
    });
    this.addChild(this.label);

    this.pointer.useGraphicsBounds = true;
    this.on("pointerenter", () => (this.color = ex.Color.fromHex("#3f4656")));
    this.on("pointerleave", () => (this.color = ex.Color.fromHex("#252a34")));
    this.on("pointerup", () => this.toggleMute());

    this.updateVisualState();
  }

  private toggleMute(): void {
    const isMuted = AudioManager.getIsBGMMuted(); //|| AudioManager.getIsSFXMuted()

    if (isMuted) {
      if (AudioManager.getIsBGMMuted()) AudioManager.toggleBGMMute();
      //   if (AudioManager.getIsSFXMuted()) AudioManager.toggleSFXMute();
    } else {
      if (!AudioManager.getIsBGMMuted()) AudioManager.toggleBGMMute();
      //   if (!AudioManager.getIsSFXMuted()) AudioManager.toggleSFXMute();
    }

    this.updateVisualState();
  }

  public updateVisualState(): void {
    const isMuted = AudioManager.getIsBGMMuted(); // || AudioManager.getIsSFXMuted()
    console.log(isMuted, "bgm mute?");

    this.label.text = isMuted ? "🔊 MUTED" : "🔊 SOUND";
  }
}
