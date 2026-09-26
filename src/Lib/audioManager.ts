// audioManager.ts
import { Random, Sound } from "excalibur";
import { Resources } from "../resources";

const SFX_MUTE_STORAGE_KEY = "sfx_pasta_cascade_muted";
const BGM_MUTE_STORAGE_KEY = "bgm_pasta_cascade_muted";

export class AudioManager {
  private static rng: Random = new Random();
  private static isBGMMuted: boolean = false;
  private static isSFXMuted: boolean = false;
  private static currentSND: Sound | null = null;
  private static musicList: Sound[] = [];
  private static currentIndex: number = 0; // Track current track index

  public static init(): void {
    try {
      const savedSFXMute = localStorage.getItem(SFX_MUTE_STORAGE_KEY);
      const savedBGMMute = localStorage.getItem(BGM_MUTE_STORAGE_KEY);
      this.isSFXMuted = savedSFXMute === "true";
      this.isBGMMuted = savedBGMMute === "true";
    } catch {
      this.isBGMMuted = false;
      this.isSFXMuted = false;
    }

    this.musicList.push(Resources.music_blossom);
    this.musicList.push(Resources.music_boss);
    this.musicList.push(Resources.music_journey);
    this.musicList.push(Resources.music_regrowth);
    this.musicList.push(Resources.music_shop);
    this.musicList.push(Resources.music_start);
    this.musicList.push(Resources.music_town);
    this.musicList.push(Resources.music_yeah);
    this.playRandomBGM();
    this.applyMuteState();
  }

  public static toggleBGMMute(): boolean {
    this.isBGMMuted = !this.isBGMMuted;
    console.log("toggling bgm", this.isBGMMuted);
    try {
      localStorage.setItem(BGM_MUTE_STORAGE_KEY, this.isBGMMuted.toString());
    } catch (err) {
      console.warn("Failed to save audio mute state:", err);
    }
    this.applyMuteState();
    return this.isBGMMuted;
  }

  public static getIsBGMMuted(): boolean {
    return this.isBGMMuted;
  }
  public static getIsSFXMuted(): boolean {
    return this.isSFXMuted;
  }

  public static toggleSFXMute(): boolean {
    this.isSFXMuted = !this.isSFXMuted;
    try {
      localStorage.setItem(SFX_MUTE_STORAGE_KEY, this.isSFXMuted.toString());
    } catch (err) {
      console.warn("Failed to save audio mute state:", err);
    }
    this.applyMuteState();
    return this.isSFXMuted;
  }

  private static applyMuteState(): void {
    if (this.isBGMMuted) {
      this.currentSND?.pause();
    } else {
      this.currentSND?.play();
    }
  }

  public static playRandomBGM(): void {
    if (this.currentSND != null) this.currentSND?.stop();
    this.currentIndex = Math.floor(Math.random() * this.musicList.length);
    let snd = this.musicList[this.currentIndex];
    this.currentSND = snd;
    console.log("sound is picked", snd);
    if (!this.isBGMMuted) {
      snd.play();
    }
  }

  public static playNextBGM(): void {
    if (this.musicList.length === 0) return;

    if (this.currentSND != null) {
      this.currentSND.stop();
    }

    this.currentIndex = (this.currentIndex + 1) % this.musicList.length;
    this.currentSND = this.musicList[this.currentIndex];

    if (!this.isBGMMuted) {
      this.currentSND.play();
    }
  }
}
