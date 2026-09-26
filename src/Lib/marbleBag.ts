import { Random } from "excalibur";

export interface MarbleBagOptions<T> {
  /**
   * Optional custom Excalibur Random instance (e.g., engine.random).
   * If omitted, a standard Excalibur Random generator is initialized.
   */
  random?: Random;
  /**
   * If true, automatically refills and reshuffles the bag when drawing from an empty bag.
   * Default: true.
   */
  autoRefill?: boolean;
}

export class MarbleBag<T> {
  private readonly _template: T[] = [];
  private _currentBag: T[] = [];
  private _random: Random;
  private _autoRefill: boolean;

  constructor(options: MarbleBagOptions<T> = {}) {
    this._random = options.random ?? new Random();
    this._autoRefill = options.autoRefill ?? true;
  }

  /**
   * Adds an item to the base bag template.
   * @param item The value to store.
   * @param count The number of copies to add to the bag (default: 1).
   */
  public add(item: T, count: number = 1): this {
    for (let i = 0; i < count; i++) {
      this._template.push(item);
    }
    return this;
  }

  /**
   * Populates the base bag with a record map of items to quantities.
   * Example: bag.addMany({ 'fireball': 2, 'potion': 5 });
   */
  public addMany(items: Map<T, number> | Array<{ item: T; count: number }>): this {
    if (Array.isArray(items)) {
      for (const entry of items) {
        this.add(entry.item, entry.count);
      }
    } else {
      items.forEach((count, item) => this.add(item, count));
    }
    return this;
  }

  /**
   * Resets the active drawing pool using the configured template items and reshuffles it.
   */
  public refill(): void {
    this._currentBag = [...this._template];
    this.shuffle();
  }

  /**
   * Shuffles the current remaining items using Excalibur's Fisher-Yates implementation.
   */
  public shuffle(): void {
    this._currentBag = this._random.shuffle(this._currentBag);
  }

  /**
   * Draws and removes the next item from the bag.
   * Returns undefined if the bag is empty and autoRefill is disabled.
   */
  public draw(): T | undefined {
    if (this._currentBag.length === 0) {
      if (this._autoRefill && this._template.length > 0) {
        this.refill();
      } else {
        return undefined;
      }
    }

    return this._currentBag.pop();
  }

  /**
   * Peeks at the next item without removing it.
   */
  public peek(): T | undefined {
    if (this._currentBag.length === 0 && this._autoRefill && this._template.length > 0) {
      this.refill();
    }
    return this._currentBag[this._currentBag.length - 1];
  }

  /**
   * Number of items currently remaining in the active bag.
   */
  public get remaining(): number {
    return this._currentBag.length;
  }

  /**
   * Total number of items in the initial template.
   */
  public get capacity(): number {
    return this._template.length;
  }

  /**
   * Clears both the base template and active bag contents.
   */
  public clear(): void {
    this._template.length = 0;
    this._currentBag.length = 0;
  }
}
