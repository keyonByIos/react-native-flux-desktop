/**
 * Seed Token — the root design tokens a user can directly override.
 * Everything else (Map / Alias / Component tokens) is derived from these,
 * mirroring Ant Design 5's token pyramid.
 */
export interface SeedToken {
    /** Primary brand color. Drives buttons, links, selection, focus rings. */
    colorPrimary: string;
    /** Functional success color. */
    colorSuccess: string;
    /** Functional warning color. */
    colorWarning: string;
    /** Functional error / danger color. */
    colorError: string;
    /** Informational accent color. */
    colorInfo: string;
    /** Link color. Defaults to colorPrimary when unset. */
    colorLink: string;
    /** Root text color. Fade steps derive colorText / Secondary / ... */
    colorTextBase: string;
    /** Root background color. Derives colorBgContainer / Elevated / Layout. */
    colorBgBase: string;
    /** Base font family name. */
    fontFamily: string;
    /** Base font size (px). Also the anchor for the size scale. */
    fontSize: number;
    /** Base line-height multiplier (unitless). */
    lineHeight: number;
    /** Base border radius (px). Derives XS / SM / LG / FULL. */
    borderRadius: number;
    /** Default border width (px). */
    lineWidth: number;
    /** Solid border style string used by RN BorderStyle. */
    lineType: 'solid';
    /** Step used to derive the spacing size scale (px). */
    sizeStep: number;
    /** Unit used for size scale derivation (px). */
    sizeUnit: number;
    /** Base interactive control height (px). Derives LG / SM / XS. */
    controlHeight: number;
    /** Base motion duration (s). */
    motionUnit: number;
    /** Easing curve for standard transitions (kept for parity / web export). */
    motionEaseInOut: string;
    /** Whether to generate extra debug usage tokens. */
    wireframe: boolean;
}
