import { Color, DefaultLoader, Engine, Loadable, LoaderOptions, Screen, Util } from "excalibur";

export class PastaCascadeLoader extends DefaultLoader {
  fadeProgressBar: boolean = false;
  progressBarOpacity: number = 1.0;

  // Theme Palette
  public backgroundColor: string = "#191a2e"; // Deep midnight navy background
  public noodleColor: Color = Color.fromHex("#F7C844"); // Warm pasta yellow
  public noodleBorderColor: Color = Color.fromHex("#D35400"); // Rich amber border
  public screen: Screen | undefined = undefined;

  private static _DEFAULT_LOADER_OPTIONS: LoaderOptions = {
    loadables: [],
    fullscreenAfterLoad: false,
    fullscreenContainer: undefined,
  };

  // DOM Overlay Elements
  private _playButton!: HTMLButtonElement;
  private _gameTitleDiv!: HTMLDivElement;
  private _gameAttributeDiv!: HTMLDivElement;
  private _gameRootDiv: HTMLDivElement = document.createElement("div");
  private _instructionsDiv!: HTMLDivElement;
  private _instructionInterval: any;

  constructor(loadables?: Loadable<any>[]) {
    super(PastaCascadeLoader._DEFAULT_LOADER_OPTIONS);
    this._positionAndSizeRoot(this._gameRootDiv);
    this._playButton = this._createPlayButton();
    this._gameTitleDiv = this._createGameTitle();
    this._gameAttributeDiv = this._createExcaliburAttribute();
    this._instructionsDiv = this._createInstructions();
  }

  public override onInitialize(engine: Engine): void {
    this.engine = engine;
    this.screen = engine.screen as Screen;
    this.canvas.width = this.engine.canvas.width;
    this.canvas.height = this.engine.canvas.height;

    this.screen.events.on("resize", () => {
      this.canvas.width = this.engine.canvas.width;
      this.canvas.height = this.engine.canvas.height;
    });

    if (this.engine?.browser) {
      this.engine.browser.window.on("resize", this._positionAndSizeRoot.bind(this, this._gameRootDiv));
    }
    this._positionAndSizeRoot(this._gameRootDiv);
  }

  public override onDraw(ctx: CanvasRenderingContext2D) {
    const canvasHeight = this.engine.canvasHeight / this.engine.pixelRatio;
    const canvasWidth = this.engine.canvasWidth / this.engine.pixelRatio;

    // 1. Draw Background (#191a2e)
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 2. Noodle Loading Bar Setup
    const barWidth = Math.min(320, canvasWidth * 0.7);
    const barHeight = 24;
    const loadingX = canvasWidth / 2 - barWidth / 2;
    const loadingY = canvasHeight * 0.72;

    const progress = Math.max(0, Math.min(1, this.progress));
    const currentNoodleLength = barWidth * progress;

    if (this.progress === 1) {
      setTimeout(() => {
        this.fadeProgressBar = true;
      }, 400);
    }

    if (!this.fadeProgressBar || this.progressBarOpacity > 0) {
      ctx.save();
      if (this.fadeProgressBar) {
        this.progressBarOpacity -= 0.02;
        ctx.globalAlpha = Math.max(0, this.progressBarOpacity);
        if (this.progressBarOpacity <= 0) {
          this._showInstructions();
        }
      }

      // Draw Noodle Track (Background Groove)
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.beginPath();
      ctx.roundRect(loadingX, loadingY, barWidth, barHeight, barHeight / 2);
      ctx.fill();

      // Draw Active Noodle Strand Progress Bar
      if (currentNoodleLength > 8) {
        ctx.fillStyle = this.noodleColor.toRGBA();
        ctx.strokeStyle = this.noodleBorderColor.toRGBA();
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.roundRect(loadingX, loadingY, currentNoodleLength, barHeight, barHeight / 2);
        ctx.fill();
        ctx.stroke();

        // Fork Icon attached to tip of noodle progress
        ctx.font = "20px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🍴", loadingX + currentNoodleLength - 2, loadingY + barHeight / 2);
      }

      ctx.restore();
    }
  }

  override async onUserAction(): Promise<void> {
    await Util.delay(150, this.engine?.clock);
    this.canvas.flagDirty();
    await this._showPlayButton();
  }

  // ==========================================
  // DOM Creation & Styling
  // ==========================================

  private _showInstructions() {
    if (!document.getElementById("pasta-instructions")) {
      this._gameRootDiv.appendChild(this._instructionsDiv);
    }
  }

  private _createInstructions(): HTMLDivElement {
    const instructions = document.createElement("div");
    instructions.id = "pasta-instructions";
    instructions.style.position = "absolute";
    instructions.style.width = "90%";
    instructions.style.maxWidth = "600px";
    instructions.style.bottom = "30px";
    instructions.style.left = "50%";
    instructions.style.transform = "translateX(-50%)";
    instructions.style.textAlign = "center";
    instructions.style.fontFamily = "'Trebuchet MS', 'Segoe UI', sans-serif";
    instructions.style.fontSize = "14px";
    instructions.style.fontWeight = "bold";
    instructions.style.letterSpacing = "1px";
    instructions.style.color = "#FFF8E7";
    instructions.style.zIndex = "1001";
    instructions.style.textShadow = "0 2px 4px rgba(0,0,0,0.8)";

    // Keyboard-focused control prompts matching your itch page
    const instructionStrings: string[] = [
      "🍝 MATCH INGREDIENTS • CONNECT NOODLE CHAINS",
      "⌨️ MOVE: A/D OR ARROWS | SOFT DROP: S OR DOWN",
      "🔄 ROTATE PIECE: W OR UP ARROW",
      "🔊 MUTE / MUSIC TOGGLE: CLICK AUDIO ICON",
    ];
    let instructionIndex = 0;
    instructions.innerText = instructionStrings[0];

    this._instructionInterval = setInterval(() => {
      instructionIndex = (instructionIndex + 1) % instructionStrings.length;
      instructions.innerText = instructionStrings[instructionIndex];
    }, 2800);

    return instructions;
  }

  private async _showPlayButton(): Promise<void> {
    this._playButton.style.display = "block";
    await Util.delay(150, this.engine?.clock);
    this._gameRootDiv.appendChild(this._playButton);

    return new Promise<void>(resolve => {
      const startButtonHandler = (e: Event) => {
        e.stopPropagation();
        e.preventDefault();
        this._playButton.removeEventListener("click", startButtonHandler);
        this.dispose();
        resolve();
      };
      this._playButton.addEventListener("click", startButtonHandler);
    });
  }

  private _createPlayButton(): HTMLButtonElement {
    const button = document.createElement("button");
    button.id = "excalibur-play";
    button.style.position = "absolute";
    button.style.width = "160px";
    button.style.height = "56px";
    button.style.top = "62%";
    button.style.left = "50%";
    button.style.transform = "translate(-50%, -50%)";
    button.style.fontFamily = "'Impact', 'Trebuchet MS', sans-serif";
    button.style.fontSize = "22px";
    button.style.letterSpacing = "2px";
    button.style.display = "none";
    button.style.zIndex = "1000";
    button.innerText = "SERVE! 🍝";

    // Tomato Sauce Red Styling
    button.style.border = "3px solid #FFF8E7";
    button.style.borderRadius = "28px";
    button.style.backgroundColor = "#D32F2F";
    button.style.color = "#FFF8E7";
    button.style.cursor = "pointer";
    button.style.boxShadow = "0 6px 16px rgba(0,0,0,0.5)";
    button.style.transition = "transform 0.1s ease, background-color 0.2s ease";

    button.onmouseover = () => {
      button.style.backgroundColor = "#E53935";
      button.style.transform = "translate(-50%, -52%) scale(1.04)";
    };
    button.onmouseout = () => {
      button.style.backgroundColor = "#D32F2F";
      button.style.transform = "translate(-50%, -50%) scale(1.0)";
    };

    return button;
  }

  private _createGameTitle(): HTMLDivElement {
    const titleContainer = document.createElement("div");
    titleContainer.style.position = "absolute";
    titleContainer.style.width = "90%";
    titleContainer.style.maxWidth = "550px";
    titleContainer.style.top = "32%";
    titleContainer.style.left = "50%";
    titleContainer.style.transform = "translate(-50%, -50%)";
    titleContainer.style.textAlign = "center";
    titleContainer.style.zIndex = "1001";
    this._gameRootDiv.appendChild(titleContainer);

    // Main Title Text
    const mainTitle = document.createElement("h1");
    mainTitle.innerText = "PASTA CASCADE";
    mainTitle.style.margin = "0";
    mainTitle.style.fontFamily = "'Arial Black', 'Impact', sans-serif";
    mainTitle.style.fontSize = "44px";
    mainTitle.style.color = "#ff3063";
    mainTitle.style.letterSpacing = "3px";
    mainTitle.style.textShadow = "0 4px 8px rgba(0,0,0,0.8), 0 0 12px #D32F2F";
    titleContainer.appendChild(mainTitle);

    // Topping Icons
    const subTitle = document.createElement("p");
    subTitle.innerText = "🍅 🌿 🧀 🧄 🧆";
    subTitle.style.margin = "8px 0 0 0";
    subTitle.style.fontSize = "22px";
    subTitle.style.letterSpacing = "6px";
    titleContainer.appendChild(subTitle);

    return titleContainer;
  }

  private _createExcaliburAttribute(): HTMLDivElement {
    const attr = document.createElement("div");
    attr.style.position = "absolute";
    attr.style.top = "15px";
    attr.style.left = "50%";
    attr.style.transform = "translateX(-50%)";
    attr.style.textAlign = "center";
    attr.style.fontFamily = "'Trebuchet MS', sans-serif";
    attr.style.fontSize = "12px";
    attr.style.color = "rgba(255, 248, 231, 0.6)";
    attr.style.zIndex = "1001";
    attr.innerText = "Built with Excalibur.js";
    this._gameRootDiv.appendChild(attr);

    return attr;
  }

  private _positionAndSizeRoot(rootDiv: HTMLDivElement) {
    if (!document.getElementById("pasta-cascade-loader-root")) {
      document.body.appendChild(rootDiv);
      rootDiv.id = "pasta-cascade-loader-root";
      rootDiv.style.position = "absolute";
      rootDiv.style.overflow = "hidden";
      rootDiv.style.pointerEvents = "auto";
    }

    if (this.engine) {
      const { x: left, y: top, width: screenWidth, height: screenHeight } = this.engine.canvas.getBoundingClientRect();
      rootDiv.style.left = `${left}px`;
      rootDiv.style.top = `${top}px`;
      rootDiv.style.width = `${screenWidth}px`;
      rootDiv.style.height = `${screenHeight}px`;
    }
  }

  public dispose() {
    if (this._instructionInterval) {
      clearInterval(this._instructionInterval);
    }
    this._gameRootDiv.remove();
  }
}
