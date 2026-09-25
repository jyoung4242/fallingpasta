import { ShortCell } from "../src/Lib/BoardLoader";

/**
 * Test Scenario: Horizontal Spaghetti chain suspended over a Match-3 combo.
 * When the 3 Tomatoes below clear, gravity should drop the entire 3-block
 * Spaghetti cluster simultaneously without breaking links.
 */
export const SCENARIO_SPAGHETTI_CLUSTER_DROP: ShortCell[][] = [
  [".", ".", ".", ".", ".", "."],
  [".", ".", ".", ".", ".", "."],
  [".", ".", ".", ".", ".", "."], // 3-cell connected Spaghetti chain
  [".", "S-E", "S-H", "S-W", ".", "."], // Match-3 ready to trigger
  [".", "B", "C", "G", ".", "."], // Static base
  [".", "B", "C", "G", ".", "."],
];

/**
 * Test Scenario: L-shaped chain resting partially on static blocks and partially on a match.
 * Tests if `canClusterDrop` prevents uneven detachment.
 */
export const SCENARIO_UNEVEN_CLUSTER_SUPPORT: ShortCell[][] = [
  [".", ".", ".", ".", "."],
  [".", "S-E", "S-V", ".", "."], // L-shaped chain (Top-Left linked to Top-Right & Bottom-Right)
  [".", ".", "S-V", ".", "."],
  [".", "T", "T", "T", "."], // Match under left side only
  [".", "B", "B", "G", "."],
];
