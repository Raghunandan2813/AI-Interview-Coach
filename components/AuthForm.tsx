"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";

import { motion } from "framer-motion";
import { error } from "console";
import FormField from "./FormField";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, UserCredential } from "firebase/auth";
import { auth } from "@/firebase/client";
import { signUp , signIn} from "@/lib/action/auth.action";
const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};
type AuthFormProps = {
  type: "sign-in" | "sign-up";
};

const formSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

const AuthForm = ({ type }: AuthFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

 async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (type === "sign-up") {
        const {name , email, password} = values;
        const userCredentials = await createUserWithEmailAndPassword(auth, email , password)

        const result = await signUp({
          uid: userCredentials.user.uid,
          name: name!,
          email,
          password,
        })

        if(!result?.success){
          // The credential already exists at this point. Leaving it behind
          // creates an account that can never sign in, because there is no
          // matching user document. Roll it back.
          try {
            await userCredentials.user.delete();
          } catch (cleanupError) {
            console.error('Failed to roll back partial signup', cleanupError);
          }
          toast.error(result?.message ?? 'Could not create your account.');
          return;
        }

        toast.success('Account created successfully. Please sign in.');
        router.push('/sign-in')
      } else {
        const {email , password } = values ;

        const userCredential = await signInWithEmailAndPassword(auth , email , password );
        const idToken = await userCredential.user.getIdToken();
        if(!idToken){
          toast.error('Sign in failed')
          return;
        }

        const result = await signIn({ email, idToken })
        if(!result?.success){
          toast.error(result?.message ?? 'Sign in failed.');
          return;
        }

        toast.success('Signed in successfully.');
        router.push('/home')
      }
    } catch (error) {
      console.log(error);
      toast.error("There was an error");
    } finally {
      setIsLoading(false);
    }
  }
  async function handleGoogleSignIn() {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      const { uid, displayName, email } = userCredential.user;
      
      // Attempt to sign up (if they exist, this fails gracefully based on our action)
      await signUp({
        uid,
        name: displayName || "User",
        email: email || "",
        password: "", // Not used for Google Auth, but part of schema
      });

      // Get ID token and establish session
      const idToken = await userCredential.user.getIdToken();
      if (!idToken) {
        toast.error("Google Sign-In failed to get token.");
        return;
      }
      
      const result = await signIn({ email: email || "", idToken });
      if (!result?.success) {
        toast.error(result?.message ?? "Google Sign-In failed.");
        return;
      }

      toast.success("Signed in with Google successfully.");
      router.push("/home");
    } catch (error) {
      console.error(error);
      toast.error("There was an error with Google Sign-In.");
    } finally {
      setIsLoading(false);
    }
  }

  const isSignin = type === "sign-in";
  return (
    <motion.div
      // a short settle rather than a 50px drop — the form should feel placed,
      // not thrown onto the screen
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="card-border w-full sm:w-[460px] flex flex-col overflow-hidden max-sm:mx-4
                 bg-dark-200/80 backdrop-blur-2xl shadow-[0_28px_90px_-28px_rgba(0,0,0,0.95)]"
    >
      <div className="flex flex-col gap-6 fill-card-foreground py-10 px-6 sm:px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image src="/roboo.png" alt="" height={36} width={42} className="shrink-0" />
          <p className="eyebrow">Interview training</p>
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-light-100">
          {type === "sign-in" ? (
            <>Welcome <span className="heat-text">back</span></>
          ) : (
            <>Get in the <span className="heat-text">arena</span></>
          )}
        </h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full mt-2 form"
          >
            {!isSignin && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your name"
              />
            )}
            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="you@example.com"
            />
            <FormField
              control={form.control}
              name="password"
              label="Password"
              type="password"
              placeholder="•••••••• at least six digit"
              
            />

            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
               {isLoading ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Please wait...
                 </>
               ) : type === "sign-in" ? (
                 "Sign in"
               ) : (
                 "Create account"
               )}
            </Button>
          </form>
        </Form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-dark-200 px-2 text-light-400">Or continue with</span>
          </div>
        </div>

        <Button
          variant="outline"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-white text-dark-100 hover:bg-gray-200 hover:text-dark-100 border-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 text-dark-100 animate-spin" />
              Connecting to Google...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              Google
            </>
          )}
        </Button>

        <p className="text-center text-sm text-light-400 pt-1">
          {isSignin ? "No account yet?" : "Already have an account?"}
          <Link
            href={!isSignin ? "/sign-in" : "/sign-up"}
            className="font-semibold text-primary-200 hover:text-primary-100 ml-1 transition-colors"
          >
            {!isSignin ? "Sign in" : "Sign up"}
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default AuthForm;
