import { Random } from "excalibur";

export interface MarbleBagOptions<T> {
  random?: Random;
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

  public add(item: T, count: number = 1): this {
    for (let i = 0; i < count; i++) {
      this._template.push(item);
    }
    return this;
  }

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

  public refill(): void {
    this._currentBag = [...this._template];
    this.shuffle();
  }

  public shuffle(): void {
    this._currentBag = this._random.shuffle(this._currentBag);
  }

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

  public peek(): T | undefined {
    if (this._currentBag.length === 0 && this._autoRefill && this._template.length > 0) {
      this.refill();
    }
    return this._currentBag[this._currentBag.length - 1];
  }

  public get remaining(): number {
    return this._currentBag.length;
  }
  public get capacity(): number {
    return this._template.length;
  }
  public clear(): void {
    this._template.length = 0;
    this._currentBag.length = 0;
  }
}
