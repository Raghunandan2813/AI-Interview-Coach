import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `typescript.ignoreBuildErrors` was true, which meant `next build` printed
  // "Skipping validation of types" and shipped whatever compiled. Real type
  // errors reached production silently. Source currently passes `tsc --noEmit`,
  // so type checking is on. If a deploy ever blocks on this, fix the type
  // rather than turning it back off.
  //
  // The old `eslint` key was removed: Next 16 no longer supports it there and
  // warned "Unrecognized key(s) in object: 'eslint'" on every build.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    ],
  },
};

export default nextConfig;
