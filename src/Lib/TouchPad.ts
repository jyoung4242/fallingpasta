import { ScreenElement, Actor, Color, Vector, CoordPlane, PointerEvent, Canvas, Engine, Keys } from "excalibur";
import { Signal } from "./Signals";

export interface TouchPadOptions {
  position: Vector; // Bottom-right anchor position
  buttonSize?: number;
  gap?: number;
}

export class TouchPad extends ScreenElement {
  private buttonSize: number;
  private gap: number;
  private upSignal: Signal = new Signal("rotate");
  private dropSignal: Signal = new Signal("drop");

  constructor(options: TouchPadOptions) {
    super({
      pos: options.position,
      anchor: Vector.Half,
      coordPlane: CoordPlane.Screen,
    });

    this.buttonSize = options.buttonSize ?? 52;
    this.gap = options.gap ?? 8;
  }

  onInitialize(engine: Engine) {
    const s = this.buttonSize;
    const g = this.gap;
    const step = s + g;

    // Layout configuration with width override for the DROP button
    const layout: { key: Keys; label: string; pos: Vector; width?: number; fontSize?: string }[] = [
      { key: Keys.Space, label: "DROP", pos: new Vector(0, -step * 2), width: s * 2 + g, fontSize: "bold 16px sans-serif" },
      { key: Keys.Up, label: "▲", pos: new Vector(0, -step) },
      { key: Keys.Left, label: "◀", pos: new Vector(-step, 0) },
      { key: Keys.Right, label: "▶", pos: new Vector(step, 0) },
      { key: Keys.Down, label: "▼", pos: new Vector(0, 0) },
    ];

    layout.forEach(({ key, label, pos, width, fontSize }) => {
      const btnWidth = width ?? s;
      const font = fontSize ?? "bold 20px sans-serif";

      const btn = new ScreenElement({
        pos: pos,
        width: btnWidth,
        height: s,
        anchor: Vector.Half,
        coordPlane: CoordPlane.Screen,
      });

      btn.graphics.use(this.createButtonGraphic(btnWidth, s, label, font, false));

      btn.on("pointerdown", (evt: PointerEvent) => {
        btn.graphics.use(this.createButtonGraphic(btnWidth, s, label, font, true));
        engine.input.keyboard.triggerEvent("down", key);
      });

      const releaseHandler = () => {
        btn.graphics.use(this.createButtonGraphic(btnWidth, s, label, font, false));
        engine.input.keyboard.triggerEvent("up", key);
      };

      btn.on("pointerup", () => {
        btn.graphics.use(this.createButtonGraphic(btnWidth, s, label, font, false));
        engine.input.keyboard.triggerEvent("up", key);
        if (key === Keys.Up) {
          this.upSignal.send();
        } else if (key === Keys.Space) {
          this.dropSignal.send();
        }
      });
      btn.on("pointerleave", releaseHandler);

      this.addChild(btn);
    });
  }

  private createButtonGraphic(width: number, height: number, label: string, font: string, isPressed: boolean) {
    const canvas = new Canvas({
      width: width,
      height: height,
      cache: true,
      draw: ctx => {
        // Background fill
        ctx.fillStyle = isPressed ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.3)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 2;

        // Rounded rectangle
        ctx.beginPath();
        ctx.roundRect(0, 0, width, height, 8);
        ctx.fill();
        ctx.stroke();

        // Label Text
        ctx.fillStyle = "#FFFFFF";
        ctx.font = font;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, width / 2, height / 2);
      },
    });

    return canvas;
  }
}
