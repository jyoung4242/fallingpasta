import * as ex from "excalibur";

export class PauseOverlay extends ex.Actor {
  constructor(width: number, height: number) {
    super({
      x: width / 2,
      y: height / 2,
      width,
      height,
      color: ex.Color.fromRGB(0, 0, 0, 0.75), // Darkened backdrop
      z: 999, // Ensure it renders above all gameplay elements
    });

    // Lock to screen space so camera shake doesn't move it
    this.transform.coordPlane = ex.CoordPlane.Screen;
  }

  public override onInitialize(_engine: ex.Engine): void {
    const titleLabel = new ex.Label({
      text: "PAUSED",
      pos: ex.vec(0, -20),
      font: new ex.Font({
        family: "sans-serif",
        size: 42,
        bold: true,
        color: ex.Color.fromHex("#ff2e63"),
        textAlign: ex.TextAlign.Center,
      }),
    });

    const subLabel = new ex.Label({
      text: "Press ` to Resume",
      pos: ex.vec(0, 30),
      font: new ex.Font({
        family: "monospace",
        size: 16,
        color: ex.Color.fromHex("#eaeaea"),
        textAlign: ex.TextAlign.Center,
      }),
    });

    this.addChild(titleLabel);
    this.addChild(subLabel);

    // Start hidden
    this.hide();
  }

  public show(): void {
    this.graphics.opacity = 1;
  }

  public hide(): void {
    this.graphics.opacity = 0;
  }
}
