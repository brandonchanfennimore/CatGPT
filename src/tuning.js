/*
 * tuning.js - every adjustable value for hand gestures and the radar modes,
 * in one place. Change a number here, save, and the app reloads with it.
 *
 * Units used below:
 *  - "video" = a fraction of the webcam picture (0..1 across or down).
 *  - "px"    = screen pixels.
 */

// ---- Hand shape detection (used by hands/gesture.js) ----

// A finger counts as straight when its tip is this much farther from the wrist
// than its middle joint (1.15 = 15% farther). This is the "pointing detection"
// knob too: pointing = index straight, the other three bent. Raise it if a
// half-bent finger counts as straight; lower it if pointing isn't recognised.
export const EXTEND_RATIO = 1.15;

// Smoothing of hand movement (0..1). Lower = smoother but laggier.
export const SMOOTHING = 0.4;

// Hand movements smaller than this (video) are ignored, to stop jitter.
export const DEAD_ZONE = 0.004;

// Fling: let go of a palm rotate while moving faster than this (video per
// second) and the globe keeps spinning.
export const MIN_FLING_SPEED = 0.15;
// How quickly the hand speed estimate follows the hand (0..1).
export const VELOCITY_SMOOTHING = 0.5;

// Two-finger swipe up (open/close the info view): rise at least this far
// (video height)...
export const SWIPE_UP_DISTANCE = 0.15;
// ...within this many milliseconds.
export const SWIPE_MAX_MS = 800;

// ---- Radar flashlight (Flashlight mode) ----

// Lens radius on screen (px): starting size and the slider/scroll-wheel limits.
export const LENS_RADIUS_PX = 110;
export const LENS_RADIUS_MIN_PX = 40;
export const LENS_RADIUS_MAX_PX = 260;
// Scroll wheel: how strongly one wheel "notch" resizes the lens.
export const LENS_WHEEL_SENSITIVITY = 0.0015;
// Soft edge of the revealed radar, as a fraction of the radius (0 = hard edge).
export const LENS_EDGE_SOFTNESS = 0.15;
// Smoothing of the fingertip position (0..1). Lower = steadier but laggier lens.
export const LENS_SMOOTHING = 0.35;
// The webcam picture is small, so the fingertip's position is magnified around
// the centre: 1.4 means a fingertip 70% of the way to the video edge reaches
// the screen edge. Raise it if you can't reach the screen corners.
export const POINTER_GAIN = 1.4;
// How fast the lens fades in/out over areas with/without radar data (per second).
export const LENS_FADE_SPEED = 8;

// ---- "Explore with radar" camera flight ----

// Zoom level to fly to (the "×" on the zoom bar).
export const RADAR_FLY_ZOOM = 2.5;
// Flight speed (higher = faster; about 1 / seconds to get most of the way there).
export const FLY_SPEED = 3;

// ---- Time curtain (Time mode) ----

// Smoothing of the divider following your open palm (0..1). Lower = steadier.
export const CURTAIN_SMOOTHING = 0.3;
// A palm moving sideways faster than this (video widths per second) is a
// "swipe": it steps to the next/previous date pair instead of moving the divider.
export const TIME_SWIPE_SPEED = 1.6;
// After a swipe, ignore further swipes for this long (ms): one swipe = one step.
export const TIME_SWIPE_COOLDOWN_MS = 700;
// How quickly the palm speed estimate follows the hand (0..1).
export const TIME_VELOCITY_SMOOTHING = 0.5;

// ---- Performance ----

// Retina screens have 2 real pixels per CSS pixel, so the 3D scene would draw 4x
// as many pixels. Capping at 1.5 draws about 44% fewer while still looking sharp.
// Use 1 for the smoothest result on a slow machine, 2 for the sharpest.
export const RENDER_MAX_PIXEL_RATIO = 1.5;
