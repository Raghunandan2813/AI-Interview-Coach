/**
 * Backdrop for the sign-in / sign-up screens.
 *
 * Replaces the falling tech-word field, which drew the eye away from the one
 * thing on the page that matters. This is entirely static CSS — no JS, no
 * randomness, nothing to hydrate — so the form paints immediately and the
 * background never competes with it.
 *
 * Three layers: two Arena aurora blooms, a masked grid for depth, and a
 * vignette that pushes focus to the centre.
 */
export default function AuthBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-dark-100">
      {/* aurora — cyan from the top left, heat from the bottom right */}
      <div
        className="absolute -top-1/3 -left-1/4 size-[70vw] max-w-[900px] rounded-full blur-[130px] opacity-45"
        style={{ background: "radial-gradient(circle, #00E1F0 0%, transparent 65%)" }}
      />
      <div
        className="absolute -bottom-1/3 -right-1/4 size-[65vw] max-w-[820px] rounded-full blur-[130px] opacity-40"
        style={{ background: "radial-gradient(circle, #FF2D78 0%, transparent 65%)" }}
      />
      <div
        className="absolute top-1/2 left-1/2 size-[40vw] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] opacity-25"
        style={{ background: "radial-gradient(circle, #7DF3FF 0%, transparent 70%)" }}
      />

      {/* grid, faded out toward the edges so it reads as depth rather than wallpaper */}
      <div
        className="absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 255 255 / 0.35) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgb(255 255 255 / 0.35) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 65% 55% at 50% 45%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 65% 55% at 50% 45%, black 30%, transparent 100%)",
        }}
      />

      {/* a single bright seam across the top edge */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(0 225 240 / 0.6) 35%, rgb(255 45 120 / 0.6) 65%, transparent)",
        }}
      />

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgb(13 10 15 / 0.75) 100%)",
        }}
      />
    </div>
  );
}
