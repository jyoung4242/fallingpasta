const HIGH_SCORE_KEY = "pasta_cascade_high_score";

export class HighScoreManager {
  public static getHighScore(): number {
    try {
      const saved = localStorage.getItem(HIGH_SCORE_KEY);
      if (!saved) return 0;
      const score = parseInt(saved, 10);
      return isNaN(score) ? 0 : score;
    } catch {
      return 0;
    }
  }

  public static updateHighScore(score: number): boolean {
    const currentHighScore = this.getHighScore();
    if (score > currentHighScore) {
      try {
        localStorage.setItem(HIGH_SCORE_KEY, score.toString());
      } catch (err) {
        console.warn("Failed to save high score to localStorage:", err);
      }
      return true;
    }
    return false;
  }
}
