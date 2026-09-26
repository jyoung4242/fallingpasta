import * as ex from "excalibur";
import { AudioManager } from "../Lib/audioManager";

export class AudioControlGroup extends ex.Actor {
  private muteLabel!: ex.Label;

  constructor(x: number, y: number) {
    super({
      x,
      y,
      width: 140,
      height: 36,
      z: 300, // Top UI layer
    });
  }

  public override onInitialize(_engine: ex.Engine): void {
    // --- 1. MUTE BUTTON ---
    const muteBtn = new ex.Actor({
      x: -30,
      y: 0,
      width: 80,
      height: 36,
      color: ex.Color.fromHex("#252a34"),
    });

    this.muteLabel = new ex.Label({
      text: "",
      pos: ex.vec(0, -7),
      font: new ex.Font({
        family: "sans-serif",
        size: 13,
        bold: true,
        color: ex.Color.White,
        textAlign: ex.TextAlign.Center,
      }),
    });
    muteBtn.addChild(this.muteLabel);

    muteBtn.pointer.useGraphicsBounds = true;
    muteBtn.on("pointerenter", () => (muteBtn.color = ex.Color.fromHex("#3f4656")));
    muteBtn.on("pointerleave", () => (muteBtn.color = ex.Color.fromHex("#252a34")));
    muteBtn.on("pointerup", () => {
      AudioManager.toggleBGMMute();
      AudioManager.toggleSFXMute();
      this.updateVisualState();
    });

    // --- 2. SKIP TRACK BUTTON ---
    const skipBtn = new ex.Actor({
      x: 35,
      y: 0,
      width: 40,
      height: 36,
      color: ex.Color.fromHex("#252a34"),
    });

    const skipLabel = new ex.Label({
      text: "⏭",
      pos: ex.vec(0, -9),
      font: new ex.Font({
        family: "sans-serif",
        size: 16,
        color: ex.Color.White,
        textAlign: ex.TextAlign.Center,
      }),
    });
    skipBtn.addChild(skipLabel);

    skipBtn.pointer.useGraphicsBounds = true;
    skipBtn.on("pointerenter", () => (skipBtn.color = ex.Color.fromHex("#3f4656")));
    skipBtn.on("pointerleave", () => (skipBtn.color = ex.Color.fromHex("#252a34")));
    skipBtn.on("pointerup", () => {
      AudioManager.playNextBGM();
    });

    this.addChild(muteBtn);
    this.addChild(skipBtn);

    this.updateVisualState();
  }

  public updateVisualState(): void {
    const isMuted = AudioManager.getIsBGMMuted() || AudioManager.getIsSFXMuted();
    if (this.muteLabel) {
      this.muteLabel.text = isMuted ? "🔇 MUTED" : "🔊 SOUND";
    }
  }
}
