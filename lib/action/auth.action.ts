
'use server';

import { db, auth } from "@/firebase/admin";
import { getSessionUser } from "@/lib/session";
import { cookies } from "next/headers";

const ONE_WEEK = 60*60*24*7;
export async function signUp(params: SignUpParams){
    const {uid , name , email} = params;
    try{
            const userRecord = await db.collection('users').doc(uid).get();
            if(userRecord.exists){
                return{
                    success : false,
                    message: 'User already exists. Please sign in instead.'
                }
            }
            await db.collection('users').doc(uid).set({
                name,  email
            })
            return{
                success: true,
                message : 'Account created successfully. Please Sign in.'
            }
    }catch(e : any){
        console.log('Error creating a user', e );
        if(e.code === 'auth/email-already-exists'){
            return{
                success: false,
                message: 'This email is already in use.'
            }
        }
        return {
            success: false,
            message: 'Failed to create an account '
        }

    }
}
 
export async function signIn(params: SignInParams){
    const { idToken } = params;
    try{
        // No getUserByEmail lookup here: the browser has already authenticated
        // and handed us an idToken, and createSessionCookie rejects an invalid
        // one. The extra round trip only slowed every sign-in down.
        await setSessionCookie(idToken)
        return {
            success: true,
            message: 'Signed in successfully.'
        }
    }catch(e){
        console.log(e);
        return{
            success: false,
            message: 'Failed to log into an account.'
        }
    }
}


export async function setSessionCookie(idToken : string){
    const cookieStore = await cookies();
    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: ONE_WEEK *1000
    })

  cookieStore.set('session', sessionCookie, {
    maxAge: ONE_WEEK,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: '/',
    sameSite : 'lax'
  })

}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  return { success: true };
}


// Thin wrapper over the request-cached implementation in lib/session.ts, so
// the twenty-odd callers across the app share one session lookup per request.
export async function getCurrentUser() : Promise<User | null> {
    return getSessionUser();
}


export async function isAuthenticated(){
    // No logging here: this runs on every auth-guarded render, and printing the
    // user object put email addresses into the server logs on every request.
    const user = await getCurrentUser();
    return !!user;
}
