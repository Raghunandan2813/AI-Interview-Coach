"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";

import { error } from "console";
import FormField from "./FormField";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/client";
import { signUp , signIn} from "@/lib/action/auth.action";
import { UserCredential } from "firebase/auth";
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
    try {
      if (type === "sign-up") {
         
          if(type === 'sign-up'){
            const {name , email, password} = values;
            const userCredentials = await createUserWithEmailAndPassword(auth, email , password)
          
           const result = await signUp({
            uid: userCredentials.user.uid,
            name: name!,
            email,
            password,
          })
            if(!result?.success){
            toast.error(result?.message);
            return;
          }
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
        await signIn({
          email, idToken
        })
        toast.success('Sign in successfully.');
        router.push('/')

        
      }
    } catch (error) {
      console.log(error);
      toast.error("There was an error");
    }
  }
  const isSignin = type === "sign-in";
  return (
    <div className="card-border lg:min-w-[480px] flex flex-col overflow-hidden">
      <div className="flex flex-col gap-6 fill-card-foreground py-10 px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image src="/roboo.svg" alt="logo" height={36} width={42} className="shrink-0" />
          <p className="text-sm font-medium text-primary-200">Boost Your Prep With AI</p>
        </div>

        <h2 className="text-2xl font-semibold text-light-100">
          {type === "sign-in" ? "Sign in" : "Create account"}
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
              placeholder="••••••••"
            />

            <Button type="submit" className="w-full mt-2">
              {type === "sign-in" ? "Sign in" : "Create account"}
            </Button>
          </form>
        </Form>
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
    </div>
  );
};

export default AuthForm;
