"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { signOut } from "@/lib/action/auth.action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { User } from "firebase/auth"; // or your custom User type
// The custom user type likely has name, email, avatarUrl

interface UserDropdownProps {
  user: any; // Using any for now, or match it with your User type
}

const UserDropdown = ({ user }: UserDropdownProps) => {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.substring(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      toast.success("Signed out successfully.");
      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to sign out.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-9 w-9 border border-white/10 transition-transform hover:scale-105 active:scale-95">
          <AvatarImage src={user?.avatarUrl || ""} alt="User Avatar" className="object-cover" />
          <AvatarFallback className="bg-primary-300 text-dark-100 font-bold">
            {getInitials(user?.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-dark-200 border-white/10 text-light-100 mt-2 p-2 shadow-xl" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-white">{user?.name || "User"}</p>
            <p className="text-xs leading-none text-light-400">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/5 hover:text-white rounded-md transition-colors focus:bg-white/5 focus:text-white">
          <Link href="/dashboard" className="flex w-full">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="cursor-pointer text-red-400 focus:text-red-300 hover:text-red-300 hover:bg-red-400/10 focus:bg-red-400/10 rounded-md transition-colors"
        >
          {isSigningOut ? "Signing out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
