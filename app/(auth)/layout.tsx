import React, { ReactNode } from 'react'
import Link from 'next/link'
import { isAuthenticated } from '@/lib/action/auth.action';
import { redirect } from 'next/navigation';
import AuthBackdrop from '@/components/AuthBackdrop';

const AuthLayout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (isUserAuthenticated) redirect('/home')

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AuthBackdrop />

      {/* a way back to the marketing site — the auth screens were a dead end */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 rounded-xl px-3 py-2
                   text-sm font-extrabold uppercase tracking-tight text-light-100
                   transition-colors hover:bg-white/5"
      >
        Interview <span className="heat-text">Coach</span>
      </Link>

      <div className="auth-layout relative z-10">{children}</div>
    </main>
  )
}

export default AuthLayout;
