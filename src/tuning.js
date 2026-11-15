/*
 * tuning.js - every adjustable value for hand gestures and the camera,
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

// ---- Camera flight (clicking a cluster flies toward it) ----

// Flight speed (higher = faster; about 1 / seconds to get most of the way there).
export const FLY_SPEED = 3;

// ---- Performance ----

// Retina screens have 2 real pixels per CSS pixel, so the 3D scene would draw 4x
// as many pixels. Capping at 1.5 draws about 44% fewer while still looking sharp.
// Use 1 for the smoothest result on a slow machine, 2 for the sharpest.
export const RENDER_MAX_PIXEL_RATIO = 1.5;
