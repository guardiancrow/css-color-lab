export interface DisplayColorValue {
  label: string;
  value: string;
}

/**
 * Phase 2 will define the canonical color representation here, after evaluating
 * conversion libraries and precision requirements. The application must keep
 * one canonical current-color state; Hex, HSL, XYZ, Oklab, and other views are
 * derived values, never independent mutable states.
 */
export type CanonicalColor = unknown;
