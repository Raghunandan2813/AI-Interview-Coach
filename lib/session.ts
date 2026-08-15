import { cache } from "react";
import { cookies } from "next/headers";
import { auth, db } from "@/firebase/admin";

/**
 * Resolves the signed-in user from the session cookie.
 *
 * Wrapped in React's cache() so it runs at most once per request. Without it a
 * single dashboard render resolved the session four separate times — in the
 * layout, in the page, and again inside each server action it called — and
 * every one of those costs a revocation check against Google's servers plus a
 * Firestore read. Deduplicating is free: it's the same cookie in the same
 * request, so there is nothing to lose by only checking once.
 *
 * This lives outside the "use server" module on purpose. Everything exported
 * from there becomes a callable HTTP endpoint, and this is internal.
 */
export const getSessionUser = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    // checkRevoked stays on: a signed-out or disabled session must stop
    // working immediately. It costs a network call, but only once per request
    // now rather than once per caller.
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();

    if (!userRecord.exists) return null;

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch {
    // An expired or revoked cookie is normal, not exceptional. Logging the
    // full error here printed a stack trace on every signed-out request and
    // risked putting token fragments into the logs.
    return null;
  }
});
