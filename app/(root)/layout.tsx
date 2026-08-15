import React, { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCurrentUser } from '@/lib/action/auth.action'
import { redirect } from 'next/navigation'
import UserDropdown from '@/components/UserDropdown'
import Sidebar from '@/components/Sidebar'
import SearchBar from '@/components/SearchBar'
import MobileNav from '@/components/MobileNav'

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in')
  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <nav className="flex items-center justify-between w-full px-6 py-3.5 border-b border-white/10 bg-dark-100/80 backdrop-blur-xl z-50 shrink-0 gap-2 sm:gap-4">
        <Link
          href="/home"
          className="group flex flex-row items-center gap-1 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/5 shrink-0"
        >
          <Image src="/roboo.png" alt="logo" width={60} height={32} className="shrink-0 w-[36px] sm:w-[52px] transition-transform group-hover:scale-105" />
          <span className="heat-text text-xl font-extrabold uppercase tracking-tight ml-2 max-sm:hidden">
            Interview Coach
          </span>
        </Link>
        <div className="flex-1 flex justify-center w-full max-w-2xl">
          <SearchBar />
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <UserDropdown user={user} />
        </div>
      </nav>
      
      <div className="flex flex-1 w-full overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-y-auto w-full" style={{ scrollbarWidth: 'none' }}>
          <section className="flex flex-col w-full py-10 px-8 max-sm:px-4 max-sm:pb-28 mx-auto max-w-7xl">
            {children}
          </section>
        </div>
        <MobileNav />
      </div>
    </main>
  )
}

export default RootLayout